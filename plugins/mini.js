// plugins/mini.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

// Your Vercel API base URL
const API_BASE_URL = 'https://jawadtechx.vercel.app/api'; // Added /api prefix

cmd({
    pattern: "mini",
    alias: ["pairmini", "minibot"],
    react: "✅",
    desc: "Get pairing code for JAWAD-MD bot",
    category: "owner",
    use: ".pair 923427582XXX",
    filename: __filename
}, async (conn, mek, m, { from, q, senderNumber, reply }) => {
    try {
        // Extract phone number from command
        const phoneNumber = q ? q.trim().replace(/[^0-9]/g, '') : senderNumber.replace(/[^0-9]/g, '');

        // Validate phone number format
        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            return await reply("❌ Please provide a valid phone number without +\nExample: .pair 923427582XXX");
        }

        // Get random server from your Vercel API
        const randomResponse = await axios.get(`${API_BASE_URL}/random`, { timeout: 5000 });
        
        if (!randomResponse.data || !randomResponse.data.server) {
            return await reply("❌ Failed to get available server. Please try again.");
        }

        const selectedServer = randomResponse.data.server;
        
        // Make API request to get pairing code through your Vercel API
        const response = await axios.get(`${API_BASE_URL}/code`, {
            params: { 
                server: selectedServer, 
                number: phoneNumber 
            },
            timeout: 20000
        });

        if (!response.data || !response.data.code) {
            return await reply("❌ Failed to retrieve pairing code. Please try again later.");
        }

        const pairingCode = response.data.code;
        
        // Send initial code message
        await reply(`🔐 *JAWAD-MD PAIR CODE*\n\n${pairingCode}\n\nServer: ${selectedServer}\n\n📱 *How to use:*\n1. Open WhatsApp on your phone\n2. Go to Linked Devices\n3. Tap on Link Device\n4. Enter this code when prompted`);

        // Optional 2-second delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Send clean code again
        await reply(`${pairingCode}`);

    } catch (error) {
        console.error("Pair command error:", error);
        await reply("❌ An error occurred while getting pairing code. Please try again later.");
    }
});
