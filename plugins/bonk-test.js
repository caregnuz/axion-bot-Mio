// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const TMP_DIR = './tmp_bonk'
const OUT_FILE = './tmp_bonk/bonk.mp4'
const AUDIO_FILE = './media/bonk.mp3'

async function getJimp() {
  const mod = await import('jimp')
  return mod?.default || mod.Jimp || mod
}

function resolveTarget(m, text = '') {
  const raw = String(text || '').trim()
  const digits = raw.replace(/\D/g, '')

  if (digits.length >= 7 && digits.length <= 15) {
    return digits + '@s.whatsapp.net'
  }

  if (m.mentionedJid?.length) return m.mentionedJid[0]
  if (m.quoted) return m.quoted.sender
  return m.sender
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function clearDir(dir) {
  if (!fs.existsSync(dir)) return
  for (const file of fs.readdirSync(dir)) {
    fs.unlinkSync(path.join(dir, file))
  }
}

async function writeAsyncCompat(img, file) {
  if (typeof img.writeAsync === 'function') return img.writeAsync(file)
  return new Promise((resolve, reject) => {
    img.write(file, err => err ? reject(err) : resolve())
  })
}

async function resizeCompat(img, w, h) {
  try { return img.resize({ w, h }) } catch {}
  try { return img.resize(w, h) } catch {}
  return img
}

async function rotateCompat(img, deg) {
  try { return img.rotate(deg, false) } catch {}
  try { return img.rotate(deg) } catch {}
  return img
}

async function blurCompat(img, n) {
  try { return img.blur(n) } catch {}
  return img
}

function rgba(Jimp, r, g, b, a = 255) {
  return Jimp.rgbaToInt(r, g, b, a)
}

async function drawHammer() {
  const Jimp = await getJimp()
  const img = new Jimp(260, 260, 0x00000000)

  const gray1 = rgba(Jimp, 175, 180, 190)
  const gray2 = rgba(Jimp, 105, 112, 130)
  const brown1 = rgba(Jimp, 145, 92, 45)
  const brown2 = rgba(Jimp, 92, 55, 24)
  const black = rgba(Jimp, 20, 20, 20)

  img.scan(34, 38, 150, 88, function (x, y, idx) {
    const use = y < 82 ? gray1 : gray2
    this.bitmap.data.writeUInt32BE(use, idx)
  })

  img.scan(150, 72, 78, 28, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(brown1, idx)
  })

  img.scan(206, 68, 22, 36, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(brown2, idx)
  })

  img.scan(110, 68, 16, 28, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(rgba(Jimp, 214, 140, 40), idx)
  })

  img.scan(34, 38, 150, 4, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(black, idx)
  })
  img.scan(34, 122, 150, 4, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(black, idx)
  })
  img.scan(34, 38, 4, 88, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(black, idx)
  })
  img.scan(180, 38, 4, 88, function (x, y, idx) {
    this.bitmap.data.writeUInt32BE(black, idx)
  })

  return img
}

async function drawImpact() {
  const Jimp = await getJimp()
  const img = new Jimp(220, 220, 0x00000000)
  const yellow = rgba(Jimp, 255, 225, 40)
  const white = rgba(Jimp, 255, 255, 255)

  const cx = 110
  const cy = 110

  img.scan(0, 0, 220, 220, function (x, y, idx) {
    const dx = x - cx
    const dy = y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const ang = Math.atan2(dy, dx)
    const ray = 38 + 44 * Math.abs(Math.sin(ang * 6))
    if (dist < ray) this.bitmap.data.writeUInt32BE(yellow, idx)
    if (dist < 18) this.bitmap.data.writeUInt32BE(white, idx)
  })

  return img
}

async function drawText100() {
  const Jimp = await getJimp()
  const img = new Jimp(180, 120, 0x00000000)
  const yellow = rgba(Jimp, 255, 210, 0)
  const black = rgba(Jimp, 0, 0, 0)

  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE)
  img.print(font, 0, 10, '100')

  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    const a = this.bitmap.data[idx + 3]
    if (a > 0) {
      this.bitmap.data.writeUInt32BE(yellow, idx)
    }
  })

  const outline = new Jimp(img.bitmap.width + 8, img.bitmap.height + 8, 0x00000000)
  for (const [ox, oy] of [[0,4],[8,4],[4,0],[4,8],[1,1],[7,1],[1,7],[7,7]]) {
    outline.composite(img.clone().scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
      const a = this.bitmap.data[idx + 3]
      if (a > 0) this.bitmap.data.writeUInt32BE(black, idx)
    }), ox, oy)
  }
  outline.composite(img, 4, 4)
  return outline
}

