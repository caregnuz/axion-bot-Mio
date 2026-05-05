import fetch from 'node-fetch'
import FormData from 'form-data'
import dotenv from 'dotenv'

dotenv.config()

const box = (emoji, title, body) => `*╭━━━━━━━${emoji}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${emoji}━━━━━━━╯*

${body}`

async function trascriviGladia(buffer) {
  const key = process.env.GLADIA_API_KEY
  if (!key) throw '𝐀𝐏𝐈 𝐊𝐄𝐘 𝐦𝐚𝐧𝐜𝐚𝐧𝐭𝐞'

  const form = new FormData()
  form.append('audio', buffer, {
    filename: 'audio.ogg',
    contentType: 'audio/ogg'
  })

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 20000) // ⛔ timeout 20s

  const res = await fetch('https://api.gladia.io/audio/text/audio-transcription', {
    method: 'POST',
    headers: {
      'x-gladia-key': key,
      ...form.getHeaders()
    },
    body: form,
    signal: controller.signal
  }).catch(() => null)

  clearTimeout(timeout)

  if (!res) throw '𝐑𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐚 𝐭𝐢𝐦𝐞𝐨𝐮𝐭'

  const data = await res.json()

  if (!res.ok) throw JSON.stringify(data)

  let text = ''
  let lang = 'unknown'

  if (Array.isArray(data.prediction)) {
    text = data.prediction.map(x => x.transcription || '').join(' ')
    lang = data.prediction[0]?.language || 'unknown'
  }

  if (!text && typeof data.text === 'string') text = data.text

  if (!text) throw '𝐓𝐫𝐚𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞 𝐯𝐮𝐨𝐭𝐚'

  return { text: text.trim(), lang }
}

let handler = async (m, { conn }) => {
  const chat = m.chat
  const start = Date.now()

  await conn.sendMessage(chat, {
    text: box('🎙️','𝐓𝐑𝐀𝐒𝐂𝐑𝐈𝐙𝐈𝐎𝐍𝐄',`*𝐄𝐥𝐚𝐛𝐨𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...*`),
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
  }, { quoted: m })

  let media = null

  try {
    if (m.quoted) media = await m.quoted.download()
  } catch {}

  if (!media) {
    try {
      media = await m.download()
    } catch {}
  }

  if (!media) {
    return conn.sendMessage(chat, {
      text: box(
        '⚠️',
        '𝐀𝐔𝐃𝐈𝐎 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎',
        `*𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐯𝐨𝐜𝐚𝐥𝐞 𝐨 𝐢𝐧𝐯𝐢𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐜𝐨𝐧 .𝐭𝐫𝐚𝐬𝐜𝐫𝐢𝐯𝐢*`
      ),
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
    }, { quoted: m })
  }

  try {
    const { text, lang } = await trascriviGladia(media)

    const time = ((Date.now() - start) / 1000).toFixed(2)

    await conn.sendMessage(chat, {
      text: box(
        '📝',
        '𝐓𝐑𝐀𝐒𝐂𝐑𝐈𝐙𝐈𝐎𝐍𝐄',
        `*🌍 𝐋𝐢𝐧𝐠𝐮𝐚:* *${lang}*

*${text}*

*⏱️ 𝐓𝐞𝐦𝐩𝐨:* *${time}s*`
      ),
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
    }, { quoted: m })

  } catch (e) {
    await conn.sendMessage(chat, {
      text: box(
        '❌',
        '𝐄𝐑𝐑𝐎𝐑𝐄',
        `*${String(e).slice(0, 200)}*`
      ),
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
    }, { quoted: m })
  }
}

handler.command = /^(trascrivi|transcribe)$/i
handler.group = true

export default handler