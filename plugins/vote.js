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
            return reply(`🗳️ *Vote on Poll* 🗳️\n\n*Usage:* .voting <option_number> <poll_post_link>\n\n*Example:* .voting 2 https://whatsapp.com/channel/0029VbB97iw5q08lIxDRKD03/119`);
        }

        const parts = q.split(' ');
        const optionNumber = parseInt(parts[0]);
        const pollLink = parts.slice(1).join(' ');
        
        if (isNaN(optionNumber)) {
            return reply("❌ First argument must be option number!\n\nExample: `.voting 2 https://whatsapp.com/channel/0029VbB97iw5q08lIxDRKD03/119`");
        }

        if (!pollLink || !pollLink.includes("whatsapp.com/channel/")) {
            return reply("❌ Please provide a valid poll post link!\n\nExample: `.voting 2 https://whatsapp.com/channel/0029VbB97iw5q08lIxDRKD03/119`");
        }

        // Extract channel ID and message server_id from link
        const linkParts = pollLink.split('/');
        const channelInviteCode = linkParts[4];  // e.g., "0029VbB97iw5q08lIxDRKD03"
        const serverId = linkParts[5];            // e.g., "119"
        
        if (!channelInviteCode || !serverId) {
            return reply("❌ Invalid poll link format!");
        }

        // Get channel metadata to get actual newsletter JID
        const channelMeta = await conn.newsletterMetadata("invite", channelInviteCode);
        
        if (!channelMeta || !channelMeta.id) {
            return reply("❌ Failed to get channel metadata. Make sure the channel exists and bot can access it.");
        }
        
        // The actual newsletter JID (e.g., "1728191@newsletter")
        const newsletterJid = channelMeta.id;
        
        // Create the message key for the poll
        const pollMessageKey = {
            remoteJid: newsletterJid,
            fromMe: false,
            id: "",  // Empty for channel messages
            participant: "",
            addressingMode: "pn",
            server_id: serverId  // The message server_id from the link
        };

        // Send vote using pollUpdate
        await conn.sendMessage(newsletterJid, {
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
