let handler = async (m, { conn, command, usedPrefix }) => {
  let chat = global.db.data.chats[m.chat]

  if (!chat) {
    return m.reply("📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀*\n\n𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞")
  }

  const isAll = /topall/i.test(command)
  let limite = 3

  if (command === "top5" || command === "topall5") limite = 5
  if (command === "top10" || command === "topall10") limite = 10

  let classifica = []
  let totaleMessaggi = 0

  if (isAll) {
    let utenti = chat.users || {}

    classifica = Object.entries(utenti)
      .map(([id, data]) => [id, { conteggio: data.messages || 0 }])
      .filter(u => u[1].conteggio > 0)
      .sort((a, b) => b[1].conteggio - a[1].conteggio)
      .slice(0, limite)

    totaleMessaggi = Object.values(utenti).reduce((acc, u) => acc + (u.messages || 0), 0)

    if (classifica.length === 0) {
      return m.reply("📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐓𝐎𝐓𝐀𝐋𝐄*\n\n𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐫𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐨 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨")
    }
  } else {
    if (!chat.archivioMessaggi || chat.archivioMessaggi.totali === 0) {
      return m.reply("📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀*\n\n𝐍𝐞𝐬𝐬𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐫𝐞𝐠𝐢𝐬𝐭𝐫𝐚𝐭𝐨 𝐨𝐠𝐠𝐢 𝐢𝐧 𝐪𝐮𝐞𝐬𝐭𝐨 𝐠𝐫𝐮𝐩𝐩𝐨")
    }

    let dati = chat.archivioMessaggi
    totaleMessaggi = dati.totali

    classifica = Object.entries(dati.utenti)
      .sort((a, b) => b[1].conteggio - a[1].conteggio)
      .slice(0, limite)
  }

  const medaglie = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅']
  const titolo = isAll ? `𝐓𝐎𝐏 ${limite} 𝐓𝐎𝐓𝐀𝐋𝐄` : `𝐓𝐎𝐏 ${limite} 𝐃𝐈 𝐎𝐆𝐆𝐈`

  let testo = `╭━〔 📊 *𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀* 📊 〕━⬣\n`
  testo += `┃ 💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢: ${totaleMessaggi}\n`
  testo += `╰━━━━━━━━━━━━━━━━━⬣\n\n`
  testo += `🏆 *${titolo}*\n\n`

  let menzioni = classifica.map(u => u[0])

  classifica.forEach((u, i) => {
    let id = u[0]
    let conteggio = u[1].conteggio
    testo += `${medaglie[i]} @${id.split("@")[0]}\n`
    testo += `   ${conteggio} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢\n\n`
  })

  testo += `──────────────────\n`
  testo += isAll
    ? ` 𝐐𝐮𝐞𝐬𝐭𝐚 è 𝐥𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐬𝐭𝐨𝐫𝐢𝐜𝐚 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨`
    : `⏳ 𝐈𝐥 𝐜𝐨𝐧𝐭𝐞𝐠𝐠𝐢𝐨 𝐬𝐢 𝐚𝐳𝐳𝐞𝐫𝐚 𝐚𝐥 𝐜𝐚𝐦𝐛𝐢𝐨 𝐠𝐢𝐨𝐫𝐧𝐨`

  const buttons = isAll
    ? [
        { buttonId: `${usedPrefix}topall5`, buttonText: { displayText: '🏆 TopAll 5' }, type: 1 },
        { buttonId: `${usedPrefix}topall10`, buttonText: { displayText: '🏆 TopAll 10' }, type: 1 }
      ]
    : [
        { buttonId: `${usedPrefix}top5`, buttonText: { displayText: '🏆 Top 5' }, type: 1 },
        { buttonId: `${usedPrefix}top10`, buttonText: { displayText: '🏆 Top 10' }, type: 1 }
      ]

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: menzioni,
    footer: isAll
      ? 'Seleziona un bottone per cambiare la classifica totale'
      : 'Seleziona un bottone per cambiare la classifica giornaliera',
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.before = async function (m) {
  if (!m.chat || !m.text || m.isBaileys || !m.isGroup) return

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  let oggi = new Date().toDateString()

  if (!chat.archivioMessaggi) {
    chat.archivioMessaggi = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  if (!chat.archivioMessaggi.ultimoReset) {
    chat.archivioMessaggi.ultimoReset = oggi
  }

  if (chat.archivioMessaggi.ultimoReset !== oggi) {
    chat.archivioMessaggi = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  let archivio = chat.archivioMessaggi
  archivio.totali += 1

  if (!archivio.utenti[m.sender]) archivio.utenti[m.sender] = { conteggio: 0 }
  archivio.utenti[m.sender].conteggio += 1
}

if (!global.topResetInterval) {
  global.topResetInterval = setInterval(async () => {
    try {
      let chats = global.db.data.chats
      if (!chats) return

      let oggi = new Date().toDateString()

      for (let jid in chats) {
        let chat = chats[jid]
        if (!chat.archivioMessaggi) continue

        let dati = chat.archivioMessaggi

        if (!dati.ultimoReset) {
          dati.ultimoReset = oggi
          continue
        }

        if (dati.ultimoReset === oggi) continue

        if (dati.totali > 0) {
          let classifica = Object.entries(dati.utenti)
            .sort((a, b) => b[1].conteggio - a[1].conteggio)
            .slice(0, 3)

          let testo = `╭━〔 🏆 *𝐅𝐈𝐍𝐀𝐋𝐄* 🏆 〕━⬣\n`
          testo += `┃ 📊 𝐓𝐨𝐭𝐚𝐥𝐞 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢: ${dati.totali}\n`
          testo += `╰━━━━━━━━━━━━━━━━━⬣\n\n`

          let menzioni = classifica.map(u => u[0])
          const medaglie = ['🥇', '🥈', '🥉']

          classifica.forEach((u, i) => {
            testo += `${medaglie[i]} @${u[0].split("@")[0]} — ${u[1].conteggio} 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢\n`
          })

          testo += `\n🔄 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐭𝐚`

          if (global.conn) {
            await global.conn.sendMessage(jid, {
              text: testo,
              mentions: menzioni
            })
          }
        }

        chat.archivioMessaggi = {
          totali: 0,
          utenti: {},
          ultimoReset: oggi
        }
      }
    } catch (e) {
      console.error(e)
    }
  }, 60000)
}

handler.help = ['top', 'top5', 'top10', 'topall', 'topall5', 'topall10']
handler.tags = ['strumenti']
handler.command = /^(top|top5|top10|topall|topall5|topall10)$/i
handler.group = true

export default handler