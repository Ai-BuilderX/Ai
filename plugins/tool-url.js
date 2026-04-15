// plugins/tourl.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import os from 'os';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);

// Helper function to format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get extension from mime type
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

cmd({
    pattern: "tourl",
    alias: ["imgtourl", "imgurl", "url", "geturl", "upload"],
    react: "🖇",
    desc: "Convert media to Catbox URL (via Uguu)",
    category: "utility",
    use: ".tourl [reply to media]",
    filename: __filename
}, async (client, message, args, { reply }) => {
    try {
        // Get quoted message - try different methods
        let quotedMsg = null;
        let mimeType = '';
        
        // Method 1: Direct quoted
        if (message.quoted) {
            quotedMsg = message.quoted;
            mimeType = quotedMsg.mimetype || '';
        }
        
        // Method 2: From contextInfo
        if (!quotedMsg && message.msg?.contextInfo?.quotedMessage) {
            const quoted = message.msg.contextInfo.quotedMessage;
            const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage'];
            for (const type of mediaTypes) {
                if (quoted[type]) {
                    quotedMsg = quoted[type];
                    mimeType = quotedMsg.mimetype || '';
                    break;
                }
            }
        }
        
        // Method 3: Message itself is media
        if (!quotedMsg && message.mtype && ['imageMessage', 'videoMessage', 'audioMessage'].includes(message.mtype)) {
            quotedMsg = message.msg || message;
            mimeType = quotedMsg.mimetype || '';
        }
        
        if (!quotedMsg || !mimeType) {
            return reply("*🍁 Please reply to an image, video, or audio message!*");
        }

        // Download media
        let mediaBuffer = null;
        
        if (message.quoted?.download) {
            mediaBuffer = await message.quoted.download();
        } else if (quotedMsg.download) {
            mediaBuffer = await quotedMsg.download();
        } else {
            return reply("*❌ Cannot download media. Please try again.*");
        }
        
        if (!mediaBuffer || mediaBuffer.length === 0) {
            throw new Error("Downloaded media is empty");
        }

        const extension = getExtension(mimeType);
        const tempFilePath = path.join(os.tmpdir(), `uguu_${Date.now()}${extension}`);
        fs.writeFileSync(tempFilePath, mediaBuffer);

        // Step 1: Upload to Uguu
        const uguuForm = new FormData();
        uguuForm.append('files[]', fs.createReadStream(tempFilePath), `file${extension}`);

        const uguuResponse = await axios.post('https://uguu.se/upload.php', uguuForm, {
            headers: {
                ...uguuForm.getHeaders(),
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 60000
        });

        if (!uguuResponse.data || !uguuResponse.data.files || !uguuResponse.data.files[0] || !uguuResponse.data.files[0].url) {
            fs.unlinkSync(tempFilePath);
            throw new Error("Failed to upload to Uguu");
        }

        const uguuUrl = uguuResponse.data.files[0].url;

        // Step 2: Upload Uguu URL to Catbox
        const catboxForm = new FormData();
        catboxForm.append('reqtype', 'urlupload');
        catboxForm.append('url', uguuUrl);

        const catboxResponse = await axios.post('https://catbox.moe/user/api.php', catboxForm, {
            headers: {
                ...catboxForm.getHeaders(),
                'User-Agent': 'Mozilla/5.0'
            },
            timeout: 60000
        });

        fs.unlinkSync(tempFilePath);

        const mediaUrl = catboxResponse.data.trim();

        if (!mediaUrl || mediaUrl.toLowerCase().includes('error')) {
            throw new Error("Catbox upload failed");
        }

        // Determine media type
        let mediaType = 'File';
        if (mimeType.includes('image')) mediaType = 'Image';
        else if (mimeType.includes('video')) mediaType = 'Video';
        else if (mimeType.includes('audio')) mediaType = 'Audio';

        await reply(
            `*${mediaType} Uploaded Successfully*\n\n` +
            `*Size:* ${formatBytes(mediaBuffer.length)}\n` +
            `*URL:* ${mediaUrl}\n\n` +
            `> © Uploaded by JawadTechX 💜`
        );

    } catch (error) {
        console.error("Tourl Error:", error);
        await reply(`❌ Error: ${error.message || error}`);
    }
});
