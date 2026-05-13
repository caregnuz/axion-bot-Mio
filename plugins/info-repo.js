let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    text:
`*🌐 𝐄𝐜𝐜𝐨 𝐢𝐥 𝐫𝐞𝐩𝐨 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐞 𝐝𝐞𝐥 𝐛𝐨𝐭:*
*https://github.com/axion-bot/axion-bot-Md*

*📢 𝐒𝐞𝐠𝐮𝐢 𝐢𝐥 𝐜𝐚𝐧𝐚𝐥𝐞 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐞 𝐝𝐞𝐥 𝐛𝐨𝐭 𝐩𝐞𝐫 𝐫𝐢𝐦𝐚𝐧𝐞𝐫𝐞 𝐬𝐞𝐦𝐩𝐫𝐞 𝐚𝐠𝐠𝐢𝐨𝐫𝐧𝐚𝐭𝐨 𝐬𝐮 𝐧𝐨𝐯𝐢𝐭à 𝐞 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐡𝐞!*

*https://whatsapp.com/channel/0029Vb8MQ3U1CYoMEtU1832d* 

*🌟 𝐒𝐮𝐩𝐩𝐨𝐫𝐭𝐚 𝐥𝐨 𝐬𝐯𝐢𝐥𝐮𝐩𝐩𝐨 𝐝𝐢 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 𝐜𝐨𝐧 𝐮𝐧𝐚 𝐬𝐭𝐞𝐥𝐥𝐚 𝐬𝐮 𝐆𝐢𝐭𝐇𝐮𝐛!*

*👑 𝐎𝐰𝐧𝐞𝐫:* 𝕯𝖊ⱥ𝖉𝖑𝐲
*🔱 𝐂𝐨-𝐎𝐰𝐧𝐞𝐫:* Bonzino

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
    contextInfo: global.rcanal?.contextInfo || {}
  }, { quoted: m })
}

handler.help = ['repo', 'infobot']
handler.tags = ['info']
handler.command = ['repo', 'repository', 'github', 'infobot']

export default handler