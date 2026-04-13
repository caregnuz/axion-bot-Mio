//by Bonzino

import { generateWAMessageFromContent } from '@realvare/based'

let handler = async (m, { conn, participants, text, command }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id))

    const testo = (text || '').trim() || '*⚠️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐚 𝐭𝐮𝐭𝐭𝐢.*'

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        extendedTextMessage: {
          text: testo,
          contextInfo: {
            mentionedJid: users
          }
        }
      },
      { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  } catch (e) {
    console.error('everyone error:', e)
    await conn.reply(m.chat, global.errore, m)
  }
}

handler.customPrefix = /^@/
handler.command = /^(everyone|tutti|all)$/i
handler.help = ['@everyone', '@tutti', '@all']
handler.tags = ['gruppo']
handler.group = true
handler.admin = true

export default handler