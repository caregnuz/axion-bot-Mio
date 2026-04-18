// Plugin Top Classifica by Bonzino

let handler = async (m, { conn, command, usedPrefix, isAdmin, isOwner }) => {
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  let oggi = new Date().toDateString()

  if (!chat.classificaGiornaliera || chat.classificaGiornaliera.ultimoReset !== oggi) {
    chat.classificaGiornaliera = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  if (!chat.classificaTotale) {
    chat.classificaTotale = {
      totali: 0,
      utenti: {}
    }
  }

  if (command === 'resettp') {
    if (!isAdmin && !isOwner && !m.fromMe) {
      return m.reply(`*╭━━━━━━━🔒━━━━━━━╮*
*✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ✦*
*╰━━━━━━━🔒━━━━━━━╯*

*❌ 𝐒𝐨𝐥𝐨 𝐚𝐝𝐦𝐢𝐧 𝐨 𝐨𝐰𝐧𝐞𝐫 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐫𝐞 𝐥𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚*`)
    }

    chat.classificaGiornaliera = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }

    return m.reply(`*╭━━━━━━━🔄━━━━━━━╮*
*✦ 𝐑𝐄𝐒𝐄𝐓 ✦*
*╰━━━━━━━🔄━━━━━━━╯*

*✅ 𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐚 𝐫𝐞𝐬𝐞𝐭𝐭𝐚𝐭𝐚*`)
  }

  const isAll = /^topall/i.test(command)

  let limite = 3
  if (command.includes('5')) limite = 5
  if (command.includes('10')) limite = 10

  let archivio = isAll ? chat.classificaTotale : chat.classificaGiornaliera
  let totaleMessaggi = archivio.totali || 0

  let classifica = Object.entries(archivio.utenti || {})
    .filter(([_, data]) => (data.conteggio || 0) > 0)
    .sort((a, b) => (b[1].conteggio || 0) - (a[1].conteggio || 0))
    .slice(0, limite)

  if (!classifica.length) {
    return m.reply(`*╭━━━━━━━📊━━━━━━━╮*
*✦ 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 ✦*
*╰━━━━━━━📊━━━━━━━╯*

*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐝𝐚𝐭𝐨 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞*`)
  }

  const medaglie = ['🥇', '🥈', '🥉', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅', '🏅']
  const titolo = isAll
    ? '*🌐 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐆𝐋𝐎𝐁𝐀𝐋𝐄*'
    : '*⏳ 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 𝐃𝐈 𝐎𝐆𝐆𝐈*'

  let testo = `*╭━━━━━━━📊━━━━━━━╮*
*✦ 𝐂𝐋𝐀𝐒𝐒𝐈𝐅𝐈𝐂𝐀 ✦*
*╰━━━━━━━📊━━━━━━━╯*

${titolo}

*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢:* *${totaleMessaggi}*
*📌 𝐏𝐨𝐬𝐢𝐳𝐢𝐨𝐧𝐢 𝐦𝐨𝐬𝐭𝐫𝐚𝐭𝐞:* *${classifica.length}*

*──────────────*`

  let menzioni = classifica.map(([jid]) => jid).filter(Boolean)

  classifica.forEach(([jid, data], i) => {
    let posizione = i + 1
    let medaglia = medaglie[i] || '🏅'

    testo += `

*${medaglia} ${posizione}° 𝐏𝐎𝐒𝐈𝐙𝐈𝐎𝐍𝐄*
*👤 @${jid.split('@')[0]}*
*✉️ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢:* *${data.conteggio || 0}*`
  })

  testo += `

*──────────────*
${isAll
    ? `*⏳ 𝐏𝐞𝐫 𝐥𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐝𝐢 𝐨𝐠𝐠𝐢: ${usedPrefix}top*`
    : `*🌐 𝐏𝐞𝐫 𝐥𝐚 𝐜𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐬𝐭𝐨𝐫𝐢𝐜𝐚: ${usedPrefix}topall*`}`

  let buttons = []

  if (isAll) {
    if (limite === 3) {
      buttons.push(
        { buttonId: `${usedPrefix}topall5`, buttonText: { displayText: '🌐 TopAll 5' }, type: 1 },
        { buttonId: `${usedPrefix}top`, buttonText: { displayText: '⏳ Top Oggi' }, type: 1 }
      )
    } else if (limite === 5) {
      buttons.push(
        { buttonId: `${usedPrefix}topall10`, buttonText: { displayText: '🌐 TopAll 10' }, type: 1 },
        { buttonId: `${usedPrefix}topall`, buttonText: { displayText: '🔙 TopAll 3' }, type: 1 }
      )
    } else {
      buttons.push(
        { buttonId: `${usedPrefix}topall`, buttonText: { displayText: '🔙 TopAll 3' }, type: 1 },
        { buttonId: `${usedPrefix}top`, buttonText: { displayText: '⏳ Top Oggi' }, type: 1 }
      )
    }
  } else {
    if (limite === 3) {
      buttons.push(
        { buttonId: `${usedPrefix}top5`, buttonText: { displayText: '🏆 Top 5' }, type: 1 },
        { buttonId: `${usedPrefix}topall`, buttonText: { displayText: '🌐 TopAll' }, type: 1 }
      )
    } else if (limite === 5) {
      buttons.push(
        { buttonId: `${usedPrefix}top10`, buttonText: { displayText: '🏆 Top 10' }, type: 1 },
        { buttonId: `${usedPrefix}top`, buttonText: { displayText: '🔙 Top 3' }, type: 1 }
      )
    } else {
      buttons.push(
        { buttonId: `${usedPrefix}top`, buttonText: { displayText: '🔙 Top 3' }, type: 1 },
        { buttonId: `${usedPrefix}topall`, buttonText: { displayText: '🌐 TopAll' }, type: 1 }
      )
    }
  }

  await conn.sendMessage(m.chat, {
    text: testo,
    mentions: menzioni,
    footer: isAll
      ? '𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐬𝐭𝐨𝐫𝐢𝐜𝐚 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨'
      : '𝐂𝐥𝐚𝐬𝐬𝐢𝐟𝐢𝐜𝐚 𝐠𝐢𝐨𝐫𝐧𝐚𝐥𝐢𝐞𝐫𝐚 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨',
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.before = async function (m) {
  if (!m.chat || m.isBaileys || !m.isGroup) return

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}

  let chat = global.db.data.chats[m.chat]
  let oggi = new Date().toDateString()

  if (!chat.classificaGiornaliera || chat.classificaGiornaliera.ultimoReset !== oggi) {
    chat.classificaGiornaliera = {
      totali: 0,
      utenti: {},
      ultimoReset: oggi
    }
  }

  if (!chat.classificaTotale) {
    chat.classificaTotale = {
      totali: 0,
      utenti: {}
    }
  }

  let giornaliera = chat.classificaGiornaliera
  let totale = chat.classificaTotale

  giornaliera.totali++
  totale.totali++

  if (!giornaliera.utenti[m.sender]) {
    giornaliera.utenti[m.sender] = { conteggio: 0 }
  }

  if (!totale.utenti[m.sender]) {
    totale.utenti[m.sender] = { conteggio: 0 }
  }

  giornaliera.utenti[m.sender].conteggio++
  totale.utenti[m.sender].conteggio++
}

handler.command = /^(top|top5|top10|topall|topall5|topall10|resettp)$/i
handler.group = true
handler.tags = ['group']
handler.help = ['top', 'top5', 'top10', 'topall', 'topall5', 'topall10', 'resettp']

export default handler