// welcome/addio by Bonzino

import { WAMessageStubType } from '@realvare/baileys'

let handler = m => m

const codaBenvenuti = {}

const LIMITE_BENVENUTI_SINGOLI = 7
const RITARDO_BENVENUTO = 3500
const TEMPO_RAGGRUPPAMENTO = 5000
const MENZIONI_MASSIME = 1000

function ottieniCoda(chat) {

  codaBenvenuti[chat] ||= {
    utenti: new Set(),
    timer: null,
    gruppo: 'Gruppo'
  }

  return codaBenvenuti[chat]
}

function creaTestoSingolo(user, gruppo) {

  return `*╭━━━━━━━👋━━━━━━━╮*
*✦ 𝐁𝐄𝐍𝐕𝐄𝐍𝐔𝐓𝐎/𝐀 ✦*
*╰━━━━━━━👋━━━━━━━╯*

*@${user} 𝐛𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨/𝐚 𝐢𝐧 ${gruppo}!*

*𝐏𝐞𝐫 𝐢𝐧𝐢𝐳𝐢𝐚𝐫𝐞, 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐚𝐭𝐢 𝐜𝐨𝐧:*
*➜ 𝐍𝐨𝐦𝐞*
*➜ 𝐏𝐫𝐨𝐯𝐞𝐧𝐢𝐞𝐧𝐳𝐚*
*➜ 𝐄𝐭𝐚̀*
*➜ 𝐅𝐨𝐭𝐨 𝐚 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞 𝐮𝐧𝐢𝐜𝐚*

*📜 𝐓𝐢 𝐢𝐧𝐯𝐢𝐭𝐢𝐚𝐦𝐨 𝐚 𝐥𝐞𝐠𝐠𝐞𝐫𝐞 𝐥𝐞 𝐫𝐞𝐠𝐨𝐥𝐞 𝐜𝐨𝐧 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨:* *.regole*

*𝐁𝐮𝐨𝐧𝐚 𝐩𝐞𝐫𝐦𝐚𝐧𝐞𝐧𝐳𝐚!* ✨

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
}

function creaTestoMultiplo(totale, gruppo) {

  return `*╭━━━━━━━👋━━━━━━━╮*
*✦ 𝐁𝐄𝐍𝐕𝐄𝐍𝐔𝐓𝐈 ✦*
*╰━━━━━━━👋━━━━━━━╯*

*${totale} 𝐧𝐮𝐨𝐯𝐢 𝐮𝐭𝐞𝐧𝐭𝐢 𝐬𝐨𝐧𝐨 𝐞𝐧𝐭𝐫𝐚𝐭𝐢 𝐢𝐧 ${gruppo}.*

*𝐏𝐞𝐫 𝐢𝐧𝐢𝐳𝐢𝐚𝐫𝐞, 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐚𝐭𝐞𝐯𝐢 𝐜𝐨𝐧:*
*➜ 𝐍𝐨𝐦𝐞*
*➜ 𝐏𝐫𝐨𝐯𝐞𝐧𝐢𝐞𝐧𝐳𝐚*
*➜ 𝐄𝐭𝐚̀*
*➜ 𝐅𝐨𝐭𝐨 𝐚 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞 𝐮𝐧𝐢𝐜𝐚*

*📜 𝐕𝐢 𝐢𝐧𝐯𝐢𝐭𝐢𝐚𝐦𝐨 𝐚 𝐥𝐞𝐠𝐠𝐞𝐫𝐞 𝐥𝐞 𝐫𝐞𝐠𝐨𝐥𝐞 𝐜𝐨𝐧 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨:* *.regole*

*𝐁𝐮𝐨𝐧𝐚 𝐩𝐞𝐫𝐦𝐚𝐧𝐞𝐧𝐳𝐚!* ✨

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
}

async function inviaBenvenuti(chatId, conn) {

  const dati = codaBenvenuti[chatId]
  if (!dati) return

  const utenti = [...dati.utenti]
  const gruppo = dati.gruppo || 'Gruppo'

  delete codaBenvenuti[chatId]

  if (!utenti.length) return

  // welcome multiplo
  if (utenti.length > LIMITE_BENVENUTI_SINGOLI) {

    const mentions = utenti.slice(0, MENZIONI_MASSIME)

    const testo = creaTestoMultiplo(
      utenti.length,
      gruppo
    )

    await conn.sendMessage(chatId, {
      text: testo,
      mentions
    })

    return
  }

  // welcome singoli
  for (let i = 0; i < utenti.length; i++) {

    const jid = utenti[i]
    const numero = jid.split('@')[0]

    const testo = creaTestoSingolo(
      numero,
      gruppo
    )

    if (i !== 0) {
      await new Promise(resolve =>
        setTimeout(resolve, RITARDO_BENVENUTO)
      )
    }

    await conn.sendMessage(chatId, {
      text: testo,
      mentions: [jid]
    })
  }
}

handler.before = async function (
  m,
  {
    conn,
    groupMetadata
  }
) {

  if (!m.isGroup || !m.messageStubType)
    return false

  const chat =
    global.db?.data?.chats?.[m.chat]

  if (
    !chat ||
    (!chat.welcome && !chat.goodbye)
  ) return false

  const isAdd =
    m.messageStubType ===
    WAMessageStubType.GROUP_PARTICIPANT_ADD

  const isRemove =
    m.messageStubType ===
      WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
    m.messageStubType ===
      WAMessageStubType.GROUP_PARTICIPANT_LEAVE

  if (!isAdd && !isRemove)
    return false

  const who =
    m.messageStubParameters?.[0]

  if (!who) return false

  const jid = conn.decodeJid(who)

  const cleanUserId =
    jid.split('@')[0]

  const groupName =
    groupMetadata?.subject || 'Gruppo'

  // benvenuto
  if (isAdd && chat.welcome) {

    const coda = ottieniCoda(m.chat)

    coda.utenti.add(jid)
    coda.gruppo = groupName

    if (coda.timer)
      clearTimeout(coda.timer)

    coda.timer = setTimeout(() => {
      inviaBenvenuti(
        m.chat,
        conn
      ).catch(console.error)
    }, TEMPO_RAGGRUPPAMENTO)

    return true
  }

  // addio
  if (isRemove && chat.goodbye) {

    const text =
`*╭━━━━━━━👋━━━━━━━╮*
*✦ 𝐀𝐃𝐃𝐈𝐎 ✦*
*╰━━━━━━━👋━━━━━━━╯*

*@${cleanUserId} 𝐡𝐚 𝐥𝐚𝐬𝐜𝐢𝐚𝐭𝐨 ${groupName}.*

*𝐓𝐚𝐧𝐭𝐨 𝐧𝐨𝐧 𝐟𝐫𝐞𝐠𝐚𝐯𝐚 𝐮𝐧 𝐜𝐚𝐳𝐳𝐨 𝐚 𝐧𝐞𝐬𝐬𝐮𝐧𝐨 𝐝𝐢 𝐭𝐞*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

    await conn.sendMessage(
      m.chat,
      {
        text,
        mentions: [jid]
      },
      { quoted: m }
    )

    return true
  }

  return false
}

export default handler