// bonk finale su template video
// by 𝕯𝖊ⱥ𝖑𝐝𝖞 × Bonzino

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import { spawn } from 'child_process'

const TEMPLATE = './media/bonk.mp4'
const TMP = './tmp_bonk_video'
const OUT = './tmp_bonk_video/out.mp4'

const HEAD_X = 180
const HEAD_Y = 260
const SIZE = 120

function resolveTarget(m, text = '') {
  const raw = String(text || '').trim()
  const digits = raw.replace(/\D/g, '')

  if (digits.length >= 7 && digits.length <= 15) return digits + '@s.whatsapp.net'
  if (m.mentionedJid?.length) return m.mentionedJid[0]
  if (m.quoted) return m.quoted.sender
  return m.sender
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args)
    let stderr = ''

    p.stderr.on('data', d => stderr += d.toString())
    p.on('error', reject)
    p.on('close', code => {
      if (code === 0) resolve()
      else reject(new Error(stderr || `${cmd} exit ${code}`))
    })
  })
}

async function fetchAvatarBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function ensureCleanDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    return
  }

  for (const file of fs.readdirSync(dir)) {
    try {
      fs.unlinkSync(path.join(dir, file))
    } catch {}
  }
}

let handler = async (m, { conn, text }) => {
  try {
    const who = conn.decodeJid(resolveTarget(m, text))

    let pfp
    try {
      pfp = await conn.profilePictureUrl(who, 'image')
    } catch {
      return conn.reply(
        m.chat,
        '*⚠️ 𝐍𝐨𝐧 𝐫𝐢𝐞𝐬𝐜𝐨 𝐚 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐚𝐫𝐞 𝐥𝐚 𝐟𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨.*',
        m,
        global.rcanal
      )
    }

    ensureCleanDir(TMP)

    const avatarBuffer = await fetchAvatarBuffer(pfp)
    fs.writeFileSync(`${TMP}/avatar.png`, avatarBuffer)

    // estraggo i frame SENZA crop e SENZA alterare il canvas
    await run('ffmpeg', [
      '-y',
      '-i', TEMPLATE,
      `${TMP}/frame_%03d.png`
    ])

    const frames = fs.readdirSync(TMP)
      .filter(f => /^frame_\d+\.png$/.test(f))
      .sort()

    // overlay avatar mantenendo intatto il frame originale
    for (const f of frames) {
      await run('ffmpeg', [
        '-y',
        '-i', `${TMP}/${f}`,
        '-i', `${TMP}/avatar.png`,
        '-filter_complex',
        [
          `[1:v]scale=${SIZE}:${SIZE}[a]`,
          `[0:v][a]overlay=${HEAD_X}:${HEAD_Y}`
        ].join(';'),
        `${TMP}/out_${f}`
      ])
    }

    // ricompongo senza forzare scale strane
    await run('ffmpeg', [
      '-y',
      '-framerate', '10',
      '-i', `${TMP}/out_frame_%03d.png`,
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      OUT
    ])

    await conn.sendMessage(
      m.chat,
      {
        video: fs.readFileSync(OUT),
        mimetype: 'video/mp4',
        caption: '*🔨 𝐁𝐨𝐧𝐤!*',
        mentions: [who],
        contextInfo: {
          ...(global.rcanal?.contextInfo || {})
        }
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('[bonk2:error]', e)
    await conn.reply(
      m.chat,
      `*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*\n\n\`\`\`${e.message || e}\`\`\``,
      m,
      global.rcanal
    )
  }
}

handler.command = ['bonk2']
handler.tags = ['fun']
handler.help = ['bonk2 @utente', 'bonk2 numero']

export default handler