// file: commands/prendijid.js
export async function handler(m, { conn, text, args }) {
  // Se non ci sono argomenti, prova a usare text
  const input = text || args.join(' ')
  if (!input) return m.reply('❌ Inserisci un link del canale\nEsempio:\n.prendijid https://whatsapp.com/channel/xxxx')

  // Regex per link canale WhatsApp
  const match = input.match(/whatsapp\.com\/channel\/([0-9A-Za-z]+)/i)
  if (!match) return m.reply('❌ Link non valido! Assicurati sia un link canale WhatsApp.')

  const id = match[1]
  const jid = id + '@newsletter'

  const replyText = `📢 *CHANNEL JID TROVATO*\n\n` +
                    `🔗 Link: ${input}\n` +
                    `🆔 ID: ${id}\n` +
                    `📌 JID: ${jid}`

  m.reply(replyText)
}

// Config handler
handler.command = /^(prendijid)$/i
handler.tags = ['tools']
handler.help = ['prendijid <link>']