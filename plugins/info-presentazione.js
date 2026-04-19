// Plugin presentazione by Luxifer (edited by Bonzino)

let handler = async (m, { conn, usedPrefix }) => {
  const botName = global.db?.data?.nomedelbot || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

  const introText = `╭━━━━━━━🤖━━━━━━━╮
*✦ 𝐈𝐍𝐅𝐎 𝐁𝐎𝐓 ✦*
╰━━━━━━━🤖━━━━━━━╯

*👋 𝐂𝐢𝐚𝐨! 𝐒𝐨𝐧𝐨* *${botName}*
*🛡️ 𝐒𝐨𝐧𝐨 𝐮𝐧 𝐛𝐨𝐭 𝐩𝐞𝐫 𝐠𝐫𝐮𝐩𝐩𝐢 𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩*
*⚙️ 𝐏𝐨𝐬𝐬𝐨 𝐚𝐢𝐮𝐭𝐚𝐫𝐭𝐢 𝐜𝐨𝐧 𝐠𝐞𝐬𝐭𝐢𝐨𝐧𝐞, 𝐬𝐢𝐜𝐮𝐫𝐞𝐳𝐳𝐚 𝐞 𝐢𝐧𝐭𝐫𝐚𝐭𝐭𝐞𝐧𝐢𝐦𝐞𝐧𝐭𝐨*

*📋 𝐔𝐬𝐚 ${usedPrefix}menu 𝐩𝐞𝐫 𝐯𝐞𝐝𝐞𝐫𝐞 𝐭𝐮𝐭𝐭𝐢 𝐢 𝐜𝐨𝐦𝐚𝐧𝐝𝐢*
*🚨 𝐔𝐬𝐚 ${usedPrefix}segnala <comando> <problema> 𝐩𝐞𝐫 𝐫𝐢𝐩𝐨𝐫𝐭𝐚𝐫𝐞 𝐞𝐫𝐫𝐨𝐫𝐢 𝐨 𝐛𝐮𝐠*`

  await conn.sendMessage(m.chat, {
    text: introText,
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    buttons: [
      { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '📋 𝐌𝐞𝐧𝐮' }, type: 1 }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.help = ['presentazione', 'presentati']
handler.tags = ['info']
handler.command = /^(presentazione|presentati)$/i

export default handler