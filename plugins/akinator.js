//Plugin Akinator by Bonzino

import axios from 'axios'

const sessions = new Map()

const FOOTER = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
const TIMEOUT = 5 * 60 * 1000

function S(v) {
  return String(v || '')
}

async function react(m, emoji) {
  try { await m.react(emoji) } catch {}
}

function getSessionId(m) {
  return `${m.chat}:${m.sender}`
}

function clearSession(id) {
  const session = sessions.get(id)
  if (session?.timeout) clearTimeout(session.timeout)
  sessions.delete(id)
}

async function askAI(prompt) {
  const url = `https://api.api-me.pro/api/gpt4?q=${encodeURIComponent(prompt)}`
  const { data } = await axios.get(url, { timeout: 45000 })
  return S(data?.content || data?.result || data?.response || '').trim()
}

async function getCharacterImage(name) {
  try {
    const title = encodeURIComponent(name)
    const { data } = await axios.get(`https://it.wikipedia.org/api/rest_v1/page/summary/${title}`, {
      timeout: 15000
    })

    return data?.thumbnail?.source || data?.originalimage?.source || null
  } catch {
    return null
  }
}

function resetTimeout(id, m, conn) {
  const session = sessions.get(id)
  if (!session) return

  if (session.timeout) clearTimeout(session.timeout)

  session.timeout = setTimeout(async () => {
    sessions.delete(id)

    await conn.sendMessage(m.chat, {
      text:
`*╭━━━━━━━⏱️━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 ✦*
*╰━━━━━━━⏱️━━━━━━━╯*

*⏱️ 𝐒𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐬𝐜𝐚𝐝𝐮𝐭𝐚.*
*𝐇𝐚𝐢 𝐢𝐦𝐩𝐢𝐞𝐠𝐚𝐭𝐨 𝐭𝐫𝐨𝐩𝐩𝐨 𝐭𝐞𝐦𝐩𝐨 𝐚 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞.*

> ${FOOTER}`
    }, { quoted: m })
  }, TIMEOUT)
}

