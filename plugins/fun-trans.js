import { applyPrideEffect, getTarget, getTargetName, getProfilePicture } from '../lib/fun-canvas.js'

let handler = async (m, { conn, usedPrefix, command }) => {
  const who = getTarget(m)

  if (!who) {
    return m.reply(`*Esempio:* ${usedPrefix + command} @utente`)
  }

  try {
    const buffer = await getProfilePicture(conn, who)
    const finalBuffer = await applyPrideEffect(buffer, 'trans')

    const nome = await getTargetName(conn, who)

    await conn.sendFile(
      m.chat,
      finalBuffer,
      'trans.jpg',
      `*🏳️‍⚧️ @${who.split('@')[0]} (${nome}) è diventato trans*`,
      m,
      false,
      {
        mentions: [who]
      }
    )

  } catch (e) {
    console.error(e)
    m.reply(`*❌ Errore durante l'effetto*`)
  }
}

handler.help = ['trans @utente']
handler.tags = ['fun']
handler.command = /^trans$/i

export default handler