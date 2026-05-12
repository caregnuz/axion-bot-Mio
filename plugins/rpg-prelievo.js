//plugin "rpg-prelievo" by Bonzino

global.db.data.prelievoSessioni ??= {}

const footer = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

const box = (emoji, title, body, showFooter = true) => `╭━━━━━━━${emoji}━━━━━━━╮
*✦ ${title} ✦*
╰━━━━━━━${emoji}━━━━━━━╯

${body}${showFooter ? `

> *${footer}*` : ''}`

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num || 0)
}

function getQuotedId(m) {
  return (
    m.quoted?.id ||
    m.quoted?.key?.id ||
    m.message?.extendedTextMessage?.contextInfo?.stanzaId ||
    null
  )
}

let handler = async (m, { conn, args, command }) => {
  global.db.data.users[m.sender] ??= {}

  const cmd = String(command || '').toLowerCase()

  if (cmd === 'confermaprelievo') {
    return confermaPrelievo(m)
  }

  if (cmd === 'annullaprelievo') {
    return annullaPrelievo(m)
  }

  const user = global.db.data.users[m.sender]

  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.bank !== 'number') user.bank = 0

  if (args[0]) {
    return preparaPrelievo(m, conn, args.join(' '))
  }

  const sent = await conn.sendMessage(
    m.chat,
    {
      text: box(
        '🏧',
        '𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',
        `*💸 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐥𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐝𝐚 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞.*

*📌 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐪𝐮𝐞𝐬𝐭𝐨 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨.*

*📌 𝐏𝐮𝐨𝐢 𝐬𝐜𝐫𝐢𝐯𝐞𝐫𝐞:*
*all*
*tutto*
*metà*
*50%*
*100*`
      )
    },
    { quoted: m }
  )

  global.db.data.prelievoSessioni[`${m.chat}|${sent.key.id}`] = {
    owner: m.sender,
    createdAt: Date.now()
  }
}

handler.before = async function (m, { conn }) {
  if (!m.text) return false

  global.db.data.prelievoSessioni ??= {}

  const quotedId = getQuotedId(m)
  if (!quotedId) return false

  const key = `${m.chat}|${quotedId}`
  const sessione = global.db.data.prelievoSessioni[key]

  if (!sessione) return false

  if (sessione.owner !== m.sender) {
    await m.reply(
      box(
        '🚫',
        '𝐒𝐄𝐒𝐒𝐈𝐎𝐍𝐄 𝐍𝐎𝐍 𝐓𝐔𝐀',
        `*❌ 𝐐𝐮𝐞𝐬𝐭𝐚 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 𝐚𝐩𝐩𝐚𝐫𝐭𝐢𝐞𝐧𝐞 𝐚 𝐭𝐞.*`
      )
    )

    return true
  }

  if (Date.now() - sessione.createdAt > 60000) {
    delete global.db.data.prelievoSessioni[key]

    await m.reply(
      box(
        '⏳',
        '𝐒𝐄𝐒𝐒𝐈𝐎𝐍𝐄 𝐒𝐂𝐀𝐃𝐔𝐓𝐀',
        `*⌛ 𝐋𝐚 𝐬𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐝𝐢 𝐩𝐫𝐞𝐥𝐢𝐞𝐯𝐨 è 𝐬𝐜𝐚𝐝𝐮𝐭𝐚.*

*📌 𝐑𝐢𝐚𝐩𝐫𝐢 𝐢𝐥 𝐩𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨 𝐞 𝐫𝐢𝐩𝐫𝐨𝐯𝐚.*`
      )
    )

    return true
  }

  delete global.db.data.prelievoSessioni[key]

  await preparaPrelievo(
    m,
    conn,
    m.text.trim()
  )

  return true
}

handler.command = /^(preleva|prelievo|confermaprelievo|annullaprelievo)$/i
handler.help = ['preleva']
handler.tags = ['economia']

export default handler

async function preparaPrelievo(m, conn, input) {
  global.db.data.users[m.sender] ??= {}

  const user = global.db.data.users[m.sender]

  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.bank !== 'number') user.bank = 0

  const amount = parseAmount(input, user.bank)

  if (!amount.valid) {
    return m.reply(
      box(
        '❌',
        '𝐐𝐔𝐀𝐍𝐓𝐈𝐓À 𝐍𝐎𝐍 𝐕𝐀𝐋𝐈𝐃𝐀',
        amount.message
      )
    )
  }

  if (amount.value > user.bank) {
    return m.reply(
      box(
        '❌',
        '𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄',
        `*🏦 𝐇𝐚𝐢 𝐬𝐨𝐥𝐨 ${formatNumber(user.bank)} 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚.*`
      )
    )
  }

  user._prelievoPending = {
    amount: amount.value,
    createdAt: Date.now()
  }

  const buttons = [
    {
      buttonId: '.confermaprelievo',
      buttonText: {
        displayText: '✅ Conferma'
      },
      type: 1
    },
    {
      buttonId: '.annullaprelievo',
      buttonText: {
        displayText: '❌ Annulla'
      },
      type: 1
    }
  ]

  await conn.sendMessage(
    m.chat,
    {
      text: box(
        '🏧',
        '𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',
        `*💸 𝐐𝐮𝐚𝐧𝐭𝐢𝐭à:* ${formatNumber(amount.value)}

*💼 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢:* ${formatNumber(user.euro + amount.value)}
*🏦 𝐓𝐨𝐭𝐚𝐥𝐞 𝐛𝐚𝐧𝐜𝐚:* ${formatNumber(user.bank - amount.value)}
*💰 𝐏𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨:* ${formatNumber(user.euro + user.bank)}

*📌 𝐂𝐨𝐧𝐟𝐞𝐫𝐦𝐢 𝐥’𝐨𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞?*`,
        false
      ),
      footer,
      buttons,
      headerType: 1
    },
    { quoted: m }
  )
}

