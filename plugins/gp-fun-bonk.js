// by Bonzino

const TEMPLATE_URL = 'https://i.imgur.com/nav6WWX.png'

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
      return await new Promise((res, rej) => image.getBuffer(mime, (e, b) => e ? rej(e) : res(b)))
    } catch {}
  }
  if (typeof image.getBufferAsync === 'function') return await image.getBufferAsync(mime)
  throw new Error('Jimp getBuffer compat failed')
}

function resolveTarget(m) {
  if (m.mentionedJid?.length) return m.mentionedJid[0]
  if (m.quoted) return m.quoted.sender
  return m.sender
}

let handler = async (m, { conn }) => {
  try {
    const sender = m.sender
    const who = jidNormalizedUser(resolveTarget(m))

    const avatarUrl = await conn.profilePictureUrl(who, 'image').catch(() => null)

    if (!avatarUrl) {
      return conn.reply(
        m.chat,
        '*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐡𝐚 𝐮𝐧𝐚 𝐟𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨.*',
        m,
        global.rcanal
      )
    }

    const Jimp = await getJimp()
    const img = await Jimp.read(TEMPLATE_URL)
    const avatar = await Jimp.read(avatarUrl)

    await resizeCompat(avatar, 128, 128)

    const modeOpt = (Jimp.BLEND_DESTINATION_OVER !== undefined)
      ? { mode: Jimp.BLEND_DESTINATION_OVER, opacitySource: 1, opacityDest: 1 }
      : { mode: 'dstOver', opacitySource: 1, opacityDest: 1 }

    img.composite(avatar, 120, 90, modeOpt)

    const png = await getBufferCompat(img, (Jimp.MIME_PNG || 'image/png'))

    const caption = sender === who
      ? '*🔨 𝐂𝐨𝐥𝐩𝐨 𝐚𝐮𝐭𝐨𝐢𝐧𝐟𝐥𝐢𝐭𝐭𝐨*'
      : '*🔨 𝐁𝐨𝐧𝐤!*'

    await conn.sendMessage(
      m.chat,
      {
        image: png,
        caption,
        mentions: [who],
        contextInfo: {
          ...(global.rcanal?.contextInfo || {})
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('[bonk:error]', e)
  await conn.reply(
    m.chat,
    `*❌ ERRORE:*\n\n\`\`\`${e.message}\`\`\``,
    m,
    global.rcanal
  )
}
}

handler.help = ['bonk']
handler.tags = ['fun']
handler.command = /^(bonk)$/i

export default handler