// plugin scopa by Bonzino 

import { performance } from 'perf_hooks'

const sleep = ms => new Promise(r => setTimeout(r, ms))
const tag = jid => '@' + String(jid || '').split('@')[0]

async function editMessage(conn, chatId, key, text, mentions = []) {
  await conn.relayMessage(
    chatId,
    {
      protocolMessage: {
        key,
        type: 14,
        editedMessage: {
          extendedTextMessage: {
            text,
            contextInfo: mentions.length
              ? { mentionedJid: mentions }
              : {}
          }
        }
      }
    },
    {}
  )
}

let handler = async (m, { conn, text }) => {
  const chatId = m.chat
  if (!chatId) return

  const args = (text || '').trim().split(/\s+/)

  let destinatario =
    args.find(v => v.includes('@s.whatsapp.net')) ||
    m.quoted?.sender ||
    (Array.isArray(m.mentionedJid) && m.mentionedJid[0]) ||
    m?.message?.extendedTextMessage?.contextInfo?.participant ||
    m?.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
    null

  if (!destinatario) {
    await conn.sendMessage(
      chatId,
      {
        text: '⚠️ *Tagga qualcuno o rispondi a un messaggio.*'
      },
      { quoted: m }
    )
    return
  }

  const mentionTarget = destinatario

  if (!text || !text.trim()) {
    return conn.sendMessage(
      chatId,
      {
        text:
`╭━━━〔 ⚙️ MODALITÀ 〕━━━╮

*Scegli come vuoi procedere:*

╰━━━━━━━━━━━━━━━━╯`,
        footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
        buttons: [
          {
            buttonId: `.scopa lentamente ${mentionTarget}`,
            buttonText: { displayText: '🥱 Lentamente' },
            type: 1
          },
          {
            buttonId: `.scopa normalmente ${mentionTarget}`,
            buttonText: { displayText: '😏 Normalmente' },
            type: 1
          },
          {
            buttonId: `.scopa forte ${mentionTarget}`,
            buttonText: { displayText: '🔥 Forte' },
            type: 1
          },
          {
            buttonId: `.scopa massimo ${mentionTarget}`,
            buttonText: { displayText: '💀 Massimo' },
            type: 1
          }
        ],
        headerType: 1
      },
      { quoted: m }
    )
  }

  const mittente =
    m.sender ||
    m.key?.participant ||
    m.participant ||
    (m.key?.fromMe ? conn.user.id : m.key.remoteJid) ||
    ''

  const mode = text.trim().toLowerCase()

  const modeName =
    mode.includes('lentamente') ? 'lentamente' :
    mode.includes('normalmente') ? 'normalmente' :
    mode.includes('forte') ? 'forte' :
    mode.includes('massimo') ? 'massimo' :
    'normalmente'

  const start = performance.now()

  const sent = await conn.sendMessage(
    chatId,
    {
      text: `*Ora vado da ${tag(destinatario)} in modalità ${modeName}...* 😏`,
      mentions: [destinatario]
    },
    { quoted: m }
  )

  const key = sent.key
  if (!key) return

  await sleep(1200)

const frames = [
`   ●█▀█▄ ‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`    ●█▀█‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`   ●█▀█▄ ‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`    ●█▀█‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`   ●█▀█▄ ‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`    ●█▀█‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`   ●█▀█▄ ‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`,
`    ●█▀█‎͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`
]

const finalFrame =
`   ●█▀█💦‎Ɑ͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ ̶͞ لں͞`

  let frameDelay = 450
  let loops = 3

  if (mode.includes('lentamente')) {
    frameDelay = 700
    loops = 2
  }

  else if (mode.includes('normalmente')) {
    frameDelay = 450
    loops = 3
  }

  else if (mode.includes('forte')) {
    frameDelay = 170
    loops = 5
  }

  else if (mode.includes('massimo')) {
    frameDelay = 90
    loops = 7
  }

  for (let i = 0; i < loops; i++) {
    for (const frame of frames) {
      await editMessage(
        conn,
        chatId,
        key,
        frame,
        [destinatario]
      )

      await sleep(frameDelay)
    }
  }

  await editMessage(
    conn,
    chatId,
    key,
    finalFrame,
    [destinatario]
  )

  await sleep(900)

  const end = performance.now()
  const elapsed = ((end - start) / 1000).toFixed(2)

  await editMessage(
    conn,
    chatId,
    key,
    `🥵 *${tag(mittente)} ha raggiunto ${tag(destinatario)} in modalità ${modeName} in ${elapsed} secondi!*`,
    [mittente, destinatario]
  )
}

handler.help = [
  'scopa lentamente @utente',
  'scopa normalmente @utente',
  'scopa forte @utente',
  'scopa massimo @utente'
]

handler.tags = ['fun']
handler.command = ['scopa']
handler.group = true

export default handler