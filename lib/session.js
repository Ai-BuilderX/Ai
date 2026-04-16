// lib/session.js - ESM Version (Base64 & MEGA Support, No zlib)
import fsSync from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { File } from 'megajs';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionDir = __dirname + '/sessions/';
const credsPath = path.join(sessionDir, 'creds.json');

// Create session directory if it doesn't exist
if (!fsSync.existsSync(sessionDir)) {
    fsSync.mkdirSync(sessionDir, { recursive: true });
}

// Session loading function (NO top-level await)
export async function loadSession() {
    try {
        if (!config.SESSION_ID) {
            console.log('No SESSION_ID provided - Pair From Pair Site ');
            return null;
        }

        // Check if creds.json already exists
        if (fsSync.existsSync(credsPath)) {
            console.log('[✅] Session file already exists, using existing session');
            return null;
        }

        console.log('[⏳] Checking SESSION_ID format...');
        
        // Handle MEGA format (DJ~)
        if (config.SESSION_ID.startsWith('DJ~')) {
            console.log('[🔰] Downloading MEGA.nz session...');
            const megaFileId = config.SESSION_ID.replace("JK~", "");
            
            const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);
            
            const data = await new Promise((resolve, reject) => {
                filer.download((err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
            
            fsSync.writeFileSync(credsPath, data);
            console.log('[✅] MEGA session downloaded successfully');
            return JSON.parse(data.toString());
        }
        
        // Handle Base64 format (IK~)
        if (config.SESSION_ID.startsWith('IK~')) {
            console.log('[🔰] Decoding Base64 session...');
            let b64data = config.SESSION_ID.substring(3).replace(/\.\.\./g, '');
            const decodedData = Buffer.from(b64data, 'base64').toString('utf-8');
            fsSync.writeFileSync(credsPath, decodedData);
            console.log('[✅] Base64 session loaded successfully');
            return JSON.parse(decodedData);
        }
        
        console.log('[❌] Unknown SESSION_ID format. Must start with DJ~ or IK~');
        return null;
        
    } catch (error) {
        console.error('[❌] Error loading session:', error.message);
        console.log('Pair From Pair Site');
        return null;
    }
}

export default loadSession;
