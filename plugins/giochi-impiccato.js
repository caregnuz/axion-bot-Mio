//plugin "impiccato" by Bonzino

import fs from 'fs'
import path from 'path'
import { createCanvas } from 'canvas'

let hangmanGames = {}
let hangmanSetup = {}

const footer = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
const DATA_PATH = path.resolve('./media/database/impiccato.json')

const DIFFICULTIES = {
  facile: { label: '🟢 Facile', attempts: 12, wordReward: 350, letterReward: 25, wordExp: 90, letterExp: 10 },
  normale: { label: '🟡 Normale', attempts: 10, wordReward: 500, letterReward: 35, wordExp: 120, letterExp: 15 },
  difficile: { label: '🔴 Difficile', attempts: 8, wordReward: 800, letterReward: 50, wordExp: 180, letterExp: 25 }
}

const S = v => String(v || '')
const random = arr => arr[Math.floor(Math.random() * arr.length)]
const tag = jid => '@' + String(jid || '').split('@')[0]

const gameButtons = prefix => [
  { buttonId: `${prefix}impiccato`, buttonText: { displayText: '🎮 Nuova Partita' }, type: 1 },
  { buttonId: `${prefix}skipimpiccato`, buttonText: { displayText: '⏩ Salta' }, type: 1 }
]

