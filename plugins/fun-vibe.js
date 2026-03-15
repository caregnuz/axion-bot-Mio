const userMessages = {}

const handler = async (m, { conn, text }) => {

  let target =
    m.mentionedJid?.[0] ||
    m.quoted?.sender ||
    m.sender

  let msgs = userMessages[target] || []

  if (msgs.length === 0) {
    return m.reply("Non ho abbastanza messaggi da analizzare per questo utente.")
  }

  // Analisi AI dei messaggi
  let stats = {
    positivo: 0,
    neutro: 0,
    polemico: 0,
    scherzoso: 0,
    aggressivo: 0
  }

  let karma = 0

  msgs.forEach(msg => {
    const tone = aiToneAnalysis(msg)
    switch (tone) {
      case 'positivo': stats.positivo++; karma += 2; break
      case 'neutro': stats.neutro++; karma += 0; break
      case 'polemico': stats.polemico++; karma -= 2; break
      case 'aggressivo': stats.aggressivo++; karma -= 3; break
      case 'scherzoso': stats.scherzoso++; karma += 1; break
    }
  })

  karma = Math.max(-10, Math.min(10, karma))

  let vibe = "😐 Neutrale"
  if (karma >= 5) vibe = "✨ Positiva"
  if (karma <= -5) vibe = "⚠️ Polemica"

  let tag = `@${target.split("@")[0]}`

  await conn.sendMessage(m.chat,{
    text:`╭───〔 🤖 ANALISI VIBE AI 〕───╮

👤 Utente: ${tag}

🧠 Vibe rilevata:
${vibe}

⭐ Karma: ${karma}/10

📊 Statistiche messaggi
• Positivi: ${stats.positivo}
• Neutri: ${stats.neutro}
• Polemici: ${stats.polemico}
• Aggressivi: ${stats.aggressivo}
• Scherzosi: ${stats.scherzoso}

💡 Suggerimento:
${karma <= -5 ? "L'utente potrebbe causare tensione, fai attenzione." : "Conversazione normale."}

╰────────────────╯`,
    mentions:[target]
  })

}

// Funzione AI semplificata (puoi sostituire con GPT o modello sentiment reale)
function aiToneAnalysis(text) {
  text = text.toLowerCase()
  const positive = ["grazie","ok","perfetto","lol","bella","bravo","grande"]
  const negative = ["stupido","idiota","zitto","ma stai","boh","bah","ridicolo"]
  const aggressive = ["cazzo","merda","fanculo","porco", "dio", "coglione", "madonna", "stronzo","idiota"]
  const joke = ["😂","🤣","ahah","lol","xd"]

  if (aggressive.some(w => text.includes(w))) return "aggressivo"
  if (negative.some(w => text.includes(w))) return "polemico"
  if (positive.some(w => text.includes(w))) return "positivo"
  if (joke.some(w => text.includes(w))) return "scherzoso"
  return "neutro"
}

// Tracker messaggi
export function before(m) {
  if (!m.text) return
  if (!userMessages[m.sender]) userMessages[m.sender] = []
  userMessages[m.sender].push(m.text)
  if (userMessages[m.sender].length > 50) userMessages[m.sender].shift()
}

handler.help = ['vibe']
handler.tags = ['fun']
handler.command = /^vibe$/i

export default handler