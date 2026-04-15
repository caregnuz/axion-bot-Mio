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
      const response = await axios.post(`https://api.paxsenix.biz.id/ai/gemini`, {
        text: `Rispondi come Akinator. L'utente ha risposto: "${m.text}". Se hai capito chi è, scrivi "HO INDOVINATO: [Nome Personaggio]". Altrimenti fai la prossima domanda per indovinare il personaggio a cui l'utente sta pensando.`
      })

      const replyText = response.data.message

      if (replyText.includes("HO INDOVINATO:")) {
          const nome = replyText.split("HO INDOVINATO:")[1]
          await conn.sendMessage(chatId, { 
            text: `✨ *VITTORIA!* ✨\n\nPenso che tu stia pensando a: *${nome.trim()}*\n\nHo indovinato? 😎` 
          }, { quoted: m })
          sessions.delete(chatId)
      } else {
          await conn.sendMessage(chatId, { text: replyText }, { quoted: m })
      }

    } catch (e) {
      m.reply("❌ Errore di comunicazione con il cervello dell'IA.")
      sessions.delete(chatId)
    }
    return
  }

  try {
    sessions.set(chatId, { step: 1 })
    
    const startRes = await axios.post(`https://api.paxsenix.biz.id/ai/gemini`, {
      text: `Inizia una partita di Akinator in italiano. Saluta e fai la prima domanda per indovinare un personaggio che ho in mente.`
    })

    await conn.sendMessage(chatId, { 
      text: `🎮 *AKINATOR AI*\n\n${startRes.data.message}\n\n_Scrivi *stop* per chiudere._` 
    }, { quoted: m })

  } catch (err) {
    m.reply("❌ Impossibile avviare il gioco al momento.")
  }
}

handler.help = ['akinator']
handler.tags = ['fun']
handler.command = /^(akinator|aki)$/i

export default handler
