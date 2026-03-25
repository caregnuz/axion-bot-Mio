let handler = async (m, { conn, command, usedPrefix }) => {
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  if (!chat) return m.reply("📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀*\n\n𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞")

  if (command === 'resettp') {
    let oggi = new Date().toDateString()
    chat.archivioMessaggi = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
    return m.reply("🔄 *𝐋𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐭𝐚*")
  }

  const isAll = /topall/i.test(command)
  let limite = 3
  if (command.includes('5')) limite = 5
  if (command.includes('10')) limite = 10

  let classifica = []
  let totaleMessaggi = 0

  if (isAll) {
    let utenti = chat.users || {}

    classifica = Object.entries(utenti)
      .map(([id, data]) => [id, { conteggio: data.messages || 0 }])
      .filter(u => u[1].conteggio > 0)
      .sort((a, b) => b[1].conteggio - a[1].conteggio)
      .slice(0, limite)

    totaleMessaggi = Object.values(utenti)
      .reduce((acc, u) => acc + (u.messages || 0), 0)

    if (!classifica.length) {
      return m.reply("📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐓𝐎𝐓𝐀𝐋𝐄*\n\n𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨")
    }
  } else {
    if (!chat.archivioMessaggi || chat.archivioMessaggi.totali === 0) {
      return m.reply("📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀*\n\n𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐨𝐠𝐠𝐢")
    }

    let dati = chat.archivioMessaggi
    totaleMessaggi = dati.totali

    classifica = Object.entries(dati.utenti || {})
      .sort((a, b) => b[1].conteggio - a[1].conteggio)
      .slice(0, limite)
  }

  while (classifica.length < limite) {
    classifica.push([null, { conteggio: 0 }])
  }

  const medaglie = ['🥇','🥈','🥉','🏅','🏅','🏅','🏅','🏅','🏅','🏅']
  const titolo = isAll ? `𝐓𝐎𝐏 ${limite} 𝐓𝐎𝐓𝐀𝐋𝐄` : `𝐓𝐎𝐏 ${limite} 𝐃𝐈 𝐎𝐆𝐆𝐈`

  let testo = `╭━〔 📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀* 📊 〕━⬣\n`
  testo += `┃ 💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢: ${totaleMessaggi}\n`
  testo += `╰━━━━━━━━━━━━━━━━━⬣\n\n`
  testo += `🏆 *${titolo}*\n\n`

  let menzioni = classifica.map(u => u[0]).filter(Boolean)

  classifica.forEach((u, i) => {
    if (!u[0]) {
      testo += `${medaglie[i]} —\n`
      testo += `   0 messaggi\n\n`
      return
    }

    testo += `${medaglie[i]} @${u[0].split('@')[0]}\n`
    testo += `   ${u[1].conteggio} messaggi\n\n`
  })

  testo += `──────────────\n`
  testo += isAll ? `Storico` : `Reset giornaliero`

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: menzioni
  }, { quoted: m })
}

handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  let oggi = new Date().toDateString()

  if (!chat.archivioMessaggi || chat.archivioMessaggi.ultimoReset !== oggi) {
    chat.archivioMessaggi = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  let archivio = chat.archivioMessaggi
  archivio.totali++

  if (!archivio.utenti[m.sender]) {
    archivio.utenti[m.sender] = { conteggio: 0 }
  }

  archivio.utenti[m.sender].conteggio++
}

handler.command = /^(top|top5|top10|topall|topall5|topall10|resettp)$/i
handler.group = true
handler.tags = ['group']
handler.help = ['top', 'top5', 'top10', 'topall', 'resettp']

export default handler