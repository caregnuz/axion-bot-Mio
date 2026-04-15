let handler = async (m, { conn }) => {
  if (!m.isGroup) {
    return m.reply('⚠️ *𝐔𝐬𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐢𝐧 𝐮𝐧 𝐠𝐫𝐮𝐩𝐩𝐨*')
  }

  let id = m.chat
  let nome = '𝐒𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨'
  let membri = 0

  try {
    let meta = await conn.groupMetadata(m.chat)
    nome = meta.subject || '𝐒𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨'
    membri = meta.participants?.length || 0
  } catch {}

  let testo = `
╭━━━〔 🆔 𝐈𝐃 𝐆𝐑𝐔𝐏𝐏𝐎 〕━━━⬣
┃ 🏷️ *𝐍𝐨𝐦𝐞:* ${nome}
┃ 👥 *𝐌𝐞𝐦𝐛𝐫𝐢:* ${membri}
┃ 🆔 *𝐈𝐃:* 
┃ ${id}
╰━━━━━━━━━━━━━━━━━━⬣
`.trim()

  await conn.sendMessage(m.chat, {
    text: testo
  }, { quoted: m })
}

handler.help = ['idgp']
handler.tags = ['group']
handler.command = /^(idgp)$/i
handler.group = true

export default handler