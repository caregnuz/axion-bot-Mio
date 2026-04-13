//by Bonzino

import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  try {
    const pluginsDir = './plugins'

    if (!fs.existsSync(pluginsDir)) {
      throw new Error('Cartella plugins non trovata.')
    }

    const files = fs.readdirSync(pluginsDir).filter(f => f.endsWith('.js'))
    const risultati = []

    for (const file of files) {
      const fullPath = path.join(pluginsDir, file)
      const content = fs.readFileSync(fullPath, 'utf8')

      if (content.includes('global.errore')) {
        risultati.push(file)
      }
    }

    if (!risultati.length) {
      return m.reply('*✅ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐩𝐥𝐮𝐠𝐢𝐧 𝐜𝐨𝐧 𝐠𝐥𝐨𝐛𝐚𝐥.𝐞𝐫𝐫𝐨𝐫𝐞 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.*')
    }

    const testo = `*⚠️ 𝐏𝐥𝐮𝐠𝐢𝐧 𝐜𝐡𝐞 𝐮𝐬𝐚𝐧𝐨 𝐠𝐥𝐨𝐛𝐚𝐥.𝐞𝐫𝐫𝐨𝐫𝐞:*\n\n${risultati.map(v => `• ${v}`).join('\n')}`

    await conn.reply(m.chat, testo, m)
  } catch (e) {
    console.error(e)
    throw e
  }
}

handler.command = ['scanerrori', 'pluginerrori']
handler.tags = ['owner']
handler.help = ['scanerrori']
handler.rowner = true

export default handler