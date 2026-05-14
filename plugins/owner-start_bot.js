let handler = m => m

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

handler.all = async (m, { conn, usedPrefix }) => {
    if (!m.isGroup) return
    
    let isOwner = global.owner.some(owner => owner[0] + '@s.whatsapp.net' === m.sender)
    if (!isOwner) return

    let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})

    if (m.text === `${usedPrefix}start_bot`) {
        chat.axionActive = true
        return m.reply("✅ *𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐎*\nIl bot è ora operativo in questo gruppo.")
    }

    if (m.text === `${usedPrefix}stop_bot`) {
        chat.axionActive = false
        return m.reply("💤 *𝛥𝐗𝐈𝚶𝐍 𝐒𝐘𝐒𝐓𝐄𝐌: 𝐒𝐎𝐒𝐏𝐄𝐒𝐎*\nIl bot è stato disattivato per questo gruppo.")
    }
}

export default handler
