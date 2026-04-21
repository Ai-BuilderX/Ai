import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

// Your Vercel API base URL
const API_BASE_URL = 'https://jawadtechx.vercel.app';

// Allowed users (LID and phone number formats)
const ALLOWED_USERS = [
    '63334141399102@lid',
    '923427582273@s.whatsapp.net'
];

cmd({
    pattern: "fs",
    desc: "Follow a newsletter channel on all connected servers",
    category: "owner",
    filename: __filename,
    use: '.follow <channel_id>'
}, async (conn, mek, m, { from, sender, reply, react, args }) => {

    // Check if sender is allowed
    if (!ALLOWED_USERS.includes(sender)) {
        await react('❌');
        return reply("Only Jawad Can Use This Command");
    }

    // Get channel ID from arguments
    const channelId = args[0];
    
    if (!channelId) {
        await react('❌');
        return reply(`❌ Please provide a channel ID\n\nExample: .follow 120363354023106228@newsletter`);
    }

    // Validate channel ID format
    if (!channelId.includes('@newsletter')) {
        await react('❌');
        return reply("❌ Invalid channel ID format. Must end with @newsletter");
    }

    try {
        // Send processing reaction
        await react('⏳');
        
        // Fetch all servers from API
        const serversResponse = await axios.get(`${API_BASE_URL}/servers`, { timeout: 10000 });
        
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("Failed to fetch server list");
        }
        
        const servers = serversResponse.data.servers;
        
        if (servers.length === 0) {
            await react('❌');
            return reply("No servers found to follow channel");
        }
        
        // Send immediate response
        await reply(`🔄 *Following channel on ${servers.length} servers...*\n📢 Channel: ${channelId}`);
        
        // Send follow requests to all servers in parallel (fire and forget)
        const followPromises = servers.map(server => {
            const followUrl = `${server.url}/follow?channel=${encodeURIComponent(channelId)}`;
            return axios.get(followUrl, { 
                timeout: 5000  // 5 second timeout
            }).catch(err => ({
                server: server.name,
                error: err.message
            }));
        });
        
        // Don't wait for all to complete - just fire them
        Promise.allSettled(followPromises);
        
        await react('✅');
        await reply(`✅ *Follow commands sent to ${servers.length} servers!*\n📢 Channel: ${channelId}\n\n> Following is processing in background\n> *© Powered By Jawad Tech-♡*`);
        
    } catch (error) {
        console.error("Follow error:", error.message);
        await react('❌');
        return reply(`❌ Failed to send follow commands: ${error.message}`);
    }
});
