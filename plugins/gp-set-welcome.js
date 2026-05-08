let handler = async (m, { conn, text, command, usedPrefix }) => {
    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    if (command === 'setwelcome') {
        if (!text) return m.reply(`*Uso corretto:*\n${usedPrefix + command} Ciao @user, benvenuto in @nomegp!\n\n*Tag disponibili:* @user, @nomegp`)
        chat.sWelcome = text
        return m.reply('✅ *Messaggio di Benvenuto personalizzato salvato!*')
    }

    if (command === 'setaddio') {
        if (!text) return m.reply(`*Uso corretto:*\n${usedPrefix + command} @user ha lasciato @nomegp, addio!\n\n*Tag disponibili:* @user, @nomegp`)
        chat.sGoodbye = text
        return m.reply('✅ *Messaggio di Addio personalizzato salvato!*')
    }
}

handler.help = ['setwelcome', 'setaddio']
handler.tags = ['admin']
handler.command = ['setwelcome', 'setaddio']
handler.admin = true
handler.group = true

export default handler
