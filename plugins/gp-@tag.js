//by Bonzino

import { generateWAMessageFromContent } from '@realvare/based'

let handler = m => m

handler.before = async function (m, { conn, participants, isAdmin }) {
  if (!m.isGroup) return
  if (!isAdmin) return
  if (!m.text) return
  if (!/@(everyone|tutti|all)\b/i.test(m.text)) return

  try {
    const users = participants.map(u => conn.decodeJid(u.id))

    const testo = m.text
      .replace(/@(everyone|tutti|all)\b/i, '')
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
    return true
  } catch (e) {
    console.error('everyone error:', e)
    await conn.reply(m.chat, global.errore, m)
    return true
  }
}

handler.help = ['@everyone', '@tutti', '@all']
handler.tags = ['gruppo']

export default handler