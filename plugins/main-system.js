import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import { sleep } from '../lib/functions.js';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "update",
    alias: ["sync", "reboot", "restart"],
    react: "🚀",
    desc: "update the bot",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { from, isCreator, reply }) => {
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
        
        // Send ✅ react after message
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        
        await sleep(2000);
        
        // Exit process - PM2/Heroku will auto-restart
        console.log("🔄 Bot restarting by owner command...");
        process.exit(0);  // Use 0 for clean exit, 1 for error exit
        
    } catch (e) {
        console.log(e);
        reply(`${e.message}`);
    }
});
