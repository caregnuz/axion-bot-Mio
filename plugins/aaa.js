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
            const { data } = await axios.get(`https://sms24.me/en/countries/${code}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Upgrade-Insecure-Requests': '1'
                }
            });

            const $ = cheerio.load(data);
            let nums = [];
            $('a[href*="/en/numbers/"]').each((i, e) => {
                let n = $(e).text().trim().replace(/[^0-9+]/g, '');
                if (n.length > 5) nums.push(n.startsWith('+') ? n : '+' + n);
            });

            if (nums.length === 0) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun numero disponibile al momento.");

            let shuffled = [...new Set(nums)].sort(() => 0.5 - Math.random()).slice(0, 6);
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
                footer: "Tocca un tasto per procedere",
                buttons: buttons,
                headerType: 1
            }, { quoted: m });

        } catch (e) {
            return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Il sito ha bloccato la connessione. Riprova più tardi.");
        }
    }

    if (cmd === 'check') {
        let num = args[0]?.replace('+', '');
        if (!num) return m.reply("*✅ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨:* Numero mancante.");

        try {
            const { data } = await axios.get(`https://sms24.me/en/numbers/${num}`, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            });

            const $ = cheerio.load(data);
            let txt = `*✅ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈 𝐑𝐈𝐂𝐄𝐕𝐔𝐓𝐈:* \`+${num}\`\n\n`;
            let found = false;

            $('.shadow-sm').slice(0, 3).each((i, e) => {
                let from = $(e).find('a').first().text().trim();
                let msg = $(e).find('.v-btn').parent().contents().filter(function() {
                    return this.nodeType === 3;
                }).text().trim();

                if (from) {
                    found = true;
                    txt += `👤 *${from}*\n💬 ${msg}\n\n────────────────\n`;
                }
            });

            if (!found) txt += "📭 Nessun SMS trovato.";

            const checkBtn = [
                { buttonId: `${usedPrefix}check ${num}`, buttonText: { displayText: `🔄 𝐀𝐆𝐆𝐈𝐎𝐑𝐍𝐀 𝐒𝐌𝐒` }, type: 1 },
                { buttonId: `${usedPrefix}voip`, buttonText: { displayText: `📱 𝐓𝐎𝐑𝐍𝐀 𝐀𝐈 𝐏𝐀𝐄𝐒𝐈` }, type: 1 }
            ];

            return conn.sendMessage(m.chat, {
                text: txt,
                footer: `Update: ${new Date().toLocaleTimeString()}`,
                buttons: checkBtn,
                headerType: 1
            }, { quoted: m });

        } catch (e) {
            return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Impossibile caricare i messaggi.");
        }
    }
};

handler.command = /^(voip|check)$/i;
export default handler;
