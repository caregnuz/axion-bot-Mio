// Plugin di Memoria Intelligente per 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓
let memory = [];

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply("Cosa devo memorizzare per te?");
    
    // Salva il promemoria in un array (o database JSON)
    memory.push({
        text: text,
        sender: m.sender,
        time: Date.now()
    });

    await m.react('🧠');
    m.reply(`『 🧠 』- *Memorizzato in 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓:*\n"${text}"`);
};

handler.command = ['ricorda'];
export default handler;
