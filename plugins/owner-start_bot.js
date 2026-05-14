let handler = async (m, { conn, usedPrefix, command }) => {
    let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
    
    if (command === 'start_bot') {
        if (chat.axionActive) return m.reply("✅ *𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌* è già attivo in questo gruppo.")
        chat.axionActive = true
        return m.reply("🚀 *𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐎*\nUn owner è stato così gentile da attivare il bot nel vostro gruppo.")
    }

    if (command === 'stop_bot') {
        if (!chat.axionActive) return m.reply("💤 *𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌* è già disattivato.")
        chat.axionActive = false
        return m.reply("🛑 *𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐒𝐎𝐒𝐏𝐄𝐒𝐎*\nIl bot è stato disattivato per questo gruppo.")
    }
}

handler.before = async (m, { conn }) => {
    if (!m.isGroup) return false
    
    let chat = global.db.data.chats[m.chat] || {}
    let isOwner = global.owner.some(owner => owner[0] + '@s.whatsapp.net' === m.sender)

    if (!chat.axionActive && !isOwner) {
        if (m.text && /^[.!#]/.test(m.text)) {
            return true 
        }
    }
    return false
}

handler.help = ['start_bot', 'stop_bot']
handler.tags = ['owner']
handler.command = ['start_bot', 'stop_bot']
handler.group = true
handler.owner = true

export default handler
