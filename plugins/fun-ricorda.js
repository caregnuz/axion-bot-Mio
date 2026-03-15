import cron from 'node-cron';
import fs from 'fs';

// Funzione per caricare i dati
const loadReminders = () => {
    return fs.existsSync('./reminders.json') ? JSON.parse(fs.readFileSync('./reminders.json', 'utf8')) : [];
};

let handler = async (m, { conn, text, mentionedJid }) => {
    // text: "@Deadly alle 16:30 deve bere acqua"
    // mentionedJid: contiene l'ID reale (es. 212778494602@s.whatsapp.net)
    
    let [time, ...msg] = text.split(' ');
    
    // Validazione: controlliamo se c'è un tag
    if (!mentionedJid || mentionedJid.length === 0) {
        return m.reply("『 ❌ 』- *Devi taggare la persona!* Esempio: .ricorda @nome 16:30 messaggio");
    }

    let reminder = { 
        time, 
        text: msg.join(' '), 
        chat: m.chat, 
        taggedUser: mentionedJid[0] // Salva l'ID dell'utente taggato
    };

    let reminders = loadReminders();
    reminders.push(reminder);
    fs.writeFileSync('./reminders.json', JSON.stringify(reminders));

    m.react('🧠');
    m.reply(`『 🧠 』- *Promemoria memorizzato per le ${time}!*\n*Taggherò @${mentionedJid[0].split('@')[0]}*\n\n𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 è sul pezzo.`);
};

handler.command = ['ricorda'];
export default handler;

// Schedulatore
cron.schedule('* * * * *', async () => {
    let now = new Date();
    let currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');

    let reminders = loadReminders();
    let toKeep = [];

    for (let r of reminders) {
        if (r.time === currentTime) {
            if (global.conn) {
                // Invia il messaggio menzionando l'utente
                await global.conn.sendMessage(r.chat, { 
                    text: `『 ⏰ 』- *Promemoria per 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓:*\n@${r.taggedUser.split('@')[0]} ${r.text}`, 
                    mentions: [r.taggedUser] 
                });
            }
        } else {
            toKeep.push(r);
        }
    }
    fs.writeFileSync('./reminders.json', JSON.stringify(toKeep));
});
