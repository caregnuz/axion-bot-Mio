let axios, cheerio;
let ready = false;

try {
  axios = (await import('axios')).default;
  cheerio = await import('cheerio');
  ready = true;
} catch (e) {
  console.log("Errore: librerie mancanti.");
}

const baseUrl = 'https://receive-sms-online.info';

const headers = {
  'User-Agent': 'Mozilla/5.0'
};

// 📩 Legge SMS pubblici
async function getSMS(numero) {
  try {
    const { data } = await axios.get(`${baseUrl}/${numero}`, { headers });
    const $ = cheerio.load(data);

    let msgs = [];

    $('table tr').each((i, el) => {
      let from = $(el).find('td').eq(0).text().trim();
      let text = $(el).find('td').eq(1).text().trim();
      let time = $(el).find('td').eq(2).text().trim();

      if (text && text.length > 2) {
        msgs.push({ from, text, time });
      }
    });

    return msgs;
  } catch {
    return null;
  }
}

// 📱 Lista numeri disponibili
async function getNumbers() {
  try {
    const { data } = await axios.get(baseUrl, { headers });
    const $ = cheerio.load(data);

    let numeri = [];

    $('a').each((i, el) => {
      let t = $(el).text().trim();
      if (t.includes('+')) {
        numeri.push(t.replace(/[^0-9]/g, ''));
      }
    });

    return [...new Set(numeri)].slice(0, 15);
  } catch {
    return [];
  }
}

let handler = async (m, { args, usedPrefix, command }) => {
  if (!ready) return m.reply("❌ Librerie mancanti.");

  // MENU
  if (command === 'voip') {
    if (!args[0]) {
      return m.reply(
`📱 *VOIP SAFE PANEL*

🔹 ${usedPrefix}voip list
_lista numeri disponibili_

🔹 ${usedPrefix}voip sms <numero>
_leggi SMS pubblici_

⚠️ Solo uso informativo`
      );
    }

    // LISTA NUMERI
    if (args[0] === 'list') {
      let nums = await getNumbers();
      if (nums.length === 0) return m.reply("❌ Nessun numero trovato.");

      let txt = `📲 *NUMERI DISPONIBILI*\n\n`;
      nums.forEach((n, i) => {
        txt += `${i + 1}. \`+${n}\`\n`;
      });

      return m.reply(txt);
    }

    // SMS
    if (args[0] === 'sms') {
      let num = args[1];
      if (!num) return m.reply(`Uso: ${usedPrefix}voip sms 123456789`);

      let msgs = await getSMS(num);
      if (!msgs || msgs.length === 0)
        return m.reply("❌ Nessun SMS trovato.");

      let txt = `📩 *SMS: +${num}*\n\n`;

      msgs.slice(0, 5).forEach(m => {
        txt += `👤 ${m.from}\n`;
        txt += `💬 ${m.text}\n`;
        txt += `🕒 ${m.time}\n`;
        txt += `────────────\n`;
      });

      return m.reply(txt.trim());
    }
  }
};

handler.help = ['voip'];
handler.tags = ['tools'];
handler.command = /^(voip)$/i;

export default handler;