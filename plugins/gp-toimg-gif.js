// by Bonzino

import { tmpdir } from 'os'
import { join } from 'path'
import { promises as fs } from 'fs'
import { spawn } from 'child_process'

function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args)

    let stdout = ''
    let stderr = ''

    p.stdout.on('data', d => stdout += d.toString())
    p.stderr.on('data', d => stderr += d.toString())

    p.on('error', reject)

    p.on('close', code => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(stderr || stdout || `Errore eseguendo ${cmd}`))
    })
  })
}

// statico -> png
async function webpToPng(input, output) {
  await run('dwebp', [input, '-o', output])
}

// animato -> gif
async function webpToGif(input, output) {
  await run('magick', [input, output])
}

function getQuotedStickerInfo(q) {
  const msg = q?.msg || q || {}
  const mime = msg.mimetype || ''
  const isAnimated =
    !!msg.isAnimated ||
    !!q?.isAnimated ||
    !!q?.message?.stickerMessage?.isAnimated

  return { mime, isAnimated }
}

let handler = async (m, { conn, command }) => {
  let inputPath
  let outputPath

  try {
    const q = m.quoted ? m.quoted : null
    const { mime, isAnimated } = getQuotedStickerInfo(q)

    if (!q || !/webp/i.test(mime)) {
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    const media = await q.download()

    if (!media) {
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐥𝐞𝐭𝐭𝐮𝐫𝐚 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    const base = `sticker_${Date.now()}_${Math.floor(Math.random() * 99999)}`
    inputPath = join(tmpdir(), `${base}.webp`)
    await fs.writeFile(inputPath, media)

    if (/^(toimg|img)$/i.test(command)) {
      if (isAnimated) {
        return conn.sendMessage(m.chat, {
          text: '*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 è 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐚𝐧𝐢𝐦𝐚𝐭𝐨. 𝐔𝐬𝐚 `.togif` 𝐨 `.gif`.*'
        }, { quoted: m })
      }

      outputPath = join(tmpdir(), `${base}.png`)
      await webpToPng(inputPath, outputPath)

      const pngBuffer = await fs.readFile(outputPath)

      await conn.sendMessage(m.chat, {
        image: pngBuffer,
        caption:
`*╭━━━━━━━🖼️━━━━━━━╮*
*✦ 𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐈𝐎𝐍𝐄 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐀 ✦*
*╰━━━━━━━🖼️━━━━━━━╯*`,
        contextInfo: {
          ...(global.rcanal?.contextInfo || {})
        }
      }, { quoted: m })

      return
    }

    if (/^(togif|gif)$/i.test(command)) {
      if (!isAnimated) {
        return conn.sendMessage(m.chat, {
          text: '*⚠️ 𝐐𝐮𝐞𝐬𝐭𝐨 𝐧𝐨𝐧 è 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫 𝐚𝐧𝐢𝐦𝐚𝐭𝐨. 𝐔𝐬𝐚 `.toimg` 𝐨 `.img`.*'
        }, { quoted: m })
      }

      outputPath = join(tmpdir(), `${base}.gif`)
      await webpToGif(inputPath, outputPath)

      const gifBuffer = await fs.readFile(outputPath)

      await conn.sendMessage(m.chat, {
        document: gifBuffer,
        mimetype: 'image/gif',
        fileName: 'sticker.gif',
        caption:
`*╭━━━━━━━🎞️━━━━━━━╮*
*✦ 𝐂𝐎𝐍𝐕𝐄𝐑𝐒𝐈𝐎𝐍𝐄 𝐂𝐎𝐌𝐏𝐋𝐄𝐓𝐀𝐓𝐀 ✦*
*╰━━━━━━━🎞️━━━━━━━╯*`,
        contextInfo: {
          ...(global.rcanal?.contextInfo || {})
        }
      }, { quoted: m })

      return
    }

  } catch (e) {
    console.error('Errore conversione sticker:', e)

    const rawErr = String(e?.message || e || '')
    const err = rawErr.split('\n').slice(-10).join('\n').slice(0, 1200)

    await conn.sendMessage(m.chat, {
      text: `*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐜𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞.*\n\n\`\`\`${err || 'Errore sconosciuto'}\`\`\``
    }, { quoted: m })
  } finally {
    try {
      if (inputPath) await fs.unlink(inputPath)
      if (outputPath) await fs.unlink(outputPath)
    } catch {}
  }
}

handler.help = ['toimg', 'img', 'togif', 'gif']
handler.tags = ['sticker']
handler.command = /^(toimg|img|togif|gif)$/i

export default handler