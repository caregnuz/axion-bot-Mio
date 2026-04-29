// test-vocale.js

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

let handler = async (m, { conn }) => {
  const inputPath = path.join(process.cwd(), 'media/foxa.aac')
  const tmpDir = path.join(process.cwd(), 'temp')

  if (!fs.existsSync(inputPath)) {
    return conn.reply(
      m.chat,
      '*❌ File non trovato:* /media/foxa.aac',
      m
    )
  }

  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true })
  }

  const stamp = Date.now()
  const voicePath = path.join(tmpDir, `foxa_${stamp}.ogg`)

  try {
    await conn.sendMessage(m.chat, {
      react: {
        text: '🎤',
        key: m.key
      }
    })

    execSync(
      `ffmpeg -y -i "${inputPath}" -vn -ar 48000 -ac 1 -c:a libopus -b:a 32k -application voip -f ogg "${voicePath}"`
    )

    await conn.sendMessage(m.chat, {
      audio: fs.readFileSync(voicePath),
      mimetype: 'audio/ogg; codecs=opus',
      ptt: true
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: {
        text: '✅',
        key: m.key
      }
    })

  } catch (e) {
    console.error(e)

    await conn.reply(
      m.chat,
      `*❌ Errore test vocale:*\n\`\`\`${e.message}\`\`\``,
      m
    )
  } finally {
    try {
      if (fs.existsSync(voicePath)) fs.unlinkSync(voicePath)
    } catch {}
  }
}

handler.help = ['testvocale']
handler.tags = ['test']
handler.command = ['testvocale']
handler.owner = true

export default handler