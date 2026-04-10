// by Bonzino

import { tmpdir } from 'os'
import { join } from 'path'
import { promises as fs } from 'fs'
import { spawn } from 'child_process'

/*
  Piccola utility per eseguire ffmpeg.
  Serve per convertire gli sticker nei formati desiderati.
*/
function run(cmd, args = []) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args)

    let stdout = ''
    let stderr = ''

    p.stdout.on('data', d => stdout += d)
    p.stderr.on('data', d => stderr += d)

    p.on('error', reject)

    p.on('close', code => {
      if (code === 0) resolve({ stdout, stderr })
      else reject(new Error(stderr || stdout))
    })
  })
}

/*
  Converte sticker normale in PNG.
*/
async function webpToPng(input, output) {
  await run('ffmpeg', [
    '-y',
    '-i', input,
    '-frames:v', '1',
    output
  ])
}

/*
  Converte sticker animato in GIF.
*/
async function webpToGif(input, output) {
  await run('ffmpeg', [
    '-y',
    '-i', input,
    output
  ])
}

/*
  Controlla se il file WEBP è animato.
*/
function isAnimatedWebp(buffer) {
  return buffer.includes(Buffer.from('ANIM'))
}

let handler = async (m, { conn }) => {
  let inputPath
  let outputPath

  try {

    // prende il messaggio quotato
    const q = m.quoted ? m.quoted : null
    const mime = (q?.msg || q)?.mimetype || ''

    // verifica che sia uno sticker
    if (!q || !/webp/i.test(mime)) {
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    // scarica sticker
    const media = await q.download()

    if (!media) {
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐥𝐞𝐭𝐭𝐮𝐫𝐚 𝐝𝐞𝐥𝐥𝐨 𝐬𝐭𝐢𝐜𝐤𝐞𝐫.*'
      }, { quoted: m })
    }

    // crea file temporaneo
    const base = `toimg_${Date.now()}`
    inputPath = join(tmpdir(), `${base}.webp`)

    await fs.writeFile(inputPath, media)

    /*
      Se animato -> GIF
    */
    if (isAnimatedWebp(media)) {

      outputPath = join(tmpdir(), `${base}.gif`)

      await webpToGif(inputPath, outputPath)

      const gifBuffer = await fs.readFile(outputPath)

      await conn.sendMessage(m.chat, {
        video: gifBuffer,
        gifPlayback: true,
        caption:
`*╭━━━━━━━🎞️━━━━━━━╮*
*✦ 𝐒𝐓𝐈𝐂𝐊𝐄𝐑 𝐈𝐍 𝐆𝐈𝐅 ✦*
*╰━━━━━━━🎞️━━━━━━━╯*`
      }, { quoted: m })

    } else {

      /*
        Se statico -> PNG
      */
      outputPath = join(tmpdir(), `${base}.png`)

      await webpToPng(inputPath, outputPath)

      const pngBuffer = await fs.readFile(outputPath)

      await conn.sendMessage(m.chat, {
        image: pngBuffer,
        caption:
`*╭━━━━━━━🖼️━━━━━━━╮*
*✦ 𝐒𝐓𝐈𝐂𝐊𝐄𝐑 𝐈𝐍 𝐈𝐌𝐌𝐀𝐆𝐈𝐍𝐄 ✦*
*╰━━━━━━━🖼️━━━━━━━╯*`
      }, { quoted: m })
    }

  } catch (e) {
    console.error('Errore toimg:', e)

    await conn.sendMessage(m.chat, {
      text: '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐜𝐨𝐧𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞.*'
    }, { quoted: m })

  } finally {

    // elimina i file temporanei
    try {
      if (inputPath) await fs.unlink(inputPath)
      if (outputPath) await fs.unlink(outputPath)
    } catch {}
  }
}

handler.help = ['toimg', 'img']
handler.tags = ['sticker']
handler.command = /^(toimg|img)$/i

export default handler