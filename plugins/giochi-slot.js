let cooldowns = {}

const fruits = ['🍒', '🍋', '🍉', '🍇', '🍎', '🍓']
const RITARDO_RISULTATO = 5500

let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = {})
  const COOLDOWN = 45 * 1000

  if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < COOLDOWN) {
    let timeLeft = cooldowns[m.sender] + COOLDOWN - Date.now()
    let min = Math.floor(timeLeft / 60000)
    let sec = Math.floor((timeLeft % 60000) / 1000)

    return conn.reply(
      m.chat,
      `*⏳ 𝐀𝐬𝐩𝐞𝐭𝐭𝐚 ${min}𝐦 ${sec}𝐬 𝐩𝐫𝐢𝐦𝐚 𝐝𝐢 𝐠𝐢𝐨𝐜𝐚𝐫𝐞 𝐚𝐧𝐜𝐨𝐫𝐚.*`,
      m
    )
  }

  try {
    await conn.sendMessage(m.chat, {
      react: { text: '🎰', key: m.key }
    })

    let result = [
      pick(fruits),
      pick(fruits),
      pick(fruits),
      pick(fruits),
      pick(fruits)
    ]

    let win =
      result[0] === result[1] ||
      result[1] === result[2] ||
      result[2] === result[3] ||
      result[3] === result[4]

    user.euro = Number(user.euro) || 0
    user.exp = Number(user.exp) || 0
    user.level = Number(user.level) || 1

    let denaroText = ''
    let expText = ''

    if (win) {
      let denaroWin = Math.floor(Math.random() * 901) + 100
      let xpWin = Math.floor(Math.random() * 51) + 50

      user.euro += denaroWin
      user.exp += xpWin

      denaroText = `+${formatNumber(denaroWin)}€`
      expText = `+${formatNumber(xpWin)}`
    } else {
      let denaroLose = Math.min(user.euro, Math.floor(Math.random() * 101) + 50)
      let xpLose = Math.floor(Math.random() * 31) + 20

      user.euro -= denaroLose
      user.exp = Math.max(0, user.exp - xpLose)

      denaroText = `-${formatNumber(denaroLose)}€`
      expText = `-${formatNumber(xpLose)}`
    }

    const { generateSlotMp4 } =
      await import(`../lib/cards/slot-card.js?update=${Date.now()}`)

    let mp4Path = await generateSlotMp4(result, {
  win,
  esitoText: win ? 'VITTORIA' : 'SCONFITTA',
  denaroText,
  expText,
  saldoEuro: formatNumber(user.euro),
  saldoExp: formatNumber(user.exp)
})

    cooldowns[m.sender] = Date.now()

    await conn.sendMessage(
      m.chat,
      {
        video: global.fs.readFileSync(mp4Path),
        gifPlayback: true
      },
      { quoted: m }
    )

    try {
      global.fs.unlinkSync(mp4Path)
    } catch {}

    await delay(RITARDO_RISULTATO)

    await conn.reply(
      m.chat,
`*💼 𝐒𝐚𝐥𝐝𝐨 𝐚𝐭𝐭𝐮𝐚𝐥𝐞*

*💸 𝐃𝐞𝐧𝐚𝐫𝐨:* *${formatNumber(user.euro)}€*
*⭐ 𝐄𝐗𝐏:* *${formatNumber(user.exp)}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )

  } catch (e) {
    console.error(e)

    return conn.reply(
      m.chat,
      '*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐠𝐞𝐧𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐝𝐞𝐥𝐥𝐚 𝐬𝐥𝐨𝐭.*',
      m
    )
  }
}

handler.help = ['slot']
handler.tags = ['game']
handler.command = ['slot']

export default handler

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num)
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}