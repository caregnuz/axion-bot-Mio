import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn }) => {
  try {
    await conn.sendMessage(m.chat, {
      react: { text: '⚙️', key: m.key }
    })

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!/image|video|webp/.test(mime)) {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      })

      return await conn.sendMessage(m.chat, {
        text: '*『 ⚠️ 』- 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞 𝐨 𝐚 𝐮𝐧 𝐯𝐢𝐝𝐞𝐨.*',
        ...global.rcanal
      }, { quoted: m })
    }

    if (/video/.test(mime) && (q.msg || q).seconds > 10) {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      })

      return await conn.sendMessage(m.chat, {
        text: '*『 ⚠️ 』- 𝐈𝐥 𝐯𝐢𝐝𝐞𝐨 𝐝𝐞𝐯𝐞 𝐝𝐮𝐫𝐚𝐫𝐞 𝐦𝐞𝐧𝐨 𝐝𝐢 𝟏𝟎 𝐬𝐞𝐜𝐨𝐧𝐝𝐢.*',
        ...global.rcanal
      }, { quoted: m })
    }

    let media = await q.download()
    let stiker = await sticker(media, false, '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓', '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓')

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

    await conn.sendFile(m.chat, stiker, 'sticker.webp', null, m, true)

  } catch (e) {
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    })

    await conn.sendMessage(m.chat, {
      text: '*『 ⚠️ 』- 𝐒𝐢 è 𝐯𝐞𝐫𝐢𝐟𝐢𝐜𝐚𝐭𝐨 𝐮𝐧 𝐞𝐫𝐫𝐨𝐫𝐞.*',
      ...global.rcanal
    }, { quoted: m })
  }
}

handler.help = ['s']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']
handler.register = true

export default handler