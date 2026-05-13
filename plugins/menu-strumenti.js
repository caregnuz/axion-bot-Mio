import { performance } from 'perf_hooks'

const handler = async (message, { conn, usedPrefix = '.' }) => {
  const userId = message.sender
  const uptimeMs = process.uptime() * 1000
  const uptimeStr = clockString(uptimeMs)
  const totalUsers = Object.keys(global.db?.data?.users || {}).length

  const menuBody = `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐒𝐓𝐑𝐔𝐌𝐄𝐍𝐓𝐈 』
╼━━━━━━━━━━━━━━╾
  ◈ *ᴜsᴇʀ:* @${userId.split('@')[0]}
  ◈ *ᴜᴘᴛɪᴍᴇ:* ${uptimeStr}
  ◈ *ᴜᴛᴇɴᴛɪ:* ${totalUsers}
  ◈ *ᴄᴀᴛᴇɢᴏʀɪᴀ:* sᴛʀᴜᴍᴇɴᴛɪ
╼━━━━━━━━━━━━━━╾

╭━━━〔 🛠️ 𝐒𝐓𝐑𝐔𝐌𝐄𝐍𝐓𝐈 〕━⬣
┃ 💡 ${usedPrefix}font <numero> <messaggio>
┃ 🔄 ${usedPrefix}converti <reply media>
┃ 🎛️ ${usedPrefix}audiofx <audio>
┃ 📥 ${usedPrefix}download <link>
┃ 🌦 ${usedPrefix}meteo <città>
┃ 🖼️ ${usedPrefix}toimg <sticker>
┃ 📹 ${usedPrefix}togif <sticker>
┃ 🧠 ${usedPrefix}ia <messaggio>
┃ ✨ ${usedPrefix}wm <messaggio>
┃ 🗓️ ${usedPrefix}ricorda <messaggio>
┃ 🔍 ${usedPrefix}rivela <media>
┃ 🎶 ${usedPrefix}cur
┃ 🎙 ${usedPrefix}trascrivi <audio>
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 🖼️ 𝐈𝐌𝐌𝐀𝐆𝐈𝐍𝐈 〕━⬣
┃ 🥰 ${usedPrefix}bellometro
┃ 🌈 ${usedPrefix}gaymetro
┃ 💖 ${usedPrefix}lesbiometro
┃ 🍆 ${usedPrefix}masturbometro
┃ 🍀 ${usedPrefix}fortunometro
┃ 🧠 ${usedPrefix}intelligiometro
┃ 💦 ${usedPrefix}sborra
┃ ❤️ ${usedPrefix}il
┃ 🕴 ${usedPrefix}wasted
┃ 💂 ${usedPrefix}comunista
┃ 👙 ${usedPrefix}bisex
┃ 🏳️‍🌈 ${usedPrefix}gay
┃ 🃏 ${usedPrefix}simpcard
┃ 🏳️‍⚧️ ${usedPrefix}trans
╰━━━━━━━━━━━━━━━━⬣

╭━━━〔 📌 𝐈𝐍𝐅𝐎 〕━⬣
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

handler.help = ['strumenti', 'menustrumenti']
handler.tags = ['menu']
handler.command = /^(strumenti|menustrumenti)$/i

export default handler