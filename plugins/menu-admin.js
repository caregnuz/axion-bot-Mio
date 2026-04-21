import { performance } from 'perf_hooks'

const handler = async (message, { conn, usedPrefix = '.' }) => {
  const userId = message.sender
  const uptimeMs = process.uptime() * 1000
  const uptimeStr = clockString(uptimeMs)
  const totalUsers = Object.keys(global.db?.data?.users || {}).length

  const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐀𝐃𝐌𝐈𝐍 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴀᴄᴄᴇssᴏ:* ᴀᴅᴍɪɴ
╼━━━━━━━━━━━━━━╾

╭━━━〔 🛠️ ɢᴇsᴛɪᴏɴᴇ 〕━⬣
┃ 👑 ${usedPrefix}promuovi <reply/tag>
┃ 🙇‍♂️ ${usedPrefix}retrocedi <reply/tag>
┃ 🚨 ${usedPrefix}reimpostalink
┃ 🛡️ ${usedPrefix}admins
┃ 📌 ${usedPrefix}pin <messaggio>
┃ ✅ ${usedPrefix}richieste
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚠️ ᴡᴀʀɴ 〕━⬣
┃ ⚠️ ${usedPrefix}warn <reply/tag>
┃ ✅ ${usedPrefix}unwarn <reply/tag>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🧰 ᴄᴏᴍᴀɴᴅɪ 〕━⬣
┃ 🤫 ${usedPrefix}muta <reply/tag>
┃ 🔊 ${usedPrefix}smuta <reply/tag>
┃ 🏹 ${usedPrefix}tag <messaggio>
┃ 📖 ${usedPrefix}setbio <messaggio>
┃ 🚨 ${usedPrefix}setname <messaggio>
┃ 🖼️ ${usedPrefix}pic <reply/tag>
┃ 🔍 ${usedPrefix}rivela <media>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔒 ɪᴍᴘᴏsᴛᴀᴢɪᴏɴɪ 〕━⬣
┃ 🔓 ${usedPrefix}aperto
┃ 🔐 ${usedPrefix}chiuso
┃ 📳 ${usedPrefix}listamod
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 👥 ɢᴇsᴛɪᴏɴᴇ ᴜᴛᴇɴᴛɪ 〕━⬣
┃ ⚔️ ${usedPrefix}kick
┃ 🔮 ${usedPrefix}resuscita
┃ ❓️ ${usedPrefix}info <utente>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔗 ʟɪɴᴋ ɢʀᴜᴘᴘᴏ 〕━⬣
┃ 🔗 ${usedPrefix}link
┃ 📥 ${usedPrefix}linkqr
┃ 🆔 ${usedPrefix}idgp
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 ɪɴғᴏ 〕━⬣
┃ ᴠᴇʀsɪᴏɴᴇ: ${global.versione}
┃ sᴛᴀᴛᴜs: ᴏɴʟɪɴᴇ ⚡
╰━━━━━━━━━━━━━━━━⬣
`.trim()

  await conn.sendMessage(message.chat, {
    text: menuBody,
    mentions: [userId],
    footer: '> *𝛥𝐗𝐈𝐎𝐍 𝚩𝚯𝐓*',
    buttons: [
      {
        buttonId: `${usedPrefix}menu`,
        buttonText: { displayText: '⬅️ Menu Principale' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: message })
}

function clockString(ms) {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor(ms / 3600000) % 24
  const m = Math.floor(ms / 60000) % 60
  const s = Math.floor(ms / 1000) % 60
  return `${d}d ${h}h ${m}m ${s}s`
}

handler.help = ['admin']
handler.tags = ['menu']
handler.command = /^(admin)$/i

export default handler