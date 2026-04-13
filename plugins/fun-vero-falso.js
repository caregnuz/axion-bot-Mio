//by Bonzino

import axios from 'axios'

const videos = {
  vero: 'https://files.catbox.moe/6zx6x3.mp4',
  falso: 'https://files.catbox.moe/3dnfl0.mp4'
}

let handler = async (m, { conn, text }) => {
  try {
    const isTrue = Math.random() < 0.5
    const randomVideo = isTrue ? videos.vero : videos.falso
    const resultText = isTrue ? '*✅ 𝐕𝐄𝐑𝐎*' : '*❌ 𝐅𝐀𝐋𝐒𝐎*'

    const res = await axios.get(randomVideo, {
      responseType: 'stream',
      timeout: 20000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'video/mp4,*/*;q=0.8',
        'Referer': 'https://google.com/'
      }
    })

    const caption = text?.trim()
      ? `*🧠 𝐕𝐞𝐫𝐨 𝐨 𝐟𝐚𝐥𝐬𝐨?*\n\n*${text.trim()}*\n\n${resultText}`
      : resultText

    await conn.sendMessage(
      m.chat,
      {
        video: res.data,
        mimetype: 'video/mp4',
        ptv: true,
        ...(caption ? { caption } : {})
      },
      { quoted: m }
    )

  } catch (e) {
    console.error('vof error:', e)
    throw new Error(`❌ 𝐄𝐫𝐫𝐨𝐫𝐞\n\n${e.message || e}`)
  }
}

handler.command = /^(vof|veroofalso|verofalso|veroefalso)$/i
handler.tags = ['giochi']
handler.help = ['vof', 'vof <testo>']
handler.register = true

export default handler