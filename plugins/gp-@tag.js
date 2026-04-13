//by Bonzino

import { generateWAMessageFromContent } from '@realvare/based'

const handler = async (m, { conn, participants }) => {
  try {
    const users = participants.map(u => conn.decodeJid(u.id))

    const testo = m.text
      .replace(/@(everyone|tutti|all)/i, '')
      .trim() || '*⚠️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐚 𝐭𝐮𝐭𝐭𝐢.*'

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
  }
}

handler.customPrefix = /@(everyone|tutti|all)/i
handler.command = new RegExp

handler.help = ['@everyone', '@tutti', '@all']
handler.tags = ['gruppo']
handler.group = true
handler.admin = true

export default handler