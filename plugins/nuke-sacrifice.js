const handler = async (m, { conn, participants, isAdmin, isOwner }) => {
  try {
    const user = global.db.data.users[m.sender] || {}

    // 🔐 Permessi: owner OR admin OR premium/mod
    if (!isOwner && !isAdmin && !user.moderator) {
      return m.reply('⛔ *𝐂𝐨𝐦𝐚𝐧𝐝𝐨 𝐫𝐢𝐬𝐞𝐫𝐯𝐚𝐭𝐨 𝐚𝐥𝐥𝐨 𝐒𝐓𝐀𝐅𝐅 𝐝𝐢 𝐒𝐀𝐂𝐑𝐈𝐅𝐈𝐂𝐄*')
    }

    // Link gruppo
    const code = await conn.groupInviteCode(m.chat)
    const link = `https://chat.whatsapp.com/${code}`

    // ☠️ PRIMO MESSAGGIO — RITUALE
    await conn.sendMessage(m.chat, {
      text: `
𝐐𝐔𝐄𝐒𝐓𝐎 𝐆𝐑𝐔𝐏𝐏𝐎 𝐄̀ 𝐒𝐓𝐀𝐓𝐎 𝐂𝐎𝐍𝐒𝐀𝐂𝐑𝐀𝐓𝐎 𝐋𝐀 𝐂𝐎𝐌𝐔𝐍𝐈𝐓𝐀̀ 𝐒𝐈 𝐒𝐏𝐎𝐒𝐓𝐀
`.trim()
    })

    // Menzioni (tutti)
    const users = participants.map(u => conn.decodeJid(u.id))

    // 🔥 SECONDO MESSAGGIO — INVITO SACRIFICE
    await conn.sendMessage(m.chat, {
      text: `
𝐄𝐍𝐓𝐑𝐀𝐓𝐄 𝐓𝐔𝐓𝐓𝐈 𝐐𝐔𝐈:
${link}

👑 𝐋𝐎 𝐒𝐓𝐀𝐅𝐅 𝐕𝐈 𝐀𝐓𝐓𝐄𝐍𝐃𝐄
`.trim(),
      mentions: users
    })

  } catch (e) {
    console.error('Errore nukegp:', e)
    m.reply('❌ Errore durante l’esecuzione del comando.')
  }
}

handler.help = ['nukegp']
handler.tags = ['gruppo', 'moderazione']
handler.command = /^nukegp$/i
handler.group = true
handler.premium = false

export default handler