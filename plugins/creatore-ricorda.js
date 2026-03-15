import cron from 'node-cron';
import fs from 'fs';

let reminders = JSON.parse(fs.readFileSync('./reminders.json') || '[]');

let handler = async (m, { conn, text }) => {
    // Esempio comando: .ricorda 16:15 bere acqua
    let [time, ...msg] = text.split(' ');
    if (!time || !msg) return m.reply("Uso: .ricorda [HH:MM] [messaggio]");

    let reminder = { time, text: msg.join(' '), chat: m.chat };
    reminders.push(reminder);
    fs.writeFileSync('./reminders.json', JSON.stringify(reminders));

    m.react('🧠');
    m.reply(`『 🧠 』- *Promemoria impostato per le ${time}!*\n𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 terrà traccia.`);
};

handler.command = ['ricorda'];
export default handler;

// Schedulatore che controlla ogni minuto
cron.schedule('* * * * *', () => {
    let now = new Date();
    let currentTime = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0');

    reminders.forEach((r, index) => {
        if (r.time === currentTime) {
            // Qui il bot invia il messaggio
            // Nota: global.conn è solitamente l'istanza del bot
            if (global.conn) {
                global.conn.sendMessage(r.chat, { text: `『 ⏰ 』- *Promemoria per 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓:*\n${r.text}` });
            }
            // Rimuovi dopo aver inviato
            reminders.splice(index, 1);
            fs.writeFileSync('./reminders.json', JSON.stringify(reminders));
        }
    });
});
