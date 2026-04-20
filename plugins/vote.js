// plugins/vote.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

// ==================== VOTE ON POLL ====================
cmd({
    pattern: "voting",
    alias: ["vote", "votepoll"],
    desc: "Vote on a poll using channel JID and server ID",
    category: "fun",
    react: "🗳️",
    use: ".voting <option_number>,<channel_jid>/<server_id>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) {
            return reply(`🗳️ *Vote on Poll* 🗳️\n\n*Usage:* .voting <option_number>,<channel_jid>/<server_id>\n\n*Example:* .voting 1,120363407122137326@newsletter/119`);
        }

        // Parse format: "1,120363407122137326@newsletter/119"
        const [optionPart, targetPart] = q.split(',');
        const optionNumber = parseInt(optionPart);
        
        if (isNaN(optionNumber)) {
            return reply("❌ First argument must be option number!\n\nExample: `.voting 1,120363407122137326@newsletter/119`");
        }
        
        if (!targetPart) {
            return reply("❌ Please provide channel JID and server ID!\n\nExample: `.voting 1,120363407122137326@newsletter/119`");
        }
        
        // Parse channel JID and server ID from "120363407122137326@newsletter/119"
        const [channelJid, serverId] = targetPart.split('/');
        
        if (!channelJid || !serverId) {
            return reply("❌ Invalid format! Use: `channel_jid/server_id`\n\nExample: `120363407122137326@newsletter/119`");
        }
        
        if (!channelJid.includes('@newsletter')) {
            return reply("❌ Channel JID must end with @newsletter!\n\nExample: `120363407122137326@newsletter`");
        }
        
        // Create the message key for the poll
        const pollMessageKey = {
            remoteJid: channelJid,
            fromMe: false,
            id: "",
            participant: "",
            addressingMode: "pn",
            server_id: serverId
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
