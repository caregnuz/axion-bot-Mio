process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import axios from 'axios'

const sessions = new Map()

let handler = async (m, { conn, usedPrefix, command }) => {
  const chatId = m.chat

  if (sessions.has(chatId)) {
    if (m.text.toLowerCase() === 'stop') {
      sessions.delete(chatId)
      return m.reply('❌ Partita terminata.')
    }

    try {
      const response = await axios.get(`https://api.lolhuman.xyz/api/openai?apikey=GataDios&text=${encodeURIComponent('Comportati come Akinator in italiano. L\'utente dice: ' + m.text + '. Se hai capito chi è scrivi "INDOVINATO: [nome]", altrimenti fai la domanda successiva.')}`)
      
      const replyText = response.data.result

      if (replyText.includes("INDOVINATO:")) {
          const nome = replyText.split("INDOVINATO:")[1]
          await conn.sendMessage(chatId, { text: `✨ *TROVATO!*\n\nPersonaggio: *${nome.trim()}*` }, { quoted: m })
          sessions.delete(chatId)
      } else {
          await conn.sendMessage(chatId, { text: replyText }, { quoted: m })
      }
    } catch (e) {
      sessions.delete(chatId)
      m.reply("❌ Errore nel server di gioco.")
    }
    return
  }

  try {
    const startRes = await axios.get(`https://api.lolhuman.xyz/api/openai?apikey=GataDios&text=${encodeURIComponent('Inizia una partita a Akinator in italiano. Fai la prima domanda per indovinare un personaggio.')}`)
    
    sessions.set(chatId, { active: true })
    await conn.sendMessage(chatId, { text: `🎮 *AKINATOR AI*\n\n${startRes.data.result}` }, { quoted: m })
  } catch (err) {
    m.reply("❌ API non raggiungibile. Riprova tra poco.")
  }
}

handler.help = ['akinator']
handler.tags = ['fun']
handler.command = /^(akinator|aki)$/i

export default handler