let handler = async (m, { conn, command, usedPrefix }) => {
  const chat = m.chat
  const cmd = String(command || '').toLowerCase()

  if (cmd === 'impiccato') {
    if (hangmanGames[chat]) {
      const game = hangmanGames[chat]

      if (m.sender !== game.starter) {
        return m.reply('*❌ 𝐒𝐨𝐥𝐨 𝐜𝐡𝐢 𝐡𝐚 𝐚𝐯𝐯𝐢𝐚𝐭𝐨 𝐥𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐩𝐮ò 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐛𝐨𝐭𝐭𝐨𝐧𝐞.*')
      }

      return conn.sendMessage(chat, {
        text: '*❌ 𝐂’è 𝐠𝐢à 𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨!*',
        footer,
        buttons: gameButtons(usedPrefix),
        headerType: 1
      }, { quoted: m })
    }

    hangmanSetup[chat] = { owner: m.sender, mode: null, createdAt: Date.now() }

    return conn.sendMessage(chat, {
      text: `╭━━━━━━━🎮━━━━━━━╮
*✦ 𝐈𝐌𝐏𝐈𝐂𝐂𝐀𝐓𝐎 ✦*
╰━━━━━━━🎮━━━━━━━╯

*🎲 𝐕𝐮𝐨𝐢 𝐠𝐢𝐨𝐜𝐚𝐫𝐞 𝐜𝐨𝐧 𝐮𝐧𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐜𝐚𝐬𝐮𝐚𝐥𝐞 𝐨 𝐬𝐜𝐞𝐠𝐥𝐢𝐞𝐫𝐞 𝐥𝐚 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚?*`,
      footer,
      buttons: [
        { buttonId: `${usedPrefix}impiccatocasuale`, buttonText: { displayText: '🎲 Casuale' }, type: 1 },
        { buttonId: `${usedPrefix}impiccatocategorie`, buttonText: { displayText: '📂 Categorie' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m })
  }

  if (cmd === 'impiccatocasuale') {
    hangmanSetup[chat] = {
      owner: m.sender,
      mode: 'casuale',
      category: null,
      createdAt: Date.now()
    }

    return conn.sendMessage(chat, {
      text: `╭━━━━━━━🎲━━━━━━━╮
*✦ 𝐌𝐎𝐃𝐀𝐋𝐈𝐓À 𝐂𝐀𝐒𝐔𝐀𝐋𝐄 ✦*
╰━━━━━━━🎲━━━━━━━╯

*📌 𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐯𝐞𝐫𝐫à 𝐬𝐜𝐞𝐥𝐭𝐚 𝐜𝐚𝐬𝐮𝐚𝐥𝐦𝐞𝐧𝐭𝐞 𝐝𝐚 𝐭𝐮𝐭𝐭𝐞 𝐥𝐞 𝐦𝐚𝐜𝐫𝐨 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞.*

*⚙️ 𝐒𝐜𝐞𝐠𝐥𝐢 𝐥𝐚 𝐝𝐢𝐟𝐟𝐢𝐜𝐨𝐥𝐭à.*`,
      footer,
      buttons: getDifficultyButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })
  }

  if (cmd === 'impiccatocategorie') {
    hangmanSetup[chat] = {
      owner: m.sender,
      mode: 'categoria',
      createdAt: Date.now()
    }

    return conn.sendMessage(chat, {
      text: `╭━━━━━━━📂━━━━━━━╮
*✦ 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐄 ✦*
╰━━━━━━━📂━━━━━━━╯

*📄 𝐒𝐜𝐞𝐠𝐥𝐢 𝐮𝐧𝐚 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚.*`,
      footer,
      buttons: getCategoryButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })
  }

  if (cmd === 'skipimpiccato') {
    if (!hangmanGames[chat]) return m.reply('*❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐝𝐚 𝐬𝐚𝐥𝐭𝐚𝐫𝐞.*')

    const game = hangmanGames[chat]

    if (m.sender !== game.starter) {
      return m.reply('*❌ 𝐒𝐨𝐥𝐨 𝐜𝐡𝐢 𝐡𝐚 𝐚𝐯𝐯𝐢𝐚𝐭𝐨 𝐥𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐩𝐮ò 𝐬𝐚𝐥𝐭𝐚𝐫𝐥𝐚.*')
    }

    const parola = game.word
    const mentions = getContributorMentions(game)

    game.guessed = game.word.split('')
    delete hangmanGames[chat]

    return sendHangman(conn, chat, game, `╭━━━━━━━⏩━━━━━━━╮
*✦ 𝐏𝐀𝐑𝐓𝐈𝐓𝐀 𝐒𝐀𝐋𝐓𝐀𝐓𝐀 ✦*
╰━━━━━━━⏩━━━━━━━╯

*📌 𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐞𝐫𝐚:* ${parola}

${renderContributors(game)}`, gameButtons(usedPrefix), m, mentions)
  }

  if (cmd.startsWith('impicatocat')) {
    const category = cmd.replace('impicatocat', '')
    const data = loadHangmanData()

    if (!data[category]) return m.reply('*❌ 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐚.*')

    hangmanSetup[chat] = {
      owner: m.sender,
      mode: 'categoria',
      category,
      createdAt: Date.now()
    }

    return conn.sendMessage(chat, {
      text: `╭━━━━━━━📂━━━━━━━╮
*✦ 𝐂𝐀𝐓𝐄𝐆𝐎𝐑𝐈𝐀 𝐒𝐂𝐄𝐋𝐓𝐀 ✦*
╰━━━━━━━📂━━━━━━━╯

*📌 𝐂𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐚:* ${formatCategory(category)}

*⚙️ 𝐒𝐜𝐞𝐠𝐥𝐢 𝐥𝐚 𝐝𝐢𝐟𝐟𝐢𝐜𝐨𝐥𝐭à.*`,
      footer,
      buttons: getDifficultyButtons(usedPrefix),
      headerType: 1
    }, { quoted: m })
  }

  if (cmd.startsWith('impicatodiff')) {
    const difficulty = cmd.replace('impicatodiff', '')
    const setup = hangmanSetup[chat]

    if (!setup) return m.reply('*❌ 𝐀𝐯𝐯𝐢𝐚 𝐩𝐫𝐢𝐦𝐚 𝐮𝐧𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐜𝐨𝐧 .𝐢𝐦𝐩𝐢𝐜𝐜𝐚𝐭𝐨.*')
    if (!DIFFICULTIES[difficulty]) return m.reply('*❌ 𝐃𝐢𝐟𝐟𝐢𝐜𝐨𝐥𝐭à 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐚.*')

    const data = loadHangmanData()
    const wordData = setup.mode === 'casuale'
      ? getRandomWordFromAll(data, difficulty)
      : getRandomWord(data, setup.category, difficulty)

    if (!wordData) return m.reply('*❌ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐩𝐚𝐫𝐨𝐥𝐞 𝐩𝐞𝐫 𝐪𝐮𝐞𝐬𝐭𝐚 𝐬𝐜𝐞𝐥𝐭𝐚.*')

    const diff = DIFFICULTIES[difficulty]
    const word = normalizeWord(wordData.word || wordData)

    hangmanGames[chat] = {
      word,
      category: wordData.category || setup.category || 'casuale',
      subcategory: wordData.subcategory || 'casuale',
      difficulty,
      hint: wordData.hint || '',
      guessed: Array(word.length).fill('_'),
      wrong: [],
      attempts: diff.attempts,
      maxAttempts: diff.attempts,
      starter: setup.owner || m.sender,
      contributors: {},
      guessedLettersBy: {},
      rewards: diff
    }

    delete hangmanSetup[chat]

    return sendHangman(conn, chat, hangmanGames[chat], renderLightCaption(hangmanGames[chat]), gameButtons(usedPrefix), m)
  }
}

handler.before = async (m, { conn, usedPrefix }) => {
  const chat = m.chat
  const game = hangmanGames[chat]

  if (!game || !m.text) return

  const input = S(m.text).toLowerCase().trim()
  if (!input) return
  if (/^\./.test(input)) return

  if (input.length > 1) {
    if (normalizeWord(input) === game.word) return winGame(conn, chat, game, m, usedPrefix, m.sender)
    game.attempts--
  } else {
    if (!/^[a-zàèéìòù]$/i.test(input)) return
    if (game.guessed.includes(input) || game.wrong.includes(input)) return

    if (game.word.includes(input)) {
      let found = 0

      for (let i = 0; i < game.word.length; i++) {
        if (game.word[i] === input) {
          game.guessed[i] = input
          found++
        }
      }

      rewardLetter(game, m.sender, input, found)

      await conn.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      })
    } else {
      game.wrong.push(input)
      game.attempts--

      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      })
    }
  }

  if (game.guessed.join('') === game.word) return winGame(conn, chat, game, m, usedPrefix, m.sender)

  if (game.attempts <= 0) {
    game.guessed = game.word.split('')
    delete hangmanGames[chat]

    const mentions = getContributorMentions(game)

    return sendHangman(conn, chat, game, `╭━━━━━━━💀━━━━━━━╮
*✦ 𝐇𝐀𝐈 𝐏𝐄𝐑𝐒𝐎 ✦*
╰━━━━━━━💀━━━━━━━╯

*📌 𝐋𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐞𝐫𝐚:* ${game.word}

${renderContributors(game)}`, gameButtons(usedPrefix), m, mentions)
  }

  return sendHangman(conn, chat, game, renderLightCaption(game), gameButtons(usedPrefix), m, getContributorMentions(game))
}

