import axios from 'axios';
import * as cheerio from 'cheerio';

const baseUrl = 'https://sms24.me'; 
const mirrorUrl = 'https://sms-online.co';

const nazioni = [
    { id: '1', nome: 'Stati Uniti 🇺🇸', path: '/en/countries/us' },
    { id: '2', nome: 'Regno Unito 🇬🇧', path: '/en/countries/gb' },
    { id: '3', nome: 'Francia 🇫🇷', path: '/en/countries/fr' },
    { id: '4', nome: 'Svezia 🇸🇪', path: '/en/countries/se' },
    { id: '5', nome: 'Germania 🇩🇪', path: '/en/countries/de' },
    { id: '6', nome: 'Italia 🇮🇹', path: '/en/countries/it' },
    { id: '7', nome: 'Olanda 🇳🇱', path: '/en/countries/nl' },
    { id: '8', nome: 'Spagna 🇪🇸', path: '/en/countries/es' }
];

async function getHtml(url) {
    const headers = {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
        'Referer': 'https://www.google.com/'
    };
    try {
        return await axios.get(url, { headers, timeout: 10000 });
    } catch (e) {
        if (url.includes(baseUrl)) {
            return await axios.get(url.replace(baseUrl, mirrorUrl), { headers, timeout: 10000 });
        }
        throw e;
    }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const cmd = command.toLowerCase();
    const arg = args[0];

    if (cmd === 'voip' && !arg) {
        let txt = `*✅ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐕𝐎𝐈𝐏: 𝐃𝐀𝐓𝐀𝐁𝐀𝐒𝐄*\n\n`;
        nazioni.forEach(n => txt += `*${n.id}* ➜ ${n.nome}\n`);
        txt += `\n💡 _Digita_ \`${usedPrefix}voip <id>\` _per estrarre i numeri._`;
        return m.reply(txt);
    }

    if (cmd === 'voip' && arg && !isNaN(arg)) {
        const naz = nazioni.find(n => n.id === arg);
        if (!naz) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* ID non valido.");

        let { key } = await conn.sendMessage(m.chat, { text: `📡 *✅ 𝐒𝐂𝐀𝐍𝐒𝐈𝐎𝐍𝐄 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎:* ${naz.nome}` });

        try {
            const { data } = await getHtml(`${baseUrl}${naz.path}`);
            const $ = cheerio.load(data);
            let nums = [];
            
            $('a[href*="/en/numbers/"]').each((i, el) => {
                let n = $(el).text().trim().replace(/[^0-9]/g, '');
                if (n.length > 5) nums.push(n);
            });

            let final = [...new Set(nums)].sort(() => 0.5 - Math.random()).slice(0, 6);
            if (!final.length) return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun numero trovato.", edit: key });

            let res = `*✅ 𝐍𝐔𝐌𝐄𝐑𝐈 ATTIVI: ${naz.nome.toUpperCase()}*\n\n`;
            let buttons = [];

            final.forEach(n => {
                res += `🔹 \`+${n}\`\n`;
                buttons.push({ buttonId: `${usedPrefix}check ${n}`, buttonText: { displayText: `💬 Check +${n}` }, type: 1 });
            });

            buttons.push({ buttonId: `${usedPrefix}voip ${arg}`, buttonText: { displayText: `🔄 𝐂𝐀𝐌𝐁𝐈𝐀 𝐍𝐔𝐌𝐄𝐑𝐈` }, type: 1 });

            return conn.sendMessage(m.chat, { 
                text: res, 
                footer: "Tocca un tasto per i messaggi", 
                buttons, 
                headerType: 1, 
                edit: key 
            }, { quoted: m });

        } catch { 
            return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* VPS Bloccata. Riprova più tardi.", edit: key }); 
        }
    }

    if (cmd === 'check') {
        let num = arg?.replace('+', '');
        if (!num) return m.reply("*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Numero mancante.");

        let { key } = await conn.sendMessage(m.chat, { text: `📨 *✅ 𝐋𝐄𝐓𝐓𝐔𝐑𝐀 𝐒𝐌𝐒:* \`+${num}\`` });

        try {
            const { data } = await getHtml(`${baseUrl}/en/numbers/${num}`);
            const $ = cheerio.load(data);
            let msgs = [];

            $('.shadow-sm, .list-group-item').each((i, el) => {
                let user = $(el).find('a').first().text().trim() || 'SCONOSCIUTO';
                let txt = $(el).text().split('ago')[1]?.replace('Copy', '').trim();
                if (txt) msgs.push({ user, txt });
            });

            if (!msgs.length) return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Nessun SMS ricevuto.", edit: key });

            let res = `*✅ 𝐌𝐄𝐒𝐒𝐀𝐆𝐆𝐈 𝐑𝐈𝐂𝐄𝐕𝐔𝐓𝐈:* \`+${num}\`\n\n`;
            msgs.slice(0, 3).forEach(m => res += `👤 *${m.user}*\n💬 ${m.txt}\n\n────────────────\n`);

            const btns = [
                { buttonId: `${usedPrefix}check ${num}`, buttonText: { displayText: `🔄 𝐀𝐆𝐆𝐈𝐎𝐑𝐍𝐀 𝐒𝐌𝐒` }, type: 1 },
                { buttonId: `${usedPrefix}voip`, buttonText: { displayText: `📱 𝐓𝐎𝐑𝐍𝐀 𝐀𝐋 𝐌𝐄𝐍𝐔` }, type: 1 }
            ];

            return conn.sendMessage(m.chat, { 
                text: res, 
                footer: `Update: ${new Date().toLocaleTimeString()}`, 
                buttons: btns, 
                headerType: 1, 
                edit: key 
            }, { quoted: m });

        } catch { 
            return conn.sendMessage(m.chat, { text: "*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* Impossibile leggere i log.", edit: key }); 
        }
    }
};

handler.command = /^(voip|check)$/i;
export default handler;
