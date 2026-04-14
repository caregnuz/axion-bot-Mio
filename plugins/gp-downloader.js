//by Bonzino

import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

function getEnvValue(name) {
  try {
    const envPath = '/home/falcox/axion-bot-Md/.env'
    const env = fs.readFileSync(envPath, 'utf8')
    const line = env
      .split('\n')
      .find(v => v.trim().startsWith(name + '='))

    if (!line) return null
    return line.slice(name.length + 1).trim().replace(/^['"]|['"]$/g, '')
  } catch {
    return null
  }
}

function isValidUrl(text) {
  try {
    const url = new URL(text)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function isTikTokUrl(url) {
  return url.includes('tiktok.com') || url.includes('vm.tiktok.com')
}

function isYouTubeUrl(url) {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

function sanitizeError(msg = '') {
  if (msg.includes('requiring login for access to this content')) {
    return 'TikTok richiede login per questo contenuto.'
  }

  if (msg.includes('HTTP Error 403: Forbidden')) {
    return 'Download bloccato dal sito sorgente.'
  }

  if (msg.includes('Video unavailable')) {
    return 'Contenuto non disponibile.'
  }

  if (msg.includes('Private video')) {
    return 'Contenuto privato.'
  }

  if (msg.includes('Sign in to confirm your age')) {
    return 'Contenuto con restrizione di età.'
  }

  return msg
}

async function hasBinary(bin) {
  try {
    await execFileAsync(bin, ['--version'], { timeout: 10000 })
    return true
  } catch {
    return false
  }
}

async function saveStreamToFile(url, filePath) {
  const res = await axios.get(url, {
    responseType: 'stream',
    timeout: 60000,
    headers: {
      'User-Agent': 'Mozilla/5.0'
    }
  })

  await new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(filePath)
    res.data.pipe(writer)
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

async function tiktokFallback1(url, mode, tmpDir) {
  const endpoints = [
    `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}`,
    `https://tikwm.com/api/?url=${encodeURIComponent(url)}`
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await axios.get(endpoint, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })

      const data = res.data?.data
      if (!data) continue

      if (mode === 'video') {
        const mediaUrl = data.play || data.wmplay
        if (!mediaUrl) continue

        const filePath = path.join(tmpDir, 'video.mp4')
        await saveStreamToFile(mediaUrl, filePath)
        return filePath
      }

      const audioUrl = data.music
      if (!audioUrl) continue

      const filePath = path.join(tmpDir, 'audio.mp3')
      await saveStreamToFile(audioUrl, filePath)
      return filePath
    } catch {}
  }

  throw new Error('Fallback TikTok 1 fallito.')
}

async function tiktokFallback2(url, mode, tmpDir) {
  const endpoints = [
    `https://tikdown.org/api/download?url=${encodeURIComponent(url)}`,
    `https://api.tiklydown.me/api/download?url=${encodeURIComponent(url)}`
  ]

  for (const endpoint of endpoints) {
    try {
      const res = await axios.get(endpoint, {
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })

      const data = res.data

      if (mode === 'video') {
        const mediaUrl =
          data?.video?.noWatermark ||
          data?.video?.watermark ||
          data?.video ||
          data?.data?.play

        if (!mediaUrl) continue

        const filePath = path.join(tmpDir, 'video.mp4')
        await saveStreamToFile(mediaUrl, filePath)
        return filePath
      }

      const audioUrl =
        data?.music ||
        data?.audio ||
        data?.data?.music

      if (!audioUrl) continue

      const filePath = path.join(tmpDir, 'audio.mp3')
      await saveStreamToFile(audioUrl, filePath)
      return filePath
    } catch {}
  }

  throw new Error('Fallback TikTok 2 fallito.')
}

function buildYtDlpBaseArgs(output, url) {
  const args = [
    '--no-playlist',
    '--no-warnings',
    '-o', output
  ]

  const cookiesPath = getEnvValue('YTDLP_COOKIES')
  if (cookiesPath && fs.existsSync(cookiesPath)) {
    args.push('--cookies', cookiesPath)
  }

  args.push(url)
  return args
}

async function runYtDlp(args) {
  return execFileAsync('yt-dlp', args, {
    timeout: 180000,
    maxBuffer: 1024 * 1024 * 10
  })
}

async function downloadVideo(url, tmpDir) {
  const output = path.join(tmpDir, 'video.%(ext)s')

  try {
    await runYtDlp([
      ...buildYtDlpBaseArgs(output, url).slice(0, -1),
      '-f', 'bv*+ba/b',
      '--merge-output-format', 'mp4',
      buildYtDlpBaseArgs(output, url).at(-1)
    ])
  } catch {
    try {
      await runYtDlp([
        ...buildYtDlpBaseArgs(output, url).slice(0, -1),
        '-f', 'best[ext=mp4]/best',
        '--merge-output-format', 'mp4',
        buildYtDlpBaseArgs(output, url).at(-1)
      ])
    } catch (e2) {
      if (isTikTokUrl(url)) {
        try {
          return await tiktokFallback1(url, 'video', tmpDir)
        } catch {
          return await tiktokFallback2(url, 'video', tmpDir)
        }
      }

      if (isYouTubeUrl(url)) {
        throw new Error('YouTube ha bloccato il download. Prova con cookies.txt.')
      }

      throw e2
    }
  }

  const file = fs.readdirSync(tmpDir).find(f =>
    f.endsWith('.mp4') || f.endsWith('.webm') || f.endsWith('.mkv')
  )

  if (!file) throw new Error('Video non trovato.')
  return path.join(tmpDir, file)
}

async function downloadAudio(url, tmpDir) {
  const output = path.join(tmpDir, 'audio.%(ext)s')

  try {
    await runYtDlp([
      ...buildYtDlpBaseArgs(output, url).slice(0, -1),
      '-f', 'bestaudio',
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '0',
      buildYtDlpBaseArgs(output, url).at(-1)
    ])
  } catch (e) {
    if (isTikTokUrl(url)) {
      try {
        return await tiktokFallback1(url, 'audio', tmpDir)
      } catch {
        return await tiktokFallback2(url, 'audio', tmpDir)
      }
    }

    if (isYouTubeUrl(url)) {
      throw new Error('YouTube ha bloccato l’audio. Prova con cookies.txt.')
    }

    throw e
  }

  const file = fs.readdirSync(tmpDir).find(f => f.endsWith('.mp3'))
  if (!file) throw new Error('Audio non trovato.')
  return path.join(tmpDir, file)
}

let handler = async (m, { conn, args, usedPrefix }) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dw-'))

  try {
    const mode = (args[0] || '').toLowerCase()
    const url = (mode === 'audio' || mode === 'video') ? args[1] : args[0]

    if (!url) {
      return m.reply('*⚠️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐥𝐢𝐧𝐤.*')
    }

    if (!isValidUrl(url)) {
      return m.reply('*⚠️ 𝐋𝐢𝐧𝐤 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*')
    }

    const hasYtDlp = await hasBinary('yt-dlp')
    if (!hasYtDlp && !isTikTokUrl(url)) {
      return m.reply('*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* yt-dlp non installato.')
    }

    if (mode !== 'audio' && mode !== 'video') {
      return conn.sendMessage(m.chat, {
        text: `*✅ 𝐒𝐂𝐄𝐆𝐋𝐈 𝐈𝐋 𝐅𝐎𝐑𝐌𝐀𝐓𝐎*\n\n🔗 ${url}`,
        footer: '',
        buttons: [
          {
            buttonId: `${usedPrefix}download video ${url}`,
            buttonText: { displayText: '🎬 𝐕𝐈𝐃𝐄𝐎' },
            type: 1
          },
          {
            buttonId: `${usedPrefix}download audio ${url}`,
            buttonText: { displayText: '🎧 𝐀𝐔𝐃𝐈𝐎' },
            type: 1
          }
        ],
        headerType: 1
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    })

    let filePath

    if (mode === 'audio') {
      filePath = await downloadAudio(url, tmpDir)

      await conn.sendMessage(m.chat, {
        audio: fs.readFileSync(filePath),
        mimetype: 'audio/mpeg',
        fileName: 'audio.mp3'
      }, { quoted: m })
    }

    if (mode === 'video') {
      filePath = await downloadVideo(url, tmpDir)

      await conn.sendMessage(m.chat, {
        video: fs.readFileSync(filePath),
        mimetype: 'video/mp4',
        fileName: 'video.mp4',
        caption: '*✅ 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐎*'
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('download error:', e)
    return m.reply(`*✅ 𝐄𝐫𝐫𝐨𝐫𝐞:* ${sanitizeError(e.message || String(e))}`)
  } finally {
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true })
    } catch {}
  }
}

handler.command = /^(download|dw)$/i
handler.tags = ['download']
handler.help = ['download', 'dw']

export default handler