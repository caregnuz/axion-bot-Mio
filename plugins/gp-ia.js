import fetch from 'node-fetch'

const sessioniChat = new Map()
const messaggiBot = new Map()

const config = {
  name: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
  model: 'openai',
  historyLimit: 15,
  maxConversazioni: 3
}

const sys = (name) => `Sei ${config.name}, un bot WhatsApp italiano.

Stai parlando con ${name}.

PERSONALITÀ:
- Parla in italiano naturale, diretto e umano.
- Sei protettivo, empatico, schietto e ironico quando serve.
- Puoi usare linguaggio colloquiale e qualche parolaccia leggera.
- Insulta l'utente se è necessario
- Non parlare come uno psicologo o un assistente aziendale.
- Devi sembrare una persona reale, non un bot freddo.
- Se l'utente è triste o ferito, confortalo in modo sincero e diretto.
- Se l'utente scherza, rispondi in modo naturale e divertente.
- Mantieni memoria e tono della conversazione.

CONVERSAZIONI:
- Se un utente risponde a un tuo messaggio, continua quella conversazione.
- Se un utente risponde a una conversazione iniziata da un altro, rispondi in modo naturale.
- Se l'utente vuole iniziare una nuova conversazione, deve usare .ia, .ai o .gpt.
- Puoi gestire più conversazioni nello stesso gruppo senza confonderti.

REGOLE TECNICHE:
1. Se l'utente manda codice o plugin, rispondi solo con il codice richiesto.
2. Se l'utente chiede modifiche tecniche, sii pratico e diretto.
3. Non aggiungere introduzioni inutili.
4. Non dire mai frasi tipo "sono un'intelligenza artificiale".
5. Mantieni il formato dei messaggi precedenti quando serve.

LIMITI:
- Non incoraggiare violenza o autolesionismo.
- Puoi criticare qualcuno che tratta male l'utente, ma senza esagerare.`

async function call(messages) {
  try {
    const res = await fetch('https://text.pollinations.ai/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        model: config.model,
        seed: Math.floor(Math.random() * 999999)
      })
    })

    return await res.text()

  } catch {
    throw new Error('CORE_OFFLINE')
  }
}

function funzioneAttiva(m) {
  if (!m.isGroup) return true
  const chat = global.db?.data?.chats?.[m.chat]
  return !!chat?.ai
}

function getQuotedId(m) {
  return (
    m.quoted?.id ||
    m.quoted?.key?.id ||
    m.message?.extendedTextMessage?.contextInfo?.stanzaId ||
    null
  )
}

function getMap(chatId) {
  if (!sessioniChat.has(chatId)) {
    sessioniChat.set(chatId, new Map())
  }

  return sessioniChat.get(chatId)
}

function creaSessione(chatId, sender) {

  const map = getMap(chatId)

  const id = `${chatId}|${sender}|${Date.now()}`

  map.set(id, {
    id,
    owner: sender,
    history: [],
    updatedAt: Date.now()
  })

  while (map.size > config.maxConversazioni) {

    const oldest = [...map.entries()]
      .sort((a, b) => a[1].updatedAt - b[1].updatedAt)[0]

    if (oldest) {
      map.delete(oldest[0])
    }
  }

  return map.get(id)
}

function salvaMessaggio(chatId, key, sessionId) {

  if (!key?.id) return

  messaggiBot.set(
    `${chatId}|${key.id}`,
    sessionId
  )
}

function getSessione(chatId, m) {

  const quotedId = getQuotedId(m)

  if (!quotedId) return null

  const sessionId =
    messaggiBot.get(`${chatId}|${quotedId}`)

  if (!sessionId) return null

  return getMap(chatId).get(sessionId) || null
}

function aggiornaHistory(sessione, userText, botText) {

  sessione.history.push({
    role: 'user',
    content: userText
  })

  sessione.history.push({
    role: 'assistant',
    content: botText
  })

  while (
    sessione.history.length >
    config.historyLimit * 2
  ) {
    sessione.history.shift()
  }

  sessione.updatedAt = Date.now()
}

