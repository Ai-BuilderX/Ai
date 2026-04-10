// plugins/pair.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get pairing code for KHAN-MD bot",
    category: "owner",
    use: ".pair 923427582XXX",
    filename: __filename
}, async (conn, mek, m, { from, q, senderNumber, reply }) => {
    try {
        // Extract phone number from command
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        // Validate phone number format
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Please provide a valid phone number without `+`\nExample: `.pair 923427582XXX`");
        }

        // Make API request to get pairing code
        const response = await axios.get(`https://khanmd-pair.onrender.com/code?number=${encodeURIComponent(phoneNumber)}`);

        if (!response.data || !response.data.code) {
            return await reply("❌ Failed to retrieve pairing code. Please try again later.");
        }

        const pairingCode = response.data.code;
        const doneMessage = "> *KHAN-MD PAIRING COMPLETED*";

        // Send initial message with formatting
        await reply(`${doneMessage}\n\n*Your pairing code is:* ${pairingCode}`);

        // Optional 2-second delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Send clean code again
        await reply(`${pairingCode}`);

    } catch (error) {
        console.error("Pair command error:", error);
        await reply("❌ An error occurred while getting pairing code. Please try again later.");
    }
});

cmd({
    pattern: "pair2",
    alias: ["getpair2", "reqpair", "clonebot2"],
    react: "📉",
    desc: "Get pairing code for KHAN-MD bot",
    category: "utility",
    use: ".pair 923427582XXX",
    filename: __filename
}, async (conn, mek, m, { from, q, senderNumber, reply }) => {
    try {
        // React ⏳ while processing
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Invalid phone number format!\n\nPlease use: `.pair2 923000000000`\n(Without + sign)");
        }

        // Fetch pairing code
        const response = await axios.get(`https://khanmd-pair.onrender.com/code?number=${encodeURIComponent(phoneNumber)}`);
        if (!response.data?.code) {
            return await reply("❌ Failed to get pairing code. Please try again later.");
        }

        const pairingCode = response.data.code;

        // Define delay function
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        // Step 1 — send image message
        await conn.sendMessage(from, {
            image: { url: "https://files.catbox.moe/qfi0h5.jpg" },
            caption: `*Pairing Code For KHAN-MD* ⚡\n\nA notification has been sent to your WhatsApp. Please check your phone and copy this code to pair it and get your *KHAN-MD* session ID.\n\n*🔢 Pairing Code:* *${pairingCode}*\n\n> *Copy it from below message 👇🏻*`
        }, { quoted: m });

        // Step 2 — Wait for 2 seconds (to ensure order)
        await delay(2000);

        // Step 3 — Send only the pairing code
        const codeMsg = await conn.sendMessage(from, { text: pairingCode }, { quoted: m });

        // Step 4 — React ✅ after code is sent
        await conn.sendMessage(from, { react: { text: "✅", key: codeMsg.key } });

    } catch (error) {
        console.error("Pair command error:", error);
        await reply("❌ An error occurred. Please try again later.");
    }
});

