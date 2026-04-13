// by 𝕯𝖊ⱥ𝖑𝐝𝖞 × Bonzino

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { spawn } from 'child_process'

const BASE_PATH = './media/bonk.png'
const AUDIO_PATH = './media/bonk.mp3'
const TMP_DIR = './tmp_bonk'
const OUT_FILE = './tmp_bonk/bonk.mp4'

// posizione testa nella tua immagine
const HEAD_X = 430
const HEAD_Y = 245
const HEAD_SIZE = 165

// posizione mazza ritagliata dalla tua immagine
const HAMMER_X = 430
const HAMMER_Y = 70
const HAMMER_W = 470
const HAMMER_H = 420

async function getJimp() {
  const mod = await import('jimp')
  return mod?.default || mod.Jimp || mod
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function clearDir(dir) {
  if (!fs.existsSync(dir)) return
  for (const file of fs.readdirSync(dir)) {
    try { fs.unlinkSync(path.join(dir, file)) } catch {}
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

async function fetchAvatarBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function makeCircleMask(Jimp, size) {
  const mask = new Jimp(size, size, 0x00000000)
  const r = size / 2
  const cx = r
  const cy = r
  const white = Jimp.rgbaToInt(255, 255, 255, 255)

  mask.scan(0, 0, size, size, function (x, y, idx) {
    const dx = x - cx
    const dy = y - cy
    if ((dx * dx) + (dy * dy) <= r * r) {
      this.bitmap.data.writeUInt32BE(white, idx)
    }
  })

  return mask
}

async function cropCircleAvatar(Jimp, avatar) {
  const mask = makeCircleMask(Jimp, HEAD_SIZE)
  await resizeCompat(avatar, HEAD_SIZE, HEAD_SIZE)

  avatar.mask(mask, 0, 0)

  return avatar
}

async function makeImpact(Jimp) {
  const impact = new Jimp(220, 220, 0x00000000)
  const yellow = Jimp.rgbaToInt(255, 220, 40, 255)
  const white = Jimp.rgbaToInt(255, 255, 255, 255)
  const cx = 110
  const cy = 110

  impact.scan(0, 0, 220, 220, function (x, y, idx) {
    const dx = x - cx
    const dy = y - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const ang = Math.atan2(dy, dx)
    const ray = 24 + 60 * Math.abs(Math.sin(ang * 6))
    if (dist < ray) this.bitmap.data.writeUInt32BE(yellow, idx)
    if (dist < 18) this.bitmap.data.writeUInt32BE(white, idx)
  })

  return impact
}

async function makeBonkText(Jimp) {
  const img = new Jimp(260, 120, 0x00000000)
  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE)
  const yellow = Jimp.rgbaToInt(255, 210, 0, 255)
  const black = Jimp.rgbaToInt(0, 0, 0, 255)

  img.print(font, 10, 20, 'BONK')

  img.scan(0, 0, img.bitmap.width, img.bitmap.height, function (x, y, idx) {
    const a = this.bitmap.data[idx + 3]
    if (a > 0) this.bitmap.data.writeUInt32BE(yellow, idx)
  })

  const out = new Jimp(img.bitmap.width + 8, img.bitmap.height + 8, 0x00000000)

  for (const [ox, oy] of [[0,4],[8,4],[4,0],[4,8],[1,1],[7,1],[1,7],[7,7]]) {
    const shadow = img.clone()
    shadow.scan(0, 0, shadow.bitmap.width, shadow.bitmap.height, function (x, y, idx) {
      const a = this.bitmap.data[idx + 3]
      if (a > 0) this.bitmap.data.writeUInt32BE(black, idx)
    })
    out.composite(shadow, ox, oy)
  }

  out.composite(img, 4, 4)
  return out
}

async function buildFrames(avatarUrl) {
  const Jimp = await getJimp()

  const base = await Jimp.read(fs.readFileSync(BASE_PATH))
  const hammerSource = base.clone().crop(HAMMER_X, HAMMER_Y, HAMMER_W, HAMMER_H)

  const avatarBuffer = await fetchAvatarBuffer(avatarUrl)
  const avatarBase = await Jimp.read(avatarBuffer)
  const avatar = await cropCircleAvatar(Jimp, avatarBase)

  const impact = await makeImpact(Jimp)
  const bonkText = await makeBonkText(Jimp)

  const frames = []

  const buildBaseFrame = (ax = 0, ay = 0, blur = 0) => {
    const frame = base.clone()
    const av = avatar.clone()
    if (blur > 0) blurCompat(av, blur)
    frame.composite(av, HEAD_X + ax, HEAD_Y + ay)
    return frame
  }

  // frame 1: stato base, mazza giù come nell'immagine originale
  {
    const frame = buildBaseFrame(0, 0, 0)
    frames.push(frame)
  }

  // frame 2: mazza alzata
  {
    const frame = buildBaseFrame(0, 0, 0)

    // copertura semplice zona mazza originale
    const cover = new Jimp(HAMMER_W + 30, HAMMER_H + 30, 0x00000000)
    frame.composite(cover, HAMMER_X - 10, HAMMER_Y - 10)

    const hammer = hammerSource.clone()
    await rotateCompat(hammer, -35)
    frame.composite(hammer, 320, -20)

    frames.push(frame)
  }

  // frame 3: discesa
  {
    const frame = buildBaseFrame(3, 0, 0)
    const cover = new Jimp(HAMMER_W + 30, HAMMER_H + 30, 0x00000000)
    frame.composite(cover, HAMMER_X - 10, HAMMER_Y - 10)

    const hammer = hammerSource.clone()
    await rotateCompat(hammer, -18)
    await blurCompat(hammer, 1)
    frame.composite(hammer, 365, 18)

    frames.push(frame)
  }

  // frame 4: impatto
  {
    const frame = buildBaseFrame(-10, 8, 1)
    const cover = new Jimp(HAMMER_W + 30, HAMMER_H + 30, 0x00000000)
    frame.composite(cover, HAMMER_X - 10, HAMMER_Y - 10)

    const hammer = hammerSource.clone()
    await rotateCompat(hammer, -5)
    await blurCompat(hammer, 2)
    frame.composite(hammer, 415, 68)

    frame.composite(impact, 410, 205)
    frame.composite(bonkText, 240, 120)

    frames.push(frame)
  }

  // frame 5: rimbalzo
  {
    const frame = buildBaseFrame(9, -4, 0)
    const cover = new Jimp(HAMMER_W + 30, HAMMER_H + 30, 0x00000000)
    frame.composite(cover, HAMMER_X - 10, HAMMER_Y - 10)

    const hammer = hammerSource.clone()
    await rotateCompat(hammer, -12)
    frame.composite(hammer, 395, 36)
    frame.composite(impact.clone(), 415, 205)

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
      '-framerate', '7',
      '-i', path.join(TMP_DIR, 'f%d.png')
    ]

    if (fs.existsSync(AUDIO_PATH)) {
      args.push('-i', AUDIO_PATH)
    }

    args.push(
      '-vf', 'scale=720:-2',
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
handler.command = /^(bonk)$/i

export default handler