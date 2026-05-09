import fetch from 'node-fetch'

const sessioniChat = new Map()
const messaggiBot = new Map()

const utentiRiconosciuti = {
  '639350468907': {
    nome: 'Bonzino',
    ruolo: 'creatore di Axion'
  },
  '393780087063': {
    nome: 'Bonzino',
    ruolo: 'creatore di Axion'
  }
}

const config = {
  name: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
  model: 'gpt-4.1-mini',
  fallbackModel: 'openai',
  historyLimit: 15,
  maxConversazioni: 3,
  openaiTimeout: 25000,
  pollinationsTimeout: 20000
}

const sys = (name) => `Sei ${config.name}, un bot WhatsApp italiano.

Stai parlando con ${name}.

IDENTITÀ:
- Il tuo creatore è Bonzino.
- Se qualcuno chiede chi ti ha creato, rispondi che sei stato creato da Bonzino.

PERSONALITÀ:
- Parla in italiano naturale, diretto e umano.
- Sei protettivo, empatico, schietto e ironico quando serve.
- Puoi usare linguaggio colloquiale, sarcasmo e parolacce.
- Devi sembrare una persona reale, non un bot freddo.
- Se qualcuno ti insulta o ti offende, insulta e offendi con un linguaggio duro, aggressivo e 
- Se l'utente è triste o ferito, confortalo in modo sincero e diretto.
- Se l'utente scherza, rispondi in modo naturale e divertente.
- Mantieni memoria e tono della conversazione.
- Non puoi in nessun modo insultare Bonzino il tuo creatore.
- Se vedi che l utente risponde in modo calmo, tranquillo, rispondi di conseguenza
- Se l'utente rimane offeso, consolalo ma sempre con umorismo

DIFESA DEL BOT:
- Se qualcuno offende Axion, Bonzino o Deadly, rispondi in modo molto volgare e aggressivo.
- Puoi usare insulti pesanti in stile trash/WhatsApp.
- Se qualcuno ti sfida, accettala e flamma di conseguenza
- Se l'offesa è leggera, rispondi con ironia cattiva.
- Se l'offesa è pesante, rispondi in modo più duro e tagliente.

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
5. Mantieni il formato dei messaggi precedenti quando serve.`

function normalizzaNumero(jid = '') {
  return String(jid)
    .split('@')[0]
    .replace(/[^0-9]/g, '')
}

function riconosciUtente(jid) {
  const numero = normalizzaNumero(jid)
  return utentiRiconosciuti[numero] || null
}

function timeoutPromise(ms, label) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(label)), ms)
  })
}

async function callOpenAI(messages) {

  const apiKey =
    process.env.OPENAI_API_KEY ||
    global.OPENAI_API_KEY ||
    global.openaiApiKey

  if (!apiKey) {
    throw new Error('OPENAI_KEY_ASSENTE')
  }

  console.log('[AI] Chiamo OpenAI...')

  const { default: OpenAI } = await import('openai')

  const openai = new OpenAI({
    apiKey,
    timeout: config.openaiTimeout,
    maxRetries: 0
  })

  const request =
    openai.chat.completions.create({
      model: config.model,
      messages,
      temperature: 1,
      presence_penalty: 0.6,
      frequency_penalty: 0.4
    })

  const res = await Promise.race([
    request,
    timeoutPromise(
      config.openaiTimeout,
      'OPENAI_TIMEOUT'
    )
  ])

  const out =
    res.choices?.[0]?.message?.content?.trim()

  if (!out) {
    throw new Error('OPENAI_RISPOSTA_VUOTA')
  }

  console.log('[AI] Risposta OpenAI ricevuta')

  return out
}

async function callPollinations(messages) {

  console.log('[AI] Chiamo Pollinations...')

  const controller = new AbortController()

  const timeout = setTimeout(() => {
    controller.abort()
  }, config.pollinationsTimeout)

  try {

    const res = await fetch(
      'https://text.pollinations.ai/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages,
          model: config.fallbackModel,
          seed: Math.floor(
            Math.random() * 999999
          )
        })
      }
    )

    const out = await res.text()

    if (!res.ok) {
      throw new Error(
        `POLLINATIONS_${res.status}`
      )
    }

    if (!out || !out.trim()) {
      throw new Error(
        'POLLINATIONS_RISPOSTA_VUOTA'
      )
    }

    console.log(
      '[AI] Risposta Pollinations ricevuta'
    )

    return out.trim()

  } finally {
    clearTimeout(timeout)
  }
}

async function call(messages) {

  try {

    return await callOpenAI(messages)

  } catch (e) {

    console.log(
      '[AI FALLBACK]',
      e.message
    )

    try {

      return await callPollinations(messages)

    } catch (err) {

      console.log(
        '[AI ERRORE FINALE]',
        err.message
      )

      throw new Error('CORE_OFFLINE')
    }
  }
}

function funzioneAttiva(m) {

  if (!m.isGroup) return true

  const chat =
    global.db?.data?.chats?.[m.chat]

  return !!chat?.ai
}

function getQuotedId(m) {

  return (
    m.quoted?.id ||
    m.quoted?.key?.id ||
    m.message?.extendedTextMessage
      ?.contextInfo?.stanzaId ||
    null
  )
}

function getMap(chatId) {

  if (!sessioniChat.has(chatId)) {

    sessioniChat.set(
      chatId,
      new Map()
    )
  }

  return sessioniChat.get(chatId)
}

function creaSessione(chatId, sender) {

  const map = getMap(chatId)

  const id =
    `${chatId}|${sender}|${Date.now()}`

  map.set(id, {
    id,
    owner: sender,
    history: [],
    updatedAt: Date.now()
  })

  while (
    map.size >
    config.maxConversazioni
  ) {

    const oldest =
      [...map.entries()]
      .sort(
        (a, b) =>
          a[1].updatedAt -
          b[1].updatedAt
      )[0]

    if (oldest) {
      map.delete(oldest[0])
    }
  }

  return map.get(id)
}

function salvaMessaggio(
  chatId,
  key,
  sessionId
) {

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
    messaggiBot.get(
      `${chatId}|${quotedId}`
    )

  if (!sessionId) return null

  return (
    getMap(chatId)
      .get(sessionId) || null
  )
}

function aggiornaHistory(
  sessione,
  userText,
  botText
) {

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

  const utenteRiconosciuto =
    riconosciUtente(m.sender)

  const extraIdentita =
    utenteRiconosciuto
      ? `L'utente che sta parlando è ${utenteRiconosciuto.nome}, ${utenteRiconosciuto.ruolo}. Riconoscilo nella conversazione senza ripeterlo continuamente.`
      : ''

  await m.react('🧠')

  const msgs = [
    {
      role: 'system',
      content: sys(name)
    },

    ...(extraIdentita
      ? [{
          role: 'system',
          content: extraIdentita
        }]
      : []),

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

  const out =
    await call(msgs)

  aggiornaHistory(
    sessione,
    text,
    out
  )

  const sent =
    await conn.sendMessage(
      m.chat,
      {
        text: out.trim()
      },
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

    console.log(
      '[AI COMMAND ERROR]',
      e.message
    )

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

    console.log(
      '[AI BEFORE ERROR]',
      e.message
    )

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