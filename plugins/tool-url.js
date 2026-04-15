// plugins/tourl.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);

// Helper function to format bytes
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get correct file extension from mime type
function getExtension(mimeType) {
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return '.jpg';
  if (mimeType.includes('png')) return '.png';
  if (mimeType.includes('webp')) return '.webp';
  if (mimeType.includes('mp4')) return '.mp4';
  if (mimeType.includes('mpeg')) return '.mp3';
  if (mimeType.includes('ogg')) return '.ogg';
  if (mimeType.includes('m4a')) return '.m4a';
  if (mimeType.includes('wav')) return '.wav';
  return '.mp4';
}

// Upload to Uguu first
async function uploadToUguu(buffer, extension) {
  const tempFilePath = path.join(os.tmpdir(), `uguu_${Date.now()}${extension}`);
  fs.writeFileSync(tempFilePath, buffer);
  
  const form = new FormData();
  form.append('files[]', fs.createReadStream(tempFilePath), `file${extension}`);
  
  const response = await axios.post('https://uguu.se/upload.php', form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0'
    },
    timeout: 60000
  });
  
  fs.unlinkSync(tempFilePath);
  
  if (!response.data || !response.data.files || !response.data.files[0] || !response.data.files[0].url) {
    throw new Error("Failed to upload to Uguu");
  }
  
  return response.data.files[0].url;
}

// Upload URL to Catbox
async function uploadToCatbox(url) {
  const form = new FormData();
  form.append('reqtype', 'urlupload');
  form.append('url', url);
  
  const response = await axios.post('https://catbox.moe/user/api.php', form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0'
    },
    timeout: 60000
  });
  
  const mediaUrl = response.data.trim();
  
  if (!mediaUrl || mediaUrl.toLowerCase().includes('error')) {
    throw new Error("Catbox upload failed");
  }
  
  return mediaUrl;
}

// Main command
cmd({
  pattern: "tourl",
  alias: ["imgtourl", "imgurl", "url", "geturl", "upload"],
  react: '🖇',
  desc: "Convert media to Catbox URL",
  category: "utility",
  use: ".tourl [reply to media]",
  filename: __filename
}, async (client, message, m, { from, reply, isCreator }) => {
  try {
    // Check if quoted message exists
    if (!m.quoted) {
      return reply("*🍁 Please reply to an image, video, or audio message!*");
    }

    const mimeType = m.quoted.mimetype || '';
    
    if (!mimeType) {
      return reply("*❌ Please reply to a valid media file!*");
    }

    // Determine media type
    let mediaType = 'File';
    let messageType = '';
    if (mimeType.includes('image')) {
      mediaType = 'Image';
      messageType = 'image';
    } else if (mimeType.includes('video')) {
      mediaType = 'Video';
      messageType = 'video';
    } else if (mimeType.includes('audio')) {
      mediaType = 'Audio';
      messageType = 'audio';
    } else {
      return reply("*❌ Only image, video, and audio files are supported!*");
    }

    // Download using Baileys' native method (decrypts properly)
    const stream = await downloadMediaMessage(
      m.quoted,
      messageType,
      {},
      { 
        logger: console,
        reuploadRequest: client.updateMediaMessage
      }
    );

    // Convert stream to buffer
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    if (!buffer || buffer.length === 0) {
      throw new Error("Failed to download media");
    }

    // Get correct extension
    const extension = getExtension(mimeType);
    
    // Step 1: Upload to Uguu
    const uguuUrl = await uploadToUguu(buffer, extension);
    
    // Step 2: Upload Uguu URL to Catbox
    const mediaUrl = await uploadToCatbox(uguuUrl);

    await reply(
      `*${mediaType} Uploaded Successfully*\n\n` +
      `*Size:* ${formatBytes(buffer.length)}\n` +
      `*URL:* ${mediaUrl}\n\n` +
      `> © Uploaded by JawadTechX 💜`
    );

  } catch (error) {
    console.error("Tourl Error:", error);
    await reply(`❌ Error: ${error.message || error}`);
  }
});
