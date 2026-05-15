// plugin del per admin e onwer by Bonzino

const handler = async (m, { conn, isAdmin, isOwner, isROwner }) => {
  if (!m.isGroup) return

  if (!(isAdmin || isOwner || isROwner)) {
    return m.reply('*❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫.*')
  }

  if (!m.quoted) {
    return m.reply('*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐚 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐫𝐞.*')
  }

  try {
    const key = m.quoted?.fakeObj?.key || m.quoted?.vM?.key || {
      remoteJid: m.chat,
      fromMe: false,
      id: m.quoted?.id,
      participant: m.quoted?.sender
    }

    await conn.sendMessage(m.chat, { delete: key })
    await conn.sendMessage(m.chat, { delete: m.key })
  } catch (e) {
    console.error('[DEL ERROR]', e)

    try {
      if (m.quoted?.vM?.key) {
        await conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
      }

      await conn.sendMessage(m.chat, { delete: m.key })
    } catch {}
  }
}

handler.help = ['del']
handler.tags = ['group']
handler.command = /^del$/i
handler.group = true
handler.botAdmin = true

export default handler