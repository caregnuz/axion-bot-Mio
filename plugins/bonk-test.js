// bonk2 - fix offset + immagine singola

import fs from 'fs'
import fetch from 'node-fetch'
import { spawn } from 'child_process'

const BASE_PATH = './media/bonk.png'
const TMP_DIR = './tmp_bonk'
const OUT_FILE = './tmp_bonk/bonk.mp4'

const HEAD_X = 350
const HEAD_Y = 180
const HEAD_SIZE = 120

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

async function fetchAvatarBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function clampCrop(img, x, y, w, h) {
  const maxW = img.bitmap.width
  const maxH = img.bitmap.height

  x = Math.max(0, Math.min(x, maxW - 1))
  y = Math.max(0, Math.min(y, maxH - 1))

  w = Math.min(w, maxW - x)
  h = Math.min(h, maxH - y)

  return { x, y, w, h }
}

async function buildFrames(avatarUrl) {
  const Jimp = await getJimp()

  const base = await Jimp.read(fs.readFileSync(BASE_PATH))

  // SAFE crop mazza (niente crash)
  const crop = clampCrop(base, 300, 0, 400, 300)
  const hammer = base.clone().crop(crop.x, crop.y, crop.w, crop.h)

  const avatarBuffer = await fetchAvatarBuffer(avatarUrl)
  const avatar = await Jimp.read(avatarBuffer)
  avatar.resize(HEAD_SIZE, HEAD_SIZE)

  const frames = []

  // frame 1
  let f1 = base.clone()
  f1.composite(avatar, HEAD_X, HEAD_Y)
  frames.push(f1)

  // frame 2 (alzata)
  let f2 = base.clone()
  f2.composite(avatar, HEAD_X, HEAD_Y)
  f2.composite(hammer.clone().rotate(-30), 200, -40)
  frames.push(f2)

  // frame 3 (discesa)
  let f3 = base.clone()
  f3.composite(avatar, HEAD_X + 4, HEAD_Y)
  f3.composite(hammer.clone().rotate(-10).blur(1), 250, 30)
  frames.push(f3)

  // frame 4 (impatto)
  let f4 = base.clone()
  f4.composite(avatar, HEAD_X - 10, HEAD_Y + 6)
  f4.composite(hammer.clone().rotate(-5).blur(2), 300, 80)

  f4.scan(0, 0, f4.bitmap.width, f4.bitmap.height, function (x, y, idx) {
    if (Math.random() < 0.01) {
      this.bitmap.data.writeUInt32BE(Jimp.rgbaToInt(255,255,255,255), idx)
    }
  })

  frames.push(f4)

  return frames
}

async function renderMp4(frames) {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR)

  for (let i = 0; i < frames.length; i++) {
    await frames[i].writeAsync(`${TMP_DIR}/f${i}.png`)
  }

  return new Promise((resolve, reject) => {
    const ff = spawn('ffmpeg', [
      '-y',
      '-framerate', '6',
      '-i', `${TMP_DIR}/f%d.png`,
      '-pix_fmt', 'yuv420p',
      OUT_FILE
    ])

    ff.on('close', resolve)
    ff.on('error', reject)
  })
}

let handler = async (m, { conn, text }) => {
  try {
    const who = resolveTarget(m, text)

    let avatarUrl
    try {
      avatarUrl = await conn.profilePictureUrl(who, 'image')
    } catch {
      return conn.reply(m.chat, '*⚠️ Questo utente non ha foto profilo.*', m)
    }

    const frames = await buildFrames(avatarUrl)
    await renderMp4(frames)

    await conn.sendMessage(
      m.chat,
      {
        video: fs.readFileSync(OUT_FILE),
        caption: '*🔨 𝐁𝐨𝐧𝐤!*'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `Errore:\n${e.message}`, m)
  }
}

handler.command = ['bonk2']
handler.tags = ['fun']
handler.help = ['bonk2 @utente']

export default handler