async function confermaPrelievo(m) {
  const user = global.db.data.users[m.sender]

  if (!user?._prelievoPending) {
    return m.reply(
      box(
        '❌',
        '𝐍𝐄𝐒𝐒𝐔𝐍 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',
        `*📌 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐩𝐫𝐞𝐥𝐢𝐞𝐯𝐢 𝐢𝐧 𝐚𝐭𝐭𝐞𝐬𝐚.*`
      )
    )
  }

  if (Date.now() - user._prelievoPending.createdAt > 60000) {
    delete user._prelievoPending

    return m.reply(
      box(
        '⏳',
        '𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 𝐒𝐂𝐀𝐃𝐔𝐓𝐎',
        `*⌛ 𝐋𝐚 𝐜𝐨𝐧𝐟𝐞𝐫𝐦𝐚 è 𝐬𝐜𝐚𝐝𝐮𝐭𝐚.*`
      )
    )
  }

  const amount = user._prelievoPending.amount

  if (amount > user.bank) {
    delete user._prelievoPending

    return m.reply(
      box(
        '❌',
        '𝐒𝐀𝐋𝐃𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄',
        `*🏦 𝐈 𝐬𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚 𝐧𝐨𝐧 𝐬𝐨𝐧𝐨 𝐩𝐢ù 𝐬𝐮𝐟𝐟𝐢𝐜𝐢𝐞𝐧𝐭𝐢.*`
      )
    )
  }

  user.bank -= amount
  user.euro += amount

  delete user._prelievoPending

  return m.reply(
    box(
      '✅',
      '𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 𝐄𝐅𝐅𝐄𝐓𝐓𝐔𝐀𝐓𝐎',
      `*💸 𝐏𝐫𝐞𝐥𝐞𝐯𝐚𝐭𝐢:* ${formatNumber(amount)}

*💼 𝐂𝐨𝐧𝐭𝐚𝐧𝐭𝐢:* ${formatNumber(user.euro)}
*🏦 𝐓𝐨𝐭𝐚𝐥𝐞 𝐛𝐚𝐧𝐜𝐚:* ${formatNumber(user.bank)}
*💰 𝐏𝐚𝐭𝐫𝐢𝐦𝐨𝐧𝐢𝐨:* ${formatNumber(user.euro + user.bank)}`
    )
  )
}

async function annullaPrelievo(m) {
  const user = global.db.data.users[m.sender]

  if (user?._prelievoPending) {
    delete user._prelievoPending
  }

  return m.reply(
    box(
      '❌',
      '𝐎𝐏𝐄𝐑𝐀𝐙𝐈𝐎𝐍𝐄 𝐀𝐍𝐍𝐔𝐋𝐋𝐀𝐓𝐀',
      `*📌 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 è 𝐬𝐭𝐚𝐭𝐚 𝐞𝐟𝐟𝐞𝐭𝐭𝐮𝐚𝐭𝐚.*`
    )
  )
}

function parseAmount(input, max) {
  const valore = String(input || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/\./g, '')

  if (['all', 'tutto'].includes(valore)) {
    if (max <= 0) {
      return {
        valid: false,
        message: `*🏦 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐬𝐨𝐥𝐝𝐢 𝐝𝐚 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞.*`
      }
    }

    return {
      valid: true,
      value: max
    }
  }

  if (['meta', 'metà', '50%'].includes(valore)) {
    const metà = Math.floor(max / 2)

    if (metà <= 0) {
      return {
        valid: false,
        message: `*🏦 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐬𝐨𝐥𝐝𝐢 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚.*`
      }
    }

    return {
      valid: true,
      value: metà
    }
  }

  if (!/^\d+$/.test(valore)) {
    return {
      valid: false,
      message: `*🔢 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.*`
    }
  }

  const amount = parseInt(valore)

  if (amount <= 0) {
    return {
      valid: false,
      message: `*💸 𝐋𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐦𝐢𝐧𝐢𝐦𝐚 è 𝟏.*`
    }
  }

  return {
    valid: true,
    value: amount
  }
}