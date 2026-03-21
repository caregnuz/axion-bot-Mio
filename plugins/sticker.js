import { sticker } from '../lib/sticker.js'

const isUrl = (text = '') => {
  return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)(jpe?g|gif|png|webp)/gi.test(text)
}

let handler = async (m, { conn, args }) => {
  let stiker = false

  await conn.sendMessage(m.chat, {
    react: { text: '⚙️', key: m.key }
  })

  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (/webp|image|video/g.test(mime)) {
      if (/video/g.test(mime) && (q.msg || q).seconds > 10) {
        await conn.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        })

        return await conn.sendMessage(m.chat, {
          text: '*ℹ️ 𝐈𝐥 𝐯𝐢𝐝𝐞𝐨 𝐝𝐞𝐯𝐞 𝐝𝐮𝐫𝐚𝐫𝐞 𝐦𝐞𝐧𝐨 𝐝𝐢 𝟏𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢.*',
          ...global.rcanal
        }, { quoted: m })
      }

      const media = await q.download?.()
      if (!media) {
        await conn.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        })

        return await conn.sendMessage(m.chat, {
          text: '*⚠️ 𝐈𝐧𝐯𝐢𝐚 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞, 𝐯𝐢𝐝𝐞𝐨 𝐨 𝐆𝐈𝐅.*',
          ...global.rcanal
        }, { quoted: m })
      }

      const packName = global.authsticker || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
      const authorName = global.nomepack || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

      stiker = await sticker(media, false, packName, authorName)
    } else if (args[0]) {
      if (!isUrl(args[0])) {
        await conn.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        })

        return await conn.sendMessage(m.chat, {
          text: '*『 🔗 』- 𝐔𝐑𝐋 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*',
          ...global.rcanal
        }, { quoted: m })
      }

      const packName = global.authsticker || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
      const authorName = global.nomepack || '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

      stiker = await sticker(false, args[0], packName, authorName)
    }
  } catch (e) {
    console.error('Errore sticker:', e)
    stiker = false
  }

  if (stiker && stiker !== true) {
    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

    await conn.sendFile(
      m.chat,
      stiker,
      'sticker.webp',
      null,
      m,
      true
    )
  } else {
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })

    await conn.sendMessage(m.chat, {
      text: '*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞 𝐨 𝐢𝐧𝐯𝐢𝐚 𝐮𝐧 𝐥𝐢𝐧𝐤.*',
      ...global.rcanal
    }, { quoted: m })
  }
}

handler.help = ['s', 'sticker', 'stiker']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']
handler.register = true

export default handler