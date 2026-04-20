// KHAN MD 

import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import { sleep } from '../lib/functions.js';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "update",
    alias: ["sync", "reboot", "restart"],
    react: "🚀",
    desc: "update the bot",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, {
    from, reply, isCreator
}) => {
    try {
        if (!isCreator) {
            return reply("🚫 *This command is only for the bot owner (creator).*");
        }

        // Send react immediately
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        
        await sleep(800);
        
        // Send update message
        await reply("*♻️ Updating and restarting the bot*...");
        
        await sleep(800);
        
        // Send ✅ react
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        
        await sleep(2000);
        
        // Restart using PM2 (from your package.json)
        exec("pm2 restart KHAN-MD", (error, stdout, stderr) => {
            if (error) {
                console.error(`Restart error: ${error}`);
                return;
            }
            console.log(`Restart output: ${stdout}`);
        });
        
    } catch (e) {
        console.log(e);
        reply(`${e}`);
    }
});