async function fetchAvatarBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const arr = await res.arrayBuffer()
  return Buffer.from(arr)
}

async function buildFrames(avatarUrl) {
  const Jimp = await getJimp()
  const avatarBuffer = await fetchAvatarBuffer(avatarUrl)
  const avatarBase = await Jimp.read(avatarBuffer)
  const hammerBase = await drawHammer()
  const impact = await drawImpact()
  const text100 = await drawText100()

  await resizeCompat(avatarBase, 320, 320)

  const frames = []

  const makeBase = async (shakeX = 0, shakeY = 0, squash = false) => {
    let av = avatarBase.clone()
    if (squash) await resizeCompat(av, 320, 285)
    const canvas = new Jimp(512, 512, rgba(Jimp, 0, 0, 0, 0))
    canvas.composite(av, 96 + shakeX, squash ? 154 + shakeY : 128 + shakeY)
    return canvas
  }

  {
    const frame = await makeBase()
    const hammer = hammerBase.clone()
    await rotateCompat(hammer, -28)
    frame.composite(hammer, 150, -18)
    frames.push(frame)
  }

  {
    const frame = await makeBase(4, 0)
    const hammer = hammerBase.clone()
    await rotateCompat(hammer, -18)
    await blurCompat(hammer, 1)
    frame.composite(hammer, 150, 24)
    frames.push(frame)
  }

  {
    const frame = await makeBase(-8, 6, true)
    const hammer = hammerBase.clone()
    await rotateCompat(hammer, -8)
    await blurCompat(hammer, 2)
    frame.composite(hammer, 155, 86)
    frame.composite(impact, 182, 150)
    frame.composite(text100, 34, 220)
    frames.push(frame)
  }

  {
    const frame = await makeBase(10, -4, true)
    const hammer = hammerBase.clone()
    await rotateCompat(hammer, -4)
    frame.composite(hammer, 160, 95)
    frame.composite(impact.clone(), 188, 152)
    frame.composite(text100.clone(), 28, 224)
    await blurCompat(frame, 1)
    frames.push(frame)
  }

  {
    const frame = await makeBase(-4, 2)
    const hammer = hammerBase.clone()
    await rotateCompat(hammer, -10)
    frame.composite(hammer, 160, 70)
    frame.composite(text100.clone(), 40, 222)
    frames.push(frame)
  }

  return frames
}

async function renderMp4(frames) {
  ensureDir(TMP_DIR)
  clearDir(TMP_DIR)

  for (let i = 0; i < frames.length; i++) {
    await writeAsyncCompat(frames[i], path.join(TMP_DIR, `f${i}.png`))
  }

  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-framerate', '8',
      '-i', path.join(TMP_DIR, 'f%d.png')
    ]

    if (fs.existsSync(AUDIO_FILE)) {
      args.push('-i', AUDIO_FILE)
    }

    args.push(
      '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      '-movflags', '+faststart',
      OUT_FILE
    )

    const ff = spawn('ffmpeg', args)
    let stderr = ''

    ff.stderr.on('data', d => {
      stderr += d.toString()
    })

    ff.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(stderr || `ffmpeg exit ${code}`))
    })

    ff.on('error', reject)
  })
}

let handler = async (m, { conn, text }) => {
  try {
    const sender = conn.decodeJid(m.sender)
    const who = conn.decodeJid(resolveTarget(m, text))

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

    const frames = await buildFrames(avatarUrl)
    await renderMp4(frames)

    const caption = sender === who
      ? '*🔨 𝐂𝐨𝐥𝐩𝐨 𝐚𝐮𝐭𝐨𝐢𝐧𝐟𝐥𝐢𝐭𝐭𝐨*'
      : '*🔨 𝐁𝐨𝐧𝐤!*'

    await conn.sendMessage(
      m.chat,
      {
        video: fs.readFileSync(OUT_FILE),
        mimetype: 'video/mp4',
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
      `*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*\n\n\`\`\`${e.message || e}\`\`\``,
      m,
      global.rcanal
    )
  }
}

handler.help = ['bonk', 'bonk @utente', 'bonk numero']
handler.tags = ['fun']
handler.command = /^(bonk2)$/i

export default handler