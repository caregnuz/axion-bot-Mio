import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function normalizeName(str = '') {
  return str
    .toLowerCase()
    .replace(/\.js$/i, '')
    .replace(/[\s_-]+/g, '')
    .trim()
}

function scoreMatch(query, fileName) {
  const q = normalizeName(query)
  const f = normalizeName(fileName)

  if (!q || !f) return 0
  if (q === f) return 100
  if (f.startsWith(q)) return 90
  if (f.includes(q)) return 75

  let qi = 0
  for (let i = 0; i < f.length && qi < q.length; i++) {
    if (f[i] === q[qi]) qi++
  }
  if (qi === q.length) return 50

  return 0
}

let handler = async (m, { conn, text, isOwner }) => {
  const SIGN = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
  const pluginsDir = path.join(__dirname, '../plugins')

  if (!text) {
    return conn.reply(m.chat, `
⚙️ *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - FILE RETRIEVER*
Uso corretto:
*.getpl <nome-plugin>*

Esempi:
*.getpl info-ping.js*
*.getpl ping*
*.getpl infoping*

${SIGN}`.trim(), m)
  }

  if (!isOwner) {
    return conn.reply(m.chat, `🔒 *Accesso Negato*\nSolo il proprietario può eseguire questa funzione.\n\n${SIGN}`, m)
  }

  if (!fs.existsSync(pluginsDir)) {
    return conn.reply(m.chat, `❌ *Errore:* Cartella plugins non trovata.\n\n${SIGN}`, m)
  }

  const files = fs.readdirSync(pluginsDir)
    .filter(file => file.endsWith('.js'))

  if (!files.length) {
    return conn.reply(m.chat, `❌ *Errore:* Nessun plugin trovato nella cartella.\n\n${SIGN}`, m)
  }

  const query = text.trim()
  const normalizedQuery = normalizeName(query)

  let exact = files.find(file => normalizeName(file) === normalizedQuery)

  let bestFile = exact
  let matches = []

  if (!bestFile) {
    matches = files
      .map(file => ({ file, score: scoreMatch(query, file) }))
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score || a.file.localeCompare(b.file))

    if (matches.length === 1) {
      bestFile = matches[0].file
    } else if (matches.length > 1 && matches[0].score > matches[1].score) {
      bestFile = matches[0].file
    }
  }

  if (!bestFile) {
    return conn.reply(
      m.chat,
      `❌ *Errore:* Nessun plugin compatibile con *${query}*.\n\n${SIGN}`,
      m
    )
  }

  if (!exact && matches.length > 1) {
    const top = matches.slice(0, 8).map((x, i) => `${i + 1}. ${x.file}`).join('\n')

    if (matches[0].score === matches[1].score) {
      return conn.reply(
        m.chat,
        `⚠️ *Più plugin trovati per:* *${query}*\n\n${top}\n\nScrivi un nome più preciso.\n\n${SIGN}`,
        m
      )
    }
  }

  const pluginPath = path.join(pluginsDir, bestFile)

  if (!fs.existsSync(pluginPath)) {
    return conn.reply(m.chat, `❌ *Errore:* Plugin *${bestFile}* non trovato.\n\n${SIGN}`, m)
  }

  const code = fs.readFileSync(pluginPath, 'utf-8')

  if (code.length > 60000) {
    return conn.reply(m.chat, `⚠️ *Errore:* Il file *${bestFile}* è troppo grande per WhatsApp.\n\n${SIGN}`, m)
  }

  const msg = `
🚀 *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - PLUGIN LOADED*

📂 *FILE:* ${bestFile}
📊 *SIZE:* ${(code.length / 1024).toFixed(2)} KB
👤 *AUTHOR:* ${SIGN}

\`\`\`javascript
${code}
\`\`\`

${SIGN}`.trim()

  await conn.sendMessage(m.chat, { text: msg }, { quoted: m })
}

handler.help = ['getpl']
handler.tags = ['tools']
handler.command = /^getpl$/i
handler.owner = true

export default handler