// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import { sticker } from '../lib/sticker.js'

const S = v => String(v || '')

async function react(m, emoji) {
  try {
    await m.react(emoji)
  } catch {}
}

function isAnimatedSticker(q) {
  return !!(
    q?.msg?.isAnimated ||
    q?.isAnimated ||
    q?.message?.stickerMessage?.isAnimated ||
    q?.msg?.contextInfo?.isAnimated
  )
}

let handler = async (m, { conn, text }) => {
  try {
    await react(m, '⏳')

    let q = m.quoted ? m.quoted : m
    let msg = q.msg || q
    let mime = msg.mimetype || ''

    if (!/image|video|webp/.test(mime)) {
      await react(m, '⚠️')
      return await conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧’𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞, 𝐯𝐢𝐝𝐞𝐨 𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    let nomeUtente
try {
  nomeUtente = await conn.getName(m.sender)
} catch {
  nomeUtente = 'Utente'
}

    let packname = nomeUtente
    let author = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

    if (S(text).trim()) {
      if (text.includes('|')) {
        let [customPack, ...customAuthor] = text.split('|')
        packname = S(customPack).trim() || nomeUtente
        author = S(customAuthor.join('|')).trim() || author
      } else {
        packname = S(text).trim()
        author = ''
      }
    }

    let media = await q.download()

    if (!media) {
      await react(m, '❌')
      return await conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐈𝐦𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞 𝐬𝐜𝐚𝐫𝐢𝐜𝐚𝐫𝐞 𝐢𝐥 𝐦𝐞𝐝𝐢𝐚.*'
      }, { quoted: m })
    }

    if (/webp/.test(mime) && isAnimatedSticker(q)) {
      await conn.sendMessage(m.chat, {
        sticker: media
      }, { quoted: m })

      await react(m, '✅')
      return
    }

    let stiker = await sticker(
      media,
      false,
      packname,
      author
    )

    if (!stiker) {
      await react(m, '❌')
      return await conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐂𝐫𝐞𝐚𝐳𝐢𝐨𝐧𝐞 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐧𝐨𝐧 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐚.*'
      }, { quoted: m })
    }

    await conn.sendFile(
      m.chat,
      stiker,
      'sticker.webp',
      '',
      m,
      true
    )

    await react(m, '✅')

  } catch (e) {
    console.error('Errore sticker.js:', e)

    await react(m, '❌')

    await conn.sendMessage(m.chat, {
      text: `*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐜𝐫𝐞𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*\n\n\`\`\`${S(e?.message || e).slice(0, 800)}\`\`\``
    }, { quoted: m })
  }
}

handler.help = [
  's',
  's <nome>',
  's <pack|autore>',
  'sticker',
  'stiker'
]

handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']

export default handler