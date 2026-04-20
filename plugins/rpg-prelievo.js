// Plugin Prelievo by Bonzino

 let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}

  const user = global.db.data.users[m.sender]

  if (typeof user.euro !== 'number') user.euro = 0
  if (typeof user.bank !== 'number') user.bank = 0

  global.db.data.withdrawConfirm = global.db.data.withdrawConfirm || {}

  const box = (emoji, title, body) => `╭━━━━━━━${emoji}━━━━━━━╮
*✦ ${title} ✦*
╰━━━━━━━${emoji}━━━━━━━╯

${body}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  if (!args[0]) {
    return m.reply(
      box(
        '🏦',
        '𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',
        `*🚩 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐥𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐝𝐚 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞*
*📌 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:* *${usedPrefix + command} 500*
*📌 𝐏𝐞𝐫 𝐭𝐮𝐭𝐭𝐨:* *${usedPrefix + command} all*`
      )
    )
  }

  const input = args[0].toLowerCase()
  let count

  if (['all', 'tutto'].includes(input)) {
    count = user.bank

    if (count <= 0) {
      return m.reply(
        box(
          '🚩',
          '𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',
          `*🏦 𝐍𝐨𝐧 𝐡𝐚𝐢 𝐚𝐛𝐛𝐚𝐬𝐭𝐚𝐧𝐳𝐚 𝐝𝐞𝐧𝐚𝐫𝐨 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚*`
        )
      )
    }
  } else {
    if (!/^\d+$/.test(args[0])) {
      return m.reply(
        box(
          '🚩',
          '𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',
          `*🔢 𝐋𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐝𝐞𝐯𝐞 𝐞𝐬𝐬𝐞𝐫𝐞 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐯𝐚𝐥𝐢𝐝𝐨*`
        )
      )
    }

    count = parseInt(args[0])

    if (count < 1) {
      return m.reply(
        box(
          '🚩',
          '𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',
          `*💸 𝐋𝐚 𝐪𝐮𝐚𝐧𝐭𝐢𝐭à 𝐦𝐢𝐧𝐢𝐦𝐚 è 𝟏*`
        )
      )
    }

    if (count > user.bank) {
      return m.reply(
        box(
          '🚩',
          '𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',
          `*🏦 𝐇𝐚𝐢 𝐬𝐨𝐥𝐨 ${formatNumber(user.bank)} 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚*`
        )
      )
    }
  }

  global.db.data.withdrawConfirm[m.sender] = {
    amount: count,
    createdAt: Date.now()
  }

  return conn.sendMessage(m.chat, {
    text: box(
      '🏧',
      '𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎',
      `*💸 𝐒𝐭𝐚𝐢 𝐩𝐞𝐫 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐫𝐞:* ${formatNumber(count)}

*🏛️ 𝐁𝐚𝐧𝐜𝐚 𝐀𝐭𝐭𝐮𝐚𝐥𝐞:* ${formatNumber(user.bank)}
*💼 𝐏𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨 𝐀𝐭𝐭𝐮𝐚𝐥𝐞:* ${formatNumber(user.euro)}

*𝐒𝐜𝐞𝐠𝐥𝐢 𝐮𝐧’𝐨𝐩𝐳𝐢𝐨𝐧𝐞 𝐪𝐮𝐢 𝐬𝐨𝐭𝐭𝐨:*`
    ),
    footer: '',
    buttons: [
      {
        buttonId: '.confermaprelievo',
        buttonText: { displayText: '✅ Conferma' },
        type: 1
      },
      {
        buttonId: '.annullaprelievo',
        buttonText: { displayText: '❌ Annulla' },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: m })
}

handler.before = async (m) => {
  global.db.data.withdrawConfirm = global.db.data.withdrawConfirm || {}

  const pending = global.db.data.withdrawConfirm[m.sender]
  if (!pending) return

  const text = (m.text || '').toLowerCase().trim()
  const msg = m.message || {}

  const buttonId =
    msg.buttonsResponseMessage?.selectedButtonId ||
    msg.templateButtonReplyMessage?.selectedId ||
    ''

  const action = ['.confermaprelievo', 'conferma'].includes(text) || buttonId === '.confermaprelievo'
    ? 'confirm'
    : ['.annullaprelievo', 'annulla'].includes(text) || buttonId === '.annullaprelievo'
      ? 'cancel'
      : null

  if (!action) return

  const user = global.db.data.users[m.sender]

  if (action === 'cancel') {
    delete global.db.data.withdrawConfirm[m.sender]

    return m.reply(`╭━━━━━━━❌━━━━━━━╮
*✦ 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 𝐀𝐍𝐍𝐔𝐋𝐋𝐀𝐓𝐎 ✦*
╰━━━━━━━❌━━━━━━━╯

*🚫 𝐋’𝐨𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 è 𝐬𝐭𝐚𝐭𝐚 𝐚𝐧𝐧𝐮𝐥𝐥𝐚𝐭𝐚*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)
  }

  const count = pending.amount

  if (user.bank < count) {
    delete global.db.data.withdrawConfirm[m.sender]

    return m.reply(`╭━━━━━━━🚩━━━━━━━╮
*✦ 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 ✦*
╰━━━━━━━🚩━━━━━━━╯

*🏦 𝐈𝐥 𝐬𝐚𝐥𝐝𝐨 𝐢𝐧 𝐛𝐚𝐧𝐜𝐚 è 𝐜𝐚𝐦𝐛𝐢𝐚𝐭𝐨, 𝐫𝐢𝐩𝐫𝐨𝐯𝐚*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)
  }

  user.bank -= count
  user.euro += count

  delete global.db.data.withdrawConfirm[m.sender]

  return m.reply(`╭━━━━━━━💸━━━━━━━╮
*✦ 𝐏𝐑𝐄𝐋𝐈𝐄𝐕𝐎 𝐄𝐅𝐅𝐄𝐓𝐓𝐔𝐀𝐓𝐎 ✦*
╰━━━━━━━💸━━━━━━━╯

*💸 𝐇𝐚𝐢 𝐩𝐫𝐞𝐥𝐞𝐯𝐚𝐭𝐨:* ${formatNumber(count)}

*💼 𝐏𝐨𝐫𝐭𝐚𝐟𝐨𝐠𝐥𝐢𝐨:* ${formatNumber(user.euro)}
*🏛️ 𝐁𝐚𝐧𝐜𝐚:* ${formatNumber(user.bank)}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)
}

handler.help = ['prelievo <numero|all>']
handler.tags = ['economy', 'rpg']
handler.command = ['prelievo', 'preleva', 'with', 'w']

export default handler

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num)
}