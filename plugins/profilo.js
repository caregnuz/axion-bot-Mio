// by Bonzino

import fetch from 'node-fetch'
import { getLevelFull } from '../lib/levels.js'

const S = v => String(v || '')

function bare(j = '') {
  return S(j).split('@')[0].split(':')[0]
}

let handler = async (m, { conn }) => {
  let target = m.sender
  let user = global.db.data.users[target] || {}
  let chat = global.db.data.chats?.[m.chat] || {}

  let oggiCount = chat?.archivioMessaggi?.utenti?.[target]?.conteggio || 0

  let nome = await conn.getName(target)
  let totalMessages = user.messages || 0
  let monete = user.euro || 0
  let lvl = getLevelFull(totalMessages)

  let instagram = user.profile?.instagram
    ? `instagram.com/${user.profile.instagram}`
    : '𝐍𝐨𝐧 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨'

  let pp = 'https://i.ibb.co/2kR7x9J/avatar.png'
  try {
    pp = await conn.profilePictureUrl(target, 'image')
  } catch {}

  const thumbnailBuffer = await (await fetch(pp)).buffer()

  const text = `*╭━━━━━━━✨━━━━━━━╮*
   *✦ 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 ✦*
*╰━━━━━━━✨━━━━━━━╯*

*👤 𝐍𝐨𝐦𝐞:* ${nome}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢:* ${totalMessages}
*📅 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐨𝐠𝐠𝐢:* ${oggiCount}
*🧠 𝐋𝐢𝐯𝐞𝐥𝐥𝐨:* ${lvl.level} (${lvl.icon} ${lvl.name})
*📈 𝐏𝐫𝐨𝐠𝐫𝐞𝐬𝐬𝐨:* ${lvl.bar} ${lvl.percent}%
*⬆️ 𝐏𝐫𝐨𝐬𝐬𝐢𝐦𝐨:* ${lvl.isMax ? '*𝐌𝐀𝐗*' : `${lvl.nextName} (${lvl.remaining} msg)`}
*🪙 𝐌𝐨𝐧𝐞𝐭𝐞:* ${monete}
*📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦:* ${instagram}`

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      mentionedJid: [target],
      externalAdReply: {
        title: nome,
        body: '',
        thumbnail: thumbnailBuffer,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.command = /^(profilo|profile)$/i

export default handler