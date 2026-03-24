// by Bonzino

import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  const target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
  const nome = await conn.getName(target)

  const profilo = await conn.profilePictureUrl(target, 'image')
    .catch(() => 'https://i.ibb.co/2kR7x9J/avatar.png')

  const thumbnailBuffer = typeof profilo === 'string'
    ? await (await fetch(profilo)).buffer()
    : profilo

  const messaggio = `*𝐓𝐄𝐒𝐓 𝐓𝐇𝐔𝐌𝐁𝐍𝐀𝐈𝐋*\n\n*👤 𝐍𝐨𝐦𝐞:* ${nome}`

  await conn.sendMessage(m.chat, {
    text: messaggio,
    mentions: [target],
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      mentionedJid: [target],
      externalAdReply: {
        title: nome,
        body: ' ',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.help = ['testhumb']
handler.tags = ['test']
handler.command = /^(testthumb)$/i

export default handler