function buttonsMessage(text, usedPrefix) {
  return {
    text,
    footer: FOOTER,
    buttons: [
      { buttonId: 'si', buttonText: { displayText: '✅ Sì' }, type: 1 },
      { buttonId: 'no', buttonText: { displayText: '❌ No' }, type: 1 },
      { buttonId: 'forse', buttonText: { displayText: '🤔 Forse' }, type: 1 },
      { buttonId: 'non so', buttonText: { displayText: '❓ Non so' }, type: 1 },
      { buttonId: `${usedPrefix}aki stop`, buttonText: { displayText: '🛑 Stop' }, type: 1 }
    ],
    headerType: 1
  }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  const id = getSessionId(m)

  const buttonAnswer =
    m.message?.buttonsResponseMessage?.selectedButtonId ||
    m.message?.templateButtonReplyMessage?.selectedId ||
    null

  const rawText = buttonAnswer || S(m.text).trim()
  const cleanText = S(rawText).replace(new RegExp(`^\\${usedPrefix}(akinator|aki)\\s*`, 'i'), '').trim()

  if (sessions.has(id)) {
    if (/^(stop|annulla|fine|exit|\/stop)$/i.test(cleanText)) {
      clearSession(id)
      await react(m, '🛑')

      return conn.sendMessage(m.chat, {
        text:
`*╭━━━━━━━🛑━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 ✦*
*╰━━━━━━━🛑━━━━━━━╯*

*𝐏𝐚𝐫𝐭𝐢𝐭𝐚 𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐭𝐚.*

> ${FOOTER}`
      }, { quoted: m })
    }

    if (!cleanText) return

    try {
      await react(m, '🧠')

      const session = sessions.get(id)
      session.turns++

      const prompt =
`Stai giocando ad Akinator in italiano.
Devi indovinare il personaggio, reale o immaginario, a cui l'utente sta pensando.
Fai UNA SOLA domanda breve alla volta.
La domanda deve poter ricevere risposta: sì, no, forse, non so.
Non spiegare il ragionamento.
Se sei abbastanza sicuro, rispondi ESATTAMENTE nel formato:
INDOVINATO: Nome personaggio

Storico:
${session.history.join('\n')}

Risposta utente: ${cleanText}`

      const replyText = await askAI(prompt)

      session.history.push(`Utente: ${cleanText}`)
      session.history.push(`Akinator: ${replyText}`)

      resetTimeout(id, m, conn)

      if (/INDOVINATO:/i.test(replyText)) {
        const nome = replyText.split(/INDOVINATO:/i)[1]?.trim() || 'N/D'
        const image = await getCharacterImage(nome)

        clearSession(id)
        await react(m, '🏆')

        const caption =
`*╭━━━━━━━🏆━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 ✦*
*╰━━━━━━━🏆━━━━━━━╯*

*✨ 𝐕𝐢𝐭𝐭𝐨𝐫𝐢𝐚!*

*𝐒𝐭𝐚𝐯𝐢 𝐩𝐞𝐧𝐬𝐚𝐧𝐝𝐨 𝐚:*
*${nome}*

> ${FOOTER}`

        if (image) {
          return conn.sendMessage(m.chat, {
            image: { url: image },
            caption
          }, { quoted: m })
        }

        return conn.sendMessage(m.chat, { text: caption }, { quoted: m })
      }

      return conn.sendMessage(m.chat, buttonsMessage(
`*╭━━━━━━━🧞━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 ✦*
*╰━━━━━━━🧞━━━━━━━╯*

*${replyText}*

*↳ 𝐒𝐜𝐞𝐠𝐥𝐢 𝐮𝐧𝐚 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐝𝐚𝐢 𝐛𝐨𝐭𝐭𝐨𝐧𝐢.*
*↳ 𝐒𝐜𝐫𝐢𝐯𝐢:* *stop* *𝐩𝐞𝐫 𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐫𝐞.*`,
        usedPrefix
      ), { quoted: m })

    } catch (e) {
      console.error('Errore akinator:', e?.message || e)
      clearSession(id)
      await react(m, '❌')

      return conn.sendMessage(m.chat, {
        text:
`*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*❌ 𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐜𝐚𝐫𝐢𝐜𝐚𝐫𝐞 𝐥𝐚 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐚.*

> ${FOOTER}`
      }, { quoted: m })
    }
  }

  try {
    await react(m, '🧞')

    const prompt =
`Inizia una partita ad Akinator in italiano.
Saluta in modo breve e fai la prima domanda.
Regole:
- una sola domanda
- domanda chiara
- risposta possibile: sì, no, forse, non so
- non dire di essere GPT`

    const startTxt = await askAI(prompt)

    sessions.set(id, {
      active: true,
      turns: 1,
      history: [`Akinator: ${startTxt}`],
      timeout: null
    })

    resetTimeout(id, m, conn)

    return conn.sendMessage(m.chat, buttonsMessage(
`*╭━━━━━━━🧞━━━━━━━╮*
*✦ 𝐀𝐊𝐈𝐍𝐀𝐓𝐎𝐑 𝐀𝐈 ✦*
*╰━━━━━━━🧞━━━━━━━╯*

*${startTxt}*

*↳ 𝐒𝐜𝐞𝐠𝐥𝐢 𝐮𝐧𝐚 𝐫𝐢𝐬𝐩𝐨𝐬𝐭𝐚 𝐝𝐚𝐢 𝐛𝐨𝐭𝐭𝐨𝐧𝐢.*
*↳ 𝐒𝐜𝐫𝐢𝐯𝐢:* *stop* *𝐩𝐞𝐫 𝐭𝐞𝐫𝐦𝐢𝐧𝐚𝐫𝐞.*`,
      usedPrefix
    ), { quoted: m })

  } catch (e) {
    console.error('Errore avvio akinator:', e?.message || e)
    await react(m, '❌')

    return conn.sendMessage(m.chat, {
      text:
`*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*❌ 𝐀𝐯𝐯𝐢𝐨 𝐝𝐞𝐥𝐥𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐧𝐨𝐧 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨.*

> ${FOOTER}`
    }, { quoted: m })
  }
}

handler.help = ['akinator']
handler.tags = ['fun']
handler.command = /^(akinator|aki)$/i

export default handler