cmd({
    pattern: "deploy",
    alias: ["deploykhan", "deploybot", "setupbot"],
    react: "🚀",
    desc: "Deploy KHAN-MD bot with session ID",
    category: "owner",
    use: ".deploy IK~your_session_id_here",
    filename: __filename
}, async (conn, mek, m, { from, q, isGroup, senderNumber, reply }) => {
    try {
        // Check if in group
        if (isGroup) {
            return await reply("❌ This command only works in private chat. Please message me directly.");
        }

        // Show processing reaction
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });

        // Extract session ID from command
        const sessionId = q ? q.trim() : '';
        
        // Validate session ID
        if (!sessionId || !sessionId.startsWith('IK~')) {
            return await reply("❌ Invalid session ID!\n\nPlease use: `.deploy IK~your_session_id_here`\n\nMake sure your session ID starts with 'IK~'");
        }

        // Validate session ID length (KHAN-MD should be under 100 chars)
        if (sessionId.length >= 100) {
            return await reply("❌ Invalid KHAN-MD session ID!\n\nKHAN-MD session IDs are shorter (under 100 characters).\nYou might have a JAWAD-MD session ID.\n\nGet correct session ID using: `.pair 923000000000`");
        }

        // Show typing indicator
        await conn.sendPresenceUpdate('composing', from);
        
        // 2 seconds delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check if user is premium from GitHub raw JSON
        try {
            const premiumResponse = await axios.get('https://raw.githubusercontent.com/JawadTechXD/DB/main/dj.json', {
                timeout: 10000
            });
            
            const premiumUsers = premiumResponse.data;
            const userJid = from.split('@')[0]; // Get user number from JID
            
            // Check if user is in premium list
            const isPremium = premiumUsers.includes(`${userJid}@s.whatsapp.net`);
            
            if (!isPremium) {
                return await reply(`- ❌ *Premium Required!*\n\n*You need to be a premium user to deploy bots*.\n\n*Contact Owner:*\n📱 *JawadTechX* - +923427582273`);
            }

        } catch (error) {
            console.error('Premium check error:', error);
            return await reply("❌ Failed to verify premium status. Please try again later.");
        }

        // User is premium, proceed with deployment
        const username = "JawadYT804"; // Fixed username as per requirement

        // Send ✅ reaction
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });

        // Contact-style quote
        let khanx = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: `𝗞𝗛𝗔𝗡-𝗠𝗗`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'khanxED'\nitem1.TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            }
        };

        // Call deployment API
        try {
            const deployResponse = await axios.get(`https://jawadtech-vps.onrender.com/khan?username=${encodeURIComponent(username)}&session_id=${encodeURIComponent(sessionId)}`, {
                timeout: 30000 // 30 second timeout for deployment
            });

            const result = deployResponse.data;

            if (result.success) {
                // Send success message with image
                await conn.sendMessage(from, {
                    image: { url: "https://files.catbox.moe/7zfdcq.jpg" },
                    caption: `- *Deployment Successful ✅*

> Your KHAN-MD bot is being deployed wait *2-3 minutes* . your bot will be ready shortly. Keep this session active 🍃

> Powered By JawadTechX 💸`,
                    contextInfo: {
                        mentionedJid: [m.sender]
                    }
                }, { quoted: khanx });

                // Additional success reaction
                await conn.sendMessage(from, { react: { text: "🎉", key: mek.key } });

            } else {
                await conn.sendMessage(from, {
                    text: `❌ *Deployment Failed!*\n\nError: ${result.error || 'Unknown error'}\n\nPlease check your session ID and try again.`
                }, { quoted: khanx });
            }

        } catch (deployError) {
            console.error('Deployment API error:', deployError);
            
            let errorMessage = "❌ *Deployment Failed!*\n\n";
            
            if (deployError.response?.data?.error) {
                errorMessage += `Error: ${deployError.response.data.error}`;
            } else if (deployError.code === 'ECONNABORTED') {
                errorMessage += `Server is taking too long to respond. Please try again in a few minutes.`;
            } else if (deployError.message.includes('Network Error')) {
                errorMessage += `Network connection failed. Please check your internet and try again.`;
            } else {
                errorMessage += `Server error: ${deployError.message}`;
            }
            
            errorMessage += `\n\nPlease try again with a valid session ID.`;

            await conn.sendMessage(from, {
                text: errorMessage
            }, { quoted: khanx });

            // Send ❌ reaction on error
            await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        }

    } catch (error) {
        console.error("Deploy command error:", error);
        
        // Contact-style quote for error
        let khanxError = {
            key: {
                fromMe: false,
                participant: `0@s.whatsapp.net`,
                remoteJid: "status@broadcast"
            },
            message: {
                contactMessage: {
                    displayName: `𝗞𝗛𝗔𝗡-𝗠𝗗`,
                    vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:'khanxED'\nitem1.TEL;waid=${m.sender.split("@")[0]}:${m.sender.split("@")[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
                }
            }
        };

        await conn.sendMessage(from, {
            text: "❌ An unexpected error occurred. Please try again later."
        }, { quoted: khanxError });
        
        // Send ❌ reaction on error
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
    }
});
