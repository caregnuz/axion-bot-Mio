let handler = async (m, { conn }) => {

  const msg = m.quoted ? m.quoted : m
  const ctx = msg?.message?.extendedTextMessage?.contextInfo || msg?.msg?.contextInfo || {}

  const info = ctx.forwardedNewsletterMessageInfo

  if (!info) {
    return conn.reply(m.chat, '❌ Nessun dato canale trovato.\n\n👉 Rispondi a un messaggio inoltrato dal canale.', m)
  }

  const jid = info.newsletterJid
  const name = info.newsletterName

  const text = `*DATI CANALE*

 *Nome:* ${name}
🆔 *JID:* 
\`\`\`
${jid}
\`\`\`


  await conn.sendMessage(m.chat, {
    text
  }, { quoted: m })

}

handler.help = ['getjid']
handler.tags = ['test']
handler.command = /^(getjid)$/i

export default handler