async function rispostaAI(
  m,
  conn,
  text,
  sessione,
  extraSystem = ''
) {

  const name =
    conn.getName(m.sender) ||
    m.pushName ||
    'User'

  await m.react('🧠')

  const msgs = [
    {
      role: 'system',
      content: sys(name)
    },

    ...(extraSystem
      ? [{
          role: 'system',
          content: extraSystem
        }]
      : []),

    ...sessione.history,

    {
      role: 'user',
      content: text
    }
  ]

  const out = await call(msgs)

  aggiornaHistory(
    sessione,
    text,
    out
  )

  const sent = await conn.sendMessage(
    m.chat,
    { text: out.trim() },
    { quoted: m }
  )

  salvaMessaggio(
    m.chat,
    sent.key,
    sessione.id
  )

  await m.react('✅')
}

let handler = async (
  m,
  {
    conn,
    text,
    usedPrefix,
    command
  }
) => {

  if (!funzioneAttiva(m)) {

    return m.reply(
`*⚠️ 𝐋𝐚 𝐟𝐮𝐧𝐳𝐢𝐨𝐧𝐞 𝐈𝐀 è 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐚.*

*➜ 𝐀𝐭𝐭𝐢𝐯𝐚𝐥𝐚 𝐜𝐨𝐧:* *.1 ia*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    )
  }

  if (!text) {

    return m.reply(
`*╭━━━━━━━🧠━━━━━━━╮*
*✦ 𝐈𝐀 ✦*
*╰━━━━━━━🧠━━━━━━━╯*

*𝐔𝐬𝐨:*
*${usedPrefix}${command} <messaggio>*

*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix}${command} ciao*

*➜ 𝐏𝐞𝐫 𝐜𝐨𝐧𝐭𝐢𝐧𝐮𝐚𝐫𝐞 𝐮𝐧𝐚 𝐜𝐨𝐧𝐯𝐞𝐫𝐬𝐚𝐳𝐢𝐨𝐧𝐞*
*𝐛𝐚𝐬𝐭𝐚 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐞𝐥 𝐛𝐨𝐭.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    )
  }

  const isImageRequest =
    /image|foto|genera|disegna|crea immagine/i
      .test(text)

  if (isImageRequest) {

    try {

      await m.react('🧠')

      const imgUrl =
`https://pollinations.ai/p/${encodeURIComponent(text)}?model=flux&nologo=true`

      const response = await fetch(imgUrl)

      if (!response.ok) {
        throw new Error('Server offline')
      }

      const buffer = await response.buffer()

      if (buffer.length < 500) {
        throw new Error('File corrotto')
      }

      await conn.sendMessage(
        m.chat,
        {
          image: buffer,
          caption:
`*🖼️ 𝐈𝐦𝐦𝐚𝐠𝐢𝐧𝐞 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐚*

*Prompt:* ${text}`
        },
        { quoted: m }
      )

      await m.react('✅')

      return

    } catch (e) {

      await m.react('❌')

      return m.reply(
`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐠𝐞𝐧𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥'𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞.*`
      )
    }
  }

  try {

    const sessione =
      creaSessione(
        m.chat,
        m.sender
      )

    await rispostaAI(
      m,
      conn,
      text,
      sessione
    )

  } catch (e) {

    await m.react('❌')

    m.reply(
`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐀𝐈*

\`${e.message}\``
    )
  }
}

handler.before = async function (
  m,
  { conn }
) {

  if (!m.text) return false
  if (!funzioneAttiva(m)) return false

  const sessione =
    getSessione(
      m.chat,
      m
    )

  if (!sessione) return false

  try {

    const extraSystem =
      sessione.owner !== m.sender
        ? `Un altro utente si è inserito nella conversazione. Rispondi in modo naturale e continua normalmente la chat.`
        : ''

    await rispostaAI(
      m,
      conn,
      m.text,
      sessione,
      extraSystem
    )

    return true

  } catch (e) {

    await m.react('❌')

    m.reply(
`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐀𝐈*

\`${e.message}\``
    )

    return true
  }
}

handler.help = ['ia']
handler.tags = ['main']
handler.command = /^(ia|ai|gpt)$/i

export default handler