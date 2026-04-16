import fsSync from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import { File } from 'megajs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadSession(sessionDir, config) {
    try {
        if (!config.SESSION_ID) {
            console.log('No SESSION_ID provided - QR login will be generated');
            return false;
        }

        console.log('[⏳] CHECKING SESSION_ID FORMAT...');
        
        const credsPath = path.join(sessionDir, 'creds.json');
        
        // Handle MEGA format (IK~)
        if (config.SESSION_ID.startsWith('IK~')) {
            console.log('[🔰] Downloading MEGA.nz session...');
            const megaFileId = config.SESSION_ID.replace("IK~", "");
            
            const filer = File.fromURL(`https://mega.nz/file/${megaFileId}`);
            
            const data = await new Promise((resolve, reject) => {
                filer.download((err, data) => {
                    if (err) reject(err);
                    else resolve(data);
                });
            });
            
            fsSync.writeFileSync(credsPath, data);
            console.log('[✅] MEGA session downloaded successfully');
            return true;
        }
        
        // Handle Base64 format (IK~) - No zlib, just decode
        if (config.SESSION_ID.startsWith('IK~')) {
            console.log('🔁 DETECTED BASE64 SESSION FORMAT');
            let b64data = config.SESSION_ID.substring(3).replace(/\.\.\./g, '');
            const decodedData = Buffer.from(b64data, 'base64').toString('utf-8');
            
            // Write directly to creds.json
            fsSync.writeFileSync(credsPath, decodedData);
            console.log("✅ Base64 Session written to file");
            return true;
        }
        
        console.log('❌ Unknown SESSION_ID format. Must start with IK~ or IK~');
        return false;
        
    } catch (error) {
        console.error('❌ Error loading session:', error.message);
        return false;
    }
}

export default loadSession;
