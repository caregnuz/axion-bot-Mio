//by Bonzino

import fs from 'fs'
import path from 'path'

function getEnvValue(name) {
  try {
    const envPath = path.resolve('.env')
    const env = fs.readFileSync(envPath, 'utf8')

    const line = env
      .split('\n')
      .find(v => v.trim().startsWith(name + '='))

    if (!line) return null

    return line
      .slice(name.length + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
  } catch {
    return null
  }
}

let handler = async (m) => {
  try {
    const key = getEnvValue('FIVESIM_KEY')

    if (!key) {
      return m.reply(
        '*❌ ENV NON LETTO*\n\n' +
        'FIVESIM_KEY non trovata.\n\n' +
        'Controlla:\n' +
        '- file .env\n' +
        '- nome variabile\n' +
        '- posizione file'
      )
    }

    const masked =
      key.length > 20
        ? `${key.slice(0, 10)}...${key.slice(-10)}`
        : key

    let txt = `*✅ ENV LETTO CORRETTAMENTE*\n\n`
    txt += `🔑 *Key:*\n\`${masked}\`\n\n`
    txt += `📏 Lunghezza: \`${key.length}\`\n`
    txt += `📂 Path: \`${path.resolve('.env')}\``

    return m.reply(txt)

  } catch (e) {
    return m.reply('*❌ ERRORE DEBUG ENV*')
  }
}

handler.command = ['debugenv']
export default handler