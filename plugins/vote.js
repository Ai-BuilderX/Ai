// plugins/vote.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

// ==================== VOTE ON POLL ====================
cmd({
    pattern: "voting",
    alias: ["vote", "votepoll"],
    desc: "Vote on a poll using poll post link",
    category: "fun",
    react: "🗳️",
    use: ".voting <option_number> <poll_link>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply(`🗳️ *Vote on Poll* 🗳️\n\n*Usage:* .voting <option_number> <poll_post_link>\n\n*Example:* .voting 2 https://whatsapp.com/channel/1234567890/113`);
        }

        const parts = q.split(' ');
        const optionNumber = parseInt(parts[0]);
        const pollLink = parts.slice(1).join(' ');
        
        if (isNaN(optionNumber)) {
            return reply("❌ First argument must be option number!\n\nExample: `.voting 2 https://whatsapp.com/channel/1234567890/113`");
        }

        if (!pollLink || !pollLink.includes("whatsapp.com/channel/")) {
            return reply("❌ Please provide a valid poll post link!\n\nExample: `.voting 2 https://whatsapp.com/channel/1234567890/113`");
        }

        // Extract channel ID and server_id from link
        const linkParts = pollLink.split('/');
        const channelId = linkParts[4];
        const serverId = linkParts[5];  // This is the server_id, not message ID
        
        if (!channelId || !serverId) {
            return reply("❌ Invalid poll link format!");
        }

        // Construct the target JID for the channel
        const channelJid = `${channelId}@newsletter`;
        
        // Create the message key with server_id (as shown in your example)
        const pollMessageKey = {
            remoteJid: channelJid,
            fromMe: false,
            id: "",  // ID can be empty for channel messages
            participant: "",
            addressingMode: "pn",
            server_id: serverId  // This is the key field for channels!
        };

        // Send vote using pollUpdate
        await conn.sendMessage(channelJid, {
            pollUpdate: {
                pollCreationMessageKey: pollMessageKey,
                vote: {
                    selectedOptions: [optionNumber.toString()]
                }
            }
        });
        
        await reply(`✅ Voted for option ${optionNumber} on the poll!`);
        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error("Vote Error:", error);
        reply(`❌ Failed to vote: ${error.message}`);
    }
});
