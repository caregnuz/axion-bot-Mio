// plugin by deadly

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

async function inviaBenvenuti(chatId, conn) {
  const dati = codaBenvenuti[chatId]
  if (!dati) return

  const utenti = [...dati.utenti]
  const gruppo = dati.gruppo || 'Gruppo'
  const chatDB = global.db.data.chats[chatId]

  delete codaBenvenuti[chatId]
  if (!utenti.length) return

  if (utenti.length > LIMITE_BENVENUTI_SINGOLI) {
    const mentions = utenti.slice(0, MENZIONI_MASSIME)
    let testo = `*Benvenuti @user in @nomegp!*`
    
    let testoFinale = testo
        .replace(/@user/g, `${utenti.length} nuovi utenti`)
        .replace(/@nomegp/g, gruppo)

    await conn.sendMessage(chatId, { text: testoFinale, mentions })
    return
  }

  for (let i = 0; i < utenti.length; i++) {
    const jid = utenti[i]
    const numero = jid.split('@')[0]
    
    let welcomeMsg = chatDB?.sWelcome || `*╭━━━━━━━👋━━━━━━━╮*\n*✦ 𝐁𝐄𝐍𝐕𝐄𝐍𝐔𝐓𝐎/𝐀 ✦*\n*╰━━━━━━━👋━━━━━━━╯*\n\n*@user 𝐛𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨/𝐚 𝐢𝐧 @nomegp!*`
    
    let testo = welcomeMsg
        .replace(/@user/g, `@${numero}`)
        .replace(/@nomegp/g, gruppo)

    if (i !== 0) await new Promise(r => setTimeout(r, RITARDO_BENVENUTO))

    await conn.sendMessage(chatId, {
      text: testo,
      mentions: [jid]
    })
  }
}

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return false

  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat || (!chat.welcome && !chat.goodbye)) return false

  const isAdd = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
  const isRemove = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE

  if (!isAdd && !isRemove) return false

  const who = m.messageStubParameters?.[0]
  if (!who) return false

  const jid = conn.decodeJid(who)
  const cleanUserId = jid.split('@')[0]
  const groupName = groupMetadata?.subject || 'Gruppo'

  if (isAdd && chat.welcome) {
    const coda = ottieniCoda(m.chat)
    coda.utenti.add(jid)
    coda.gruppo = groupName
    if (coda.timer) clearTimeout(coda.timer)
    coda.timer = setTimeout(() => {
      inviaBenvenuti(m.chat, conn).catch(console.error)
    }, TEMPO_RAGGRUPPAMENTO)
    return true
  }

  if (isRemove && chat.goodbye) {
    let goodbyeMsg = chat.sGoodbye || `*╭━━━━━━━👋━━━━━━━╮*\n*✦ 𝐀𝐃𝐃𝐈𝐎 ✦*\n*╰━━━━━━━👋━━━━━━━╯*\n\n*@user 𝐡𝐚 𝐥𝐚𝐬𝐜𝐢𝐚𝐭𝐨 @nomegp.*\n\n*Tanto non fregava un cazzo a nessuno di te*`
    
    let text = goodbyeMsg
        .replace(/@user/g, `@${cleanUserId}`)
        .replace(/@nomegp/g, groupName)

    await conn.sendMessage(m.chat, { text, mentions: [jid] }, { quoted: m })
    return true
  }
  return false
}

export default handler
