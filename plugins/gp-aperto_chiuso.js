// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

let handler = async (m, { conn, command }) => {
  let isOpen = command === 'aperto'

  await conn.groupSettingUpdate(
    m.chat,
    isOpen ? 'not_announcement' : 'announcement'
  )

  const text = isOpen
    ? `*『 🟢 』 𝐆𝐫𝐮𝐩𝐩𝐨 𝐚𝐩𝐞𝐫𝐭𝐨.*\n\n*𝐎𝐫𝐚 𝐭𝐮𝐭𝐭𝐢 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞.*\n\n> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`
    : `*『 🔴 』 𝐆𝐫𝐮𝐩𝐩𝐨 𝐜𝐡𝐢𝐮𝐬𝐨.*\n\n*𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞.*\n\n> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      ...(global.rcanal?.contextInfo || {})
    }
  }, { quoted: m })
}

handler.help = ['aperto', 'chiuso']
handler.tags = ['group']
handler.command = /^(aperto|chiuso)$/i
handler.admin = true
handler.botAdmin = true

export default handler