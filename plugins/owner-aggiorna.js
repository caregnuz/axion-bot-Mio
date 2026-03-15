import { exec } from 'child_process';

let handler = async (m, { conn, text }) => {
    const MY_SIGN = "𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓";
    
    // Se non scrivi cosa hai aggiornato, ti avvisa
    if (!text) return m.reply(`『 📝 』- *Specifica cosa hai aggiornato!*\n\nEsempio: .aggiorna Aggiunto menu sticker\n\n${MY_SIGN}`);

    await m.react('🔄');
    let msg = await conn.reply(m.chat, `『 ⚙️ 』- *Eseguendo aggiornamento interno per ${MY_SIGN}...*`, m);

    // Esegue il comando di aggiornamento (git pull)
    exec('git pull', (err, stdout, stderr) => {
        if (err) {
            return conn.reply(m.chat, `『 ❌ 』- *Errore durante l'aggiornamento:*\n${stderr}`, m);
        }
        
        let response = `『 ✅ 』- *Aggiornamento completato con successo!*\n\n` +
                       `*Modifiche apportate:*\n> ${text}\n\n` +
                       `*Log di sistema:*\n\`\`\`${stdout.slice(0, 200)}\`\`\`\n\n` +
                       `${MY_SIGN}`;
        
        conn.sendMessage(m.chat, { delete: msg.key }).catch(e => {});
        conn.reply(m.chat, response, m);
    });
};

handler.help = ['aggiorna <messaggio>'];
handler.tags = ['owner'];
handler.command = ['aggiorna', 'update'];
handler.rowner = true; // Solo il proprietario può usarlo

export default handler;
