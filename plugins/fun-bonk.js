// by 𝕯𝖊ⱥ𝖑𝐝𝖞 × Bonzino

import fs from 'fs'

const TEMPLATE_PATH = './media/bonk.png'
const tag = (jid = '') => '@' + String(jid).split('@')[0].split(':')[0]

async function getJimp() {
  const mod = await import('jimp')
  return mod?.default || mod.Jimp || mod
}

async function resizeCompat(img, w, h) {
  try { return img.resize({ w, h }) } catch {}
  try { return img.resize(w, h) } catch {}
  return img
}

async function getBufferCompat(image, mime) {
  if (typeof image.getBuffer === 'function') {
    try {
      const maybe = image.getBuffer(mime)
      if (maybe && typeof maybe.then === 'function') return await maybe
    } catch {}

    try {
      return await new Promise((res, rej) => {
        image.getBuffer(mime, (e, b) => e ? rej(e) : res(b))
      })
    } catch {}
  }

  if (typeof image.getBufferAsync === 'function') {
    return await image.getBufferAsync(mime)
  }

  throw new Error('Jimp getBuffer compat failed')
}

function decodeJid(conn, jid = '') {
  return conn.decodeJid ? conn.decodeJid(jid) : jid
}

function resolveTarget(m, text = '') {
  const raw = String(text || '').trim()
  const digits = raw.replace(/\D/g, '')

  if (digits.length >= 7 && digits.length <= 15) {
    return `${digits}@s.whatsapp.net`
  }

  if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) {
    return m.mentionedJid[0]
  }

  if (m.quoted?.sender) return m.quoted.sender
  if (m.quoted?.participant) return m.quoted.participant

  return m.sender
}

let handler = async (m, { conn, text }) => {
  try {
    if (!fs.existsSync(TEMPLATE_PATH)) {
      return conn.reply(
        m.chat,
        '*❌ 𝐅𝐢𝐥𝐞 𝐛𝐨𝐧𝐤.𝐩𝐧𝐠 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨 𝐢𝐧 ./𝐦𝐞𝐝𝐢𝐚/.*',
        m,
        global.rcanal
      )
    }

    const sender = decodeJid(conn, m.sender)
    const who = decodeJid(conn, resolveTarget(m, text))

    let avatarUrl

    try {
      avatarUrl = await conn.profilePictureUrl(who, 'image')
    } catch (e) {
      console.log('[bonk:pfp]', who, e?.message || e)

      return conn.reply(
        m.chat,
        '*⚠️ 𝐍𝐨𝐧 𝐫𝐢𝐞𝐬𝐜𝐨 𝐚 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐚𝐫𝐞 𝐥𝐚 𝐟𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨.*',
        m,
        global.rcanal
      )
    }

    const Jimp = await getJimp()

    const templateBuffer = fs.readFileSync(TEMPLATE_PATH)
    const img = await Jimp.read(templateBuffer)
    const avatar = await Jimp.read(avatarUrl)

    await resizeCompat(avatar, 128, 128)

    const blendMode = Jimp.BLEND_SOURCE_OVER ?? 'srcOver'

    img.composite(avatar, 120, 90, {
      mode: blendMode,
      opacitySource: 1,
      opacityDest: 1
    })

    const png = await getBufferCompat(img, Jimp.MIME_PNG || 'image/png')

    const caption = sender === who
      ? `*🔨 ${tag(sender)} 𝐬𝐢 è 𝐚𝐮𝐭𝐨-𝐛𝐨𝐧𝐤𝐚𝐭𝐨.*`
      : `*🔨 ${tag(sender)} 𝐡𝐚 𝐛𝐨𝐧𝐤𝐚𝐭𝐨 ${tag(who)}!*`

    await conn.sendMessage(
      m.chat,
      {
        image: png,
        caption,
        mentions: [sender, who],
        contextInfo: {
          ...(global.rcanal?.contextInfo || {}),
          mentionedJid: [sender, who]
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('[bonk:error]', e)

    await conn.reply(
      m.chat,
      `*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*\n\n\`\`\`${e.message || e}\`\`\``,
      m,
      global.rcanal
    )
  }
}

handler.help = ['bonk', 'bonk @utente', 'bonk numero']
handler.tags = ['fun']
handler.command = /^(bonk)$/i
handler.group = true

export default handler