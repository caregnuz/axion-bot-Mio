// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

global.ciboGame = global.ciboGame || {}
global.cooldowns = global.cooldowns || {}
global.db = global.db || { data: { users: {} } }
global.db.data = global.db.data || {}
global.db.data.users = global.db.data.users || {}

const S = v => String(v || '')
const random = arr => arr[Math.floor(Math.random() * arr.length)]

const playAgainButtons = prefix => [
  {
    buttonId: `${prefix}cibo`,
    buttonText: { displayText: '🍽️ Gioca Ancora!' },
    type: 1
  }
]

async function sendWithRetry(conn, chat, content, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await conn.sendMessage(chat, content, options)
    } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(r => setTimeout(r, 1000))
    }
  }
}

const frasi = [
  '🍽️ *𝐈𝐍𝐃𝐎𝐕𝐈𝐍𝐀 𝐈𝐋 𝐂𝐈𝐁𝐎!*',
  '😋 *𝐒𝐚𝐢 𝐜𝐡𝐞 𝐩𝐢𝐚𝐭𝐭𝐨 è 𝐪𝐮𝐞𝐬𝐭𝐨?*',
  '👨‍🍳 *𝐑𝐢𝐜𝐨𝐧𝐨𝐬𝐜𝐢 𝐪𝐮𝐞𝐬𝐭𝐚 𝐬𝐩𝐞𝐜𝐢𝐚𝐥𝐢𝐭à?*',
  '🍴 *𝐒𝐟𝐢𝐝𝐚 𝐜𝐮𝐥𝐢𝐧𝐚𝐫𝐢𝐚!*',
  '🔥 *𝐂𝐡𝐞 𝐜𝐢𝐛𝐨 è 𝐪𝐮𝐞𝐬𝐭𝐨?*',
  '🌍 *𝐈𝐧𝐝𝐨𝐯𝐢𝐧𝐚 𝐢𝐥 𝐧𝐨𝐦𝐞 𝐝𝐞𝐥 𝐩𝐢𝐚𝐭𝐭𝐨!*'
]

const cibi = [
  { nome: 'Pizza', url: 'https://upload.wikimedia.org/wikipedia/commons/d/d3/Supreme_pizza.jpg' },
  { nome: 'Sushi', url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Sushi_platter.jpg' },
  { nome: 'Hamburger', url: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/RedDot_Burger.jpg' },
  { nome: 'Carbonara', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Spaghetti_alla_Carbonara.jpg' },
  { nome: 'Lasagna', url: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Lasagne_-_stonesoup.jpg' },
  { nome: 'Tiramisù', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Tiramisu.jpg' },
  { nome: 'Paella', url: 'https://upload.wikimedia.org/wikipedia/commons/3/39/Paella_valenciana.jpg' },
  { nome: 'Ramen', url: 'https://upload.wikimedia.org/wikipedia/commons/6/60/Tonkotsu_Ramen.jpg' },
  { nome: 'Hot Dog', url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Hot_dog_with_mustard.png' },
  { nome: 'Gelato', url: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Gelato.jpg' }
]

function normalizeString(str) {
  return S(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
}

let handler = async (m, { conn, usedPrefix, isAdmin, command }) => {
  const chat = m.chat

  if (command === 'skipcibo') {
    if (!m.isGroup) return m.reply('*Solo nei gruppi.*')
    if (!global.ciboGame?.[chat]) return m.reply('*Nessuna partita attiva.*')
    if (!isAdmin && !m.fromMe) return m.reply('*Solo admin.*')

    clearTimeout(global.ciboGame[chat].timeout)

    await conn.sendMessage(chat, {
      text: `🛑 *GIOCO INTERROTTO*\n\n🍽️ Era: ${global.ciboGame[chat].rispostaOriginale}`,
      footer: 'Gioca di nuovo',
      buttons: playAgainButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })

    delete global.ciboGame[chat]
    return
  }

  if (global.ciboGame?.[chat]) {
    return m.reply('*C’è già una partita attiva.*')
  }

  const key = `cibo_${chat}`
  const now = Date.now()
  const last = global.cooldowns[key] || 0

  if (now - last < 10000) {
    const sec = Math.ceil((10000 - (now - last)) / 1000)
    return m.reply(`⏳ Aspetta ${sec}s`)
  }

  global.cooldowns[key] = now

  const scelta = random(cibi)
  const frase = random(frasi)

  try {
    const msg = await sendWithRetry(conn, chat, {
      image: { url: scelta.url },
      caption: `${frase}

🍽️ Rispondi con il nome!
⏱️ Tempo: 30s`
    }, { quoted: m })

    const hintTimeout = setTimeout(() => {
      if (!global.ciboGame?.[chat]) return
      conn.sendMessage(chat, {
        text: `💡 Suggerimento: inizia con *${scelta.nome[0]}*`
      })
    }, 10000)

    global.ciboGame[chat] = {
      id: msg.key.id,
      risposta: scelta.nome.toLowerCase(),
      rispostaOriginale: scelta.nome,
      tentativi: {},
      timeout: setTimeout(async () => {
        if (!global.ciboGame?.[chat]) return

        await conn.sendMessage(chat, {
          text: `⏳ Tempo scaduto!\n🍽️ Era: ${scelta.nome}`,
          footer: 'Gioca di nuovo',
          buttons: playAgainButtons(usedPrefix),
          headerType: 1
        }, { quoted: msg })

        delete global.ciboGame[chat]
      }, 30000),
      hintTimeout
    }

  } catch (e) {
    console.error('CIBO ERROR:', e)
    m.reply(`❌ Errore:\n${e.message}`)
  }
}

handler.before = async (m, { conn }) => {
  const game = global.ciboGame?.[m.chat]
  if (!game || !m.quoted || m.quoted.id !== game.id || m.key.fromMe) return

  const user = normalizeString(m.text)
  const correct = normalizeString(game.risposta)
  if (!user) return

  if (user === correct) {
    clearTimeout(game.timeout)
    clearTimeout(game.hintTimeout)

    const reward = Math.floor(Math.random() * 31) + 20
    const exp = 500

    global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}

    global.db.data.users[m.sender].euro =
      (global.db.data.users[m.sender].euro || 0) + reward

    global.db.data.users[m.sender].exp =
      (global.db.data.users[m.sender].exp || 0) + exp

    await conn.sendMessage(m.chat, {
      text: `🎉 Corretto!\n\n🍽️ Era: ${game.rispostaOriginale}\n💰 +${reward}\n🆙 +${exp} EXP`,
      footer: 'Gioca di nuovo',
      buttons: playAgainButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })

    delete global.ciboGame[m.chat]
    return
  }

  game.tentativi[m.sender] = (game.tentativi[m.sender] || 0) + 1
  const left = 3 - game.tentativi[m.sender]

  if (left <= 0) {
    await conn.sendMessage(m.chat, {
      text: `❌ Tentativi finiti!\n🍽️ Era: ${game.rispostaOriginale}`,
      footer: 'Gioca di nuovo',
      buttons: playAgainButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })

    delete global.ciboGame[m.chat]
  } else {
    conn.reply(m.chat, `❌ Sbagliato! Tentativi: ${left}`, m)
  }
}

handler.help = ['cibo']
handler.tags = ['giochi']
handler.command = /^(cibo|skipcibo)$/i
handler.group = true

export default handler