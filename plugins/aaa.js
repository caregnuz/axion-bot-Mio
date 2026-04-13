import axios from 'axios';
import * as cheerio from 'cheerio';

const nazioni = { 'it': '🇮🇹 𝐈𝐭𝐚', 'us': '🇺🇸 𝐔𝐬𝐚', 'gb': '🇬🇧 𝐔𝐤', 'fr': '🇫🇷 𝐅𝐫𝐚', 'de': '🇩🇪 𝐆𝐞𝐫' };

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const cmd = command.toLowerCase();

    if (cmd === 'voip') {
        const code = args[0]?.toLowerCase();
        
        if (!code || !nazioni[code]) {
            let txt = `*✅ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐕𝐎𝐈𝐏*\n\n`;
            for (let id in nazioni) txt += `• \`${usedPrefix}voip ${id}\` ➜ ${nazioni[id]}\n`;
            return m.reply(txt);
        }

        try {
            const response = await axios.get(`https://sms24.me/en/countries/${code}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5'
                },
                timeout: 15000
            });

            const $ = cheerio.load(response.data);
            let nums = [];
            $('a[href*="/en/numbers/"]').each((i, e) => {
                let n = $(e).text().replace(/[^0-9+]/g, '');
                if (n.startsWith('+')) nums.push(n);
            });

            if (nums.length === 0) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun numero disponibile al momento.");

            let shuffled = nums.sort(() => 0.5 - Math.random()).slice(0, 6);
            let res = `*✅ 𝐍𝐔𝐌𝐄𝐑𝐈 ${code.toUpperCase()}*\n\n`;
            let buttons = [];

            shuffled.forEach(n => {
                let clean = n.replace('+', '');
                res += `🔹 \`${usedPrefix}check ${clean}\`\n`;
                buttons.push({ buttonId: `${usedPrefix}check ${clean}`, buttonText: { displayText: `💬 Check ${n}` }, type: 1 });
            });

            buttons.push({ buttonId: `${usedPrefix}voip ${code}`, buttonText: { displayText: `🔄 𝐂𝐀𝐌𝐁𝐈𝐀 𝐍𝐔𝐌𝐄𝐑𝐈` }, type: 1 });

            return conn.sendMessage(m.chat, {
                text: res,
                footer: "Tocca un bottone o usa i comandi sopra",
                buttons: buttons,
                headerType: 1
            }, { quoted: m });

        } catch (e) {
            return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Il servizio sms24 è temporaneamente irraggiungibile.");
        }
    }

    if (cmd === 'check') {
        let num = args[0]?.replace('+', '');
        if (!num) return m.reply("*✅ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨:* Specifica il numero da controllare.");

        try {
            const response = await axios.get(`https://sms24.me/en/numbers/${num}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
                },
                timeout: 15000
            });

            const $ = cheerio.load(response.data);
            let txt = `*✅ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈 𝐑𝐈𝐂𝐄𝐕𝐔𝐓𝐈:* \`+${num}\`\n\n`;
            let count = 0;

            $('.shadow-sm').each((i, e) => {
                if (count >= 3) return;
                let from = $(e).find('a').first().text().trim();
                let body = $(e).find('.v-btn').parent().text().split('ago')[1]?.replace('Copy', '').trim();
                
                if (from && body) {
                    txt += `👤 *${from}*\n💬 ${body}\n\n────────────────\n`;
                    count++;
                }
            });

            if (count === 0) txt += "📭 Nessun SMS recente trovato.";

            const checkBtn = [
                { buttonId: `${usedPrefix}check ${num}`, buttonText: { displayText: `🔄 𝐀𝐆𝐆𝐈𝐎𝐑𝐍𝐀 𝐒𝐌𝐒` }, type: 1 },
                { buttonId: `${usedPrefix}voip`, buttonText: { displayText: `📱 𝐓𝐎𝐑𝐍𝐀 𝐀𝐈 𝐏𝐀𝐄𝐒𝐈` }, type: 1 }
            ];

            return conn.sendMessage(m.chat, {
                text: txt,
                footer: `Ultimo controllo: ${new Date().toLocaleTimeString()}`,
                buttons: checkBtn,
                headerType: 1
            }, { quoted: m });

        } catch (e) {
            return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Impossibile leggere gli SMS.");
        }
    }
};

handler.command = /^(voip|check)$/i;
export default handler;