handler.command = /^(impiccato|skipimpiccato|impiccatocasuale|impiccatocategorie|impicatocat\w+|impicatodiff\w+)$/i
handler.tags = ['game']
handler.help = ['impiccato', 'skipimpiccato']
handler.group = true

export default handler

async function winGame(conn, chat, game, m, usedPrefix, winner) {
  const winnerUser = ensureUser(winner)

  winnerUser.euro += game.rewards.wordReward
  winnerUser.exp += game.rewards.wordExp
  game.guessed = game.word.split('')

  delete hangmanGames[chat]

  const mentions = [...new Set([winner, ...getContributorMentions(game)])]

  return sendHangman(conn, chat, game, `╭━━━━━━━🎉━━━━━━━╮
*✦ 𝐇𝐀𝐈 𝐕𝐈𝐍𝐓𝐎 ✦*
╰━━━━━━━🎉━━━━━━━╯

*🏆 𝐕𝐢𝐧𝐜𝐢𝐭𝐨𝐫𝐞:* ${tag(winner)}
*🔤 𝐏𝐚𝐫𝐨𝐥𝐚:* ${game.word}

*💰 𝐑𝐢𝐜𝐨𝐦𝐩𝐞𝐧𝐬𝐚:* +${game.rewards.wordReward}€
*⭐ 𝐄𝐬𝐩𝐞𝐫𝐢𝐞𝐧𝐳𝐚:* +${game.rewards.wordExp} EXP

${renderContributors(game)}`, gameButtons(usedPrefix), m, mentions)
}

