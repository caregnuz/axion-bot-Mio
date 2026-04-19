// Plugin segnala by Bonzino

let handler = async (m, { conn, args, text }) => {
  if (!text) {
    return m.reply(
`╭━━━━━━━🚨━━━━━━━╮
*✦ 𝐒𝐄𝐆𝐍𝐀𝐋𝐀 ✦*
╰━━━━━━━🚨━━━━━━━╯

*📌 𝐔𝐬𝐨:*
*.segnala <comando> <problema>*

*📍 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*.segnala daily non funziona*
*.segnala top mostra numeri sbagliati*`)
  }

  if (args.length < 2) {
    return m.reply(
`╭━━━━━━━⚠️━━━━━━━╮
*✦ 𝐒𝐄𝐆𝐍𝐀𝐋𝐀 ✦*
╰━━━━━━━⚠️━━━━━━━╯

*❌ 𝐃𝐞𝐯𝐢 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨 𝐞 𝐢𝐥 𝐩𝐫𝐨𝐛𝐥𝐞𝐦𝐚*`)
  }

  const comando = args[0].toLowerCase()
  const problema = args.slice(1).join(' ').trim()

  if (!problema) {
    return m.reply(
`╭━━━━━━━⚠️━━━━━━━╮
*✦ 𝐒𝐄𝐆𝐍𝐀𝐋𝐀 ✦*
╰━━━━━━━⚠️━━━━━━━╯

*❌ 𝐃𝐞𝐯𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞 𝐮𝐧𝐚 𝐝𝐞𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥 𝐩𝐫𝐨𝐛𝐥𝐞𝐦𝐚*`)
  }

  let segnalazioni = global.db.data.segnalazioni || (global.db.data.segnalazioni = [])
  const id = segnalazioni.length + 1
  const data = Date.now()

  segnalazioni.push({
    id,
    comando,
    problema,
    utente: m.sender,
    chat: m.chat,
    data
  })

  const reportChat = global.StaffChat

  const testoGruppo = `╭━━━━━━━🚨━━━━━━━╮
*✦ 𝐍𝐔𝐎𝐕𝐀 𝐒𝐄𝐆𝐍𝐀𝐋𝐀𝐙𝐈𝐎𝐍𝐄 ✦*
╰━━━━━━━🚨━━━━━━━╯

*🆔 𝐈𝐃:* *#${id}*
*⌨️ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨:* *${comando}*
*📝 𝐏𝐫𝐨𝐛𝐥𝐞𝐦𝐚:* *${problema}*
*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* *@${m.sender.split('@')[0]}*
*💬 𝐂𝐡𝐚𝐭:* *${m.chat}*
*🕒 𝐃𝐚𝐭𝐚:* *${new Date(data).toLocaleString('it-IT')}*`

  try {
    if (reportChat && reportChat.endsWith('@g.us')) {
      await conn.sendMessage(reportChat, {
  text: testoGruppo,
  mentions: [m.sender]
}, { quoted: m })
      })
    }
  } catch (e) {
    console.error('Errore invio segnalazione al gruppo:', e)
  }

  await m.reply(
`╭━━━━━━━🚨━━━━━━━╮
*✦ 𝐒𝐄𝐆𝐍𝐀𝐋𝐀𝐙𝐈𝐎𝐍𝐄 𝐈𝐍𝐕𝐈𝐀𝐓𝐀 ✦*
╰━━━━━━━🚨━━━━━━━╯

*🆔 𝐈𝐃:* *#${id}*
*⌨️ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨:* *${comando}*
*📝 𝐏𝐫𝐨𝐛𝐥𝐞𝐦𝐚:* *${problema}*

*✅ 𝐋𝐚 𝐬𝐞𝐠𝐧𝐚𝐥𝐚𝐳𝐢𝐨𝐧𝐞 è 𝐬𝐭𝐚𝐭𝐚 𝐢𝐧𝐯𝐢𝐚𝐭𝐚 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨*`)
}

handler.help = ['segnala <comando> <problema>']
handler.tags = ['info']
handler.command = /^(segnala|report|bug)$/i

export default handler