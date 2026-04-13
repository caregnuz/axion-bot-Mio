// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

let handler = async (m, { conn, text }) => {
  try {
    let who

    if (text && /^\d{7,15}$/.test(text)) {
      who = text.replace(/\D/g, '') + '@s.whatsapp.net'
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0]
    } else if (m.quoted) {
      who = m.quoted.sender
    } else {
      who = m.sender
    }

    const name = await conn.getName(who)

    let pp = 'https://ui-avatars.com/api/?background=f3f4f6&color=9ca3af&size=512&name=User'

    try {
      const realPp = await conn.profilePictureUrl(who, 'image')
      if (realPp) pp = realPp
    } catch {}

    const caption = `*╭━━━━━━━🖼️━━━━━━━╮*
*✦ 𝐅𝐎𝐓𝐎 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 ✦*
*╰━━━━━━━🖼️━━━━━━━╯*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${name}`

    await conn.sendMessage(
      m.chat,
      {
        image: { url: pp },
        caption,
        mentions: [who],
        contextInfo: {
          ...(global.rcanal?.contextInfo || {})
        }
      },
      { quoted: m }
    )

  } catch (err) {
    console.error('Errore .pfp:', err)

    await conn.reply(
      m.chat,
      '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐨.*',
      m
    )
  }
}

handler.help = ['pfp @utente / reply / numero']
handler.tags = ['tools']
handler.command = ['pfp', 'fotoprofilo', 'pic']

export default handler