function renderLightCaption(game) {
  return `*🎮 𝐏𝐚𝐫𝐭𝐢𝐭𝐚 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.*

*💰 𝐏𝐚𝐫𝐨𝐥𝐚 𝐢𝐧𝐝𝐨𝐯𝐢𝐧𝐚𝐭𝐚:* +${game.rewards.wordReward}€
*🤝 𝐋𝐞𝐭𝐭𝐞𝐫𝐚 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐚:* +${game.rewards.letterReward}€

*📝 𝐒𝐜𝐫𝐢𝐯𝐢 𝐮𝐧𝐚 𝐥𝐞𝐭𝐭𝐞𝐫𝐚 𝐨 𝐥𝐚 𝐩𝐚𝐫𝐨𝐥𝐚 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐚.*`
}

function rewardLetter(game, jid, letter, found) {
  const user = ensureUser(jid)
  const reward = game.rewards.letterReward * found
  const exp = game.rewards.letterExp * found

  user.euro += reward
  user.exp += exp

  game.contributors[jid] || (game.contributors[jid] = {
    letters: [],
    money: 0,
    exp: 0
  })

  game.contributors[jid].letters.push(letter)
  game.contributors[jid].money += reward
  game.contributors[jid].exp += exp
  game.guessedLettersBy[letter] = jid
}

function getCategoryButtons(prefix) {
  const data = loadHangmanData()
  const categories = Object.keys(data).slice(0, 10)

  if (!categories.length) {
    return [{ buttonId: `${prefix}impiccato`, buttonText: { displayText: '🔄 Riprova' }, type: 1 }]
  }

  return categories.map(category => ({
    buttonId: `${prefix}impicatocat${category}`,
    buttonText: { displayText: getCategoryEmoji(category) + ' ' + formatCategory(category) },
    type: 1
  }))
}

function getDifficultyButtons(prefix) {
  return [
    { buttonId: `${prefix}impicatodifffacile`, buttonText: { displayText: '🟢 Facile' }, type: 1 },
    { buttonId: `${prefix}impicatodiffnormale`, buttonText: { displayText: '🟡 Normale' }, type: 1 },
    { buttonId: `${prefix}impicatodiffdifficile`, buttonText: { displayText: '🔴 Difficile' }, type: 1 }
  ]
}

function loadHangmanData() {
  try {
    if (!fs.existsSync(DATA_PATH)) {
      fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true })
      fs.writeFileSync(DATA_PATH, JSON.stringify(getDefaultData(), null, 2))
    }

    return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'))
  } catch (e) {
    console.error('Errore caricamento impiccato.json:', e)
    return getDefaultData()
  }
}

function getRandomWord(data, category, difficulty) {
  const macro = data?.[category]
  if (!macro || typeof macro !== 'object') return null

  const subcategories = Object.keys(macro).filter(sub => Array.isArray(macro[sub]?.[difficulty]) && macro[sub][difficulty].length)
  if (!subcategories.length) return null

  const subcategory = random(subcategories)
  const list = macro[subcategory][difficulty]
  const item = random(list)
  const base = typeof item === 'string' ? { word: item, hint: '' } : item

  return { ...base, category, subcategory }
}

function getRandomWordFromAll(data, difficulty) {
  const categories = Object.keys(data || {})
  const valid = []

  for (const category of categories) {
    const macro = data[category]
    if (!macro || typeof macro !== 'object') continue

    for (const subcategory of Object.keys(macro)) {
      const list = macro[subcategory]?.[difficulty]
      if (Array.isArray(list) && list.length) valid.push({ category, subcategory, list })
    }
  }

  if (!valid.length) return null

  const picked = random(valid)
  const item = random(picked.list)
  const base = typeof item === 'string' ? { word: item, hint: '' } : item

  return {
    ...base,
    category: picked.category,
    subcategory: picked.subcategory
  }
}

function getDefaultData() {
  return {
    generale: {
      oggetti: {
        facile: [{ word: 'casa', hint: 'Oggetto o luogo comune.' }],
        normale: [{ word: 'telefono', hint: 'Oggetto tecnologico quotidiano.' }],
        difficile: [{ word: 'frigorifero', hint: 'Elettrodomestico.' }]
      }
    },
    cinema_serie: {
      film: {
        facile: [{ word: 'avatar', hint: 'Film fantascientifico di James Cameron.' }],
        normale: [{ word: 'interstellar', hint: 'Film di Nolan ambientato nello spazio.' }],
        difficile: [{ word: 'mulhollanddrive', hint: 'Film enigmatico di David Lynch.' }]
      }
    },
    gaming: {
      videogiochi: {
        facile: [{ word: 'mario', hint: 'Icona Nintendo.' }],
        normale: [{ word: 'hollowknight', hint: 'Metroidvania con insetti e oscurità.' }],
        difficile: [{ word: 'nierautomata', hint: 'Action RPG filosofico di Yoko Taro.' }]
      }
    }
  }
}

async function sendHangman(conn, chat, game, text, buttons, quoted, mentions = []) {
  const image = renderHangmanImage(game)

  return conn.sendMessage(chat, {
    image,
    caption: text,
    footer,
    buttons,
    headerType: 4,
    mentions
  }, { quoted })
}

function renderContributors(game) {
  const entries = Object.entries(game.contributors || {})

  if (!entries.length) return '*🤝 𝐂𝐨𝐥𝐥𝐚𝐛𝐨𝐫𝐚𝐭𝐨𝐫𝐢:* 𝐧𝐞𝐬𝐬𝐮𝐧𝐨'

  const rows = entries
    .sort((a, b) => b[1].money - a[1].money)
    .slice(0, 5)
    .map(([jid, data], index) => {
      const letters = [...new Set(data.letters)].join(', ')
      return `*${getMedal(index)} ${index + 1}. ${tag(jid)}* — *💰 +${data.money}€ / ⭐ +${data.exp} EXP* 𝐜𝐨𝐧 * ${letters}*`
    })
    .join('\n')

  return `*🤝 𝐂𝐨𝐥𝐥𝐚𝐛𝐨𝐫𝐚𝐭𝐨𝐫𝐢:*\n${rows}`
}

function getMedal(index) {
  if (index === 0) return '🥇'
  if (index === 1) return '🥈'
  if (index === 2) return '🥉'
  return '🏅'
}

function getContributorMentions(game) {
  return Object.keys(game.contributors || {})
}

function ensureUser(jid) {
  global.db.data.users[jid] || (global.db.data.users[jid] = {})
  const user = global.db.data.users[jid]
  user.euro = Number(user.euro) || 0
  user.exp = Number(user.exp) || 0
  return user
}

function formatCategory(category) {
  return String(category || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function getCategoryEmoji(category) {
  const icons = {
    generale: '🌍',
    cinema_serie: '🎬',
    anime_manga: '🧠',
    gaming: '🎮',
    cultura_generale: '📚',
    tech: '💻',
    musica: '🎵',
    internet_meme: '😂'
  }

  return icons[category] || '📂'
}

function normalizeWord(word) {
  return String(word || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '')
}

function renderHangmanImage(game) {
  const width = 1920
  const height = 1080
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  const errors = game.maxAttempts - game.attempts

  drawBackground(ctx, width, height)
  drawHeader(ctx, width)
  drawAttemptsBadge(ctx, width, game)
  drawGallows(ctx, errors)
  drawInfoPanel(ctx, game)
  drawPoweredBy(ctx, width, height)

  return canvas.toBuffer('image/png')
}

function drawBackground(ctx, width, height) {
  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#050510')
  bg.addColorStop(0.5, '#12122b')
  bg.addColorStop(1, '#050508')

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  const glow = ctx.createRadialGradient(width / 2, height / 2, 70, width / 2, height / 2, 980)
  glow.addColorStop(0, 'rgba(0,255,170,0.15)')
  glow.addColorStop(0.45, 'rgba(70,80,255,0.11)')
  glow.addColorStop(1, 'rgba(0,0,0,0.68)')

  ctx.fillStyle = glow
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(0,255,170,0.35)'
  ctx.fillRect(0, 0, width, 9)
  ctx.fillRect(0, height - 9, width, 9)
}

function drawHeader(ctx, width) {
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 82px Sans'
  ctx.shadowColor = 'rgba(0,255,170,0.45)'
  ctx.shadowBlur = 28
  ctx.fillText('✦ IMPICCATO ✦', width / 2, 118)
  ctx.shadowBlur = 0
}

function drawAttemptsBadge(ctx, width, game) {
  const x = width - 430
  const y = 62
  const w = 285
  const h = 112
  const vita = Math.max(0, game.attempts)

  ctx.fillStyle = 'rgba(255,255,255,0.07)'
  roundRect(ctx, x, y, w, h, 28, true)

  ctx.strokeStyle = vita <= 2 ? '#ff4d6d' : '#00ffaa'
  ctx.lineWidth = 5
  roundRect(ctx, x, y, w, h, 28, false, true)

  ctx.textAlign = 'center'
  ctx.font = 'bold 24px Sans'
  ctx.fillStyle = 'rgba(255,255,255,0.76)'
  ctx.fillText('TENTATIVI', x + w / 2, y + 40)

  ctx.font = 'bold 46px Sans'
  ctx.fillStyle = vita <= 2 ? '#ff4d6d' : '#00ffaa'
  ctx.fillText(`${vita}/${game.maxAttempts}`, x + w / 2, y + 88)
}

function drawGallows(ctx, errors) {
  const x = 210
  const y = 260

  ctx.strokeStyle = '#d9e6ff'
  ctx.lineWidth = 18
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  if (errors >= 1) line(ctx, x, y + 630, x + 540, y + 630)
  if (errors >= 2) line(ctx, x + 130, y + 630, x + 130, y)
  if (errors >= 3) line(ctx, x + 130, y, x + 500, y)
  if (errors >= 4) line(ctx, x + 500, y, x + 500, y + 110)

  ctx.strokeStyle = '#00ffaa'
  ctx.lineWidth = 15

  if (errors >= 5) {
    ctx.beginPath()
    ctx.arc(x + 500, y + 190, 78, 0, Math.PI * 2)
    ctx.stroke()
  }

  if (errors >= 6) line(ctx, x + 500, y + 268, x + 500, y + 455)
  if (errors >= 7) line(ctx, x + 500, y + 320, x + 390, y + 405)
  if (errors >= 8) line(ctx, x + 500, y + 320, x + 610, y + 405)
  if (errors >= 9) line(ctx, x + 500, y + 455, x + 410, y + 590)
  if (errors >= 10) line(ctx, x + 500, y + 455, x + 590, y + 590)
  if (errors >= 11) line(ctx, x + 500, y + 190, x + 455, y + 165)
  if (errors >= 12) line(ctx, x + 500, y + 190, x + 545, y + 165)
}

function drawInfoPanel(ctx, game) {
  const x = 860
  const y = 240
  const w = 900
  const h = 680
  const errors = game.maxAttempts - game.attempts

  ctx.fillStyle = 'rgba(255,255,255,0.075)'
  roundRect(ctx, x, y, w, h, 46, true)

  ctx.strokeStyle = 'rgba(0,255,170,0.50)'
  ctx.lineWidth = 5
  roundRect(ctx, x, y, w, h, 46, false, true)

  ctx.textAlign = 'left'

  ctx.font = 'bold 38px Sans'
  ctx.fillStyle = '#ffffff'
  ctx.fillText('CATEGORIA', x + 58, y + 82)

  ctx.font = 'bold 46px Sans'
  ctx.fillStyle = '#00ffaa'
  ctx.fillText(formatCategory(game.category).toUpperCase(), x + 58, y + 136)

  ctx.font = 'bold 29px Sans'
  ctx.fillStyle = 'rgba(255,255,255,0.68)'
  ctx.fillText(formatCategory(game.subcategory || '').toUpperCase(), x + 58, y + 178)

  ctx.font = 'bold 38px Sans'
  ctx.fillStyle = '#ffffff'
  ctx.fillText('DIFFICOLTÀ', x + 58, y + 250)

  ctx.font = 'bold 43px Sans'
  ctx.fillStyle = '#ffd86b'
  ctx.fillText((DIFFICULTIES[game.difficulty]?.label || game.difficulty).replace(/[🟢🟡🔴]/g, '').trim().toUpperCase(), x + 58, y + 304)

  ctx.font = 'bold 38px Sans'
  ctx.fillStyle = '#ffffff'
  ctx.fillText('PAROLA', x + 58, y + 380)

  drawWord(ctx, game.guessed.join(' '), x + 58, y + 452, w - 116)

  ctx.font = 'bold 35px Sans'
  ctx.fillStyle = '#ffffff'
  ctx.fillText('TENTATIVI', x + 58, y + 540)

  drawLifeBar(ctx, x + 58, y + 568, w - 116, 38, game.attempts, game.maxAttempts)

  ctx.font = 'bold 30px Sans'
  ctx.fillStyle = '#ffb3c1'
  ctx.fillText(game.wrong.join(', ') || 'NESSUNO', x + 58, y + 662)
}

function drawPoweredBy(ctx, width, height) {
  ctx.textAlign = 'right'
  ctx.font = 'bold 32px Sans'
  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.shadowColor = 'rgba(0,255,170,0.45)'
  ctx.shadowBlur = 14
  ctx.fillText('POWERED BY AXION BOT', width - 80, height - 45)
  ctx.shadowBlur = 0
}

function drawWord(ctx, text, x, y, maxWidth) {
  let size = 58
  ctx.font = `bold ${size}px Sans`

  while (ctx.measureText(text).width > maxWidth && size > 30) {
    size -= 2
    ctx.font = `bold ${size}px Sans`
  }

  ctx.fillStyle = '#f5f5f5'
  ctx.fillText(text, x, y)
}

function drawLifeBar(ctx, x, y, w, h, vita, max) {
  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  roundRect(ctx, x, y, w, h, 15, true)

  const segmentW = (w - 30) / max

  for (let i = 0; i < max; i++) {
    ctx.fillStyle = i < vita ? '#00ffaa' : '#ff4d6d'
    roundRect(ctx, x + 7 + i * segmentW, y + 7, segmentW - 5, h - 14, 8, true)
  }
}

function line(ctx, x1, y1, x2, y2) {
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

function roundRect(ctx, x, y, width, height, radius, fill = false, stroke = false) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()

  if (fill) ctx.fill()
  if (stroke) ctx.stroke()
}