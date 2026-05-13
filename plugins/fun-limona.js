const tag = (jid = '') => '@' + String(jid).split('@')[0].split(':')[0]

function buildContextMsg(title) {
  return {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: 'CTX'
    },
    message: {
      locationMessage: {
        name: title
      }
    },
    participant: '0@s.whatsapp.net'
  }
}

function resolveTarget(m, text = '', botJid = '') {
  const ctx = m.message?.extendedTextMessage?.contextInfo || {}

  const numero = String(text || '').replace(/[^\d]/g, '')
  if (numero.length >= 5) return `${numero}@s.whatsapp.net`

  if (
    String(text || '').endsWith('@s.whatsapp.net') ||
    String(text || '').endsWith('@c.us')
  ) {
    return String(text).trim()
  }

  if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) {
    return m.mentionedJid[0]
  }

  if (Array.isArray(ctx.mentionedJid) && ctx.mentionedJid.length) {
    return ctx.mentionedJid[0]
  }

  const quotedSender =
    m.quoted?.sender ||
    m.quoted?.participant ||
    ctx.participant

  if (quotedSender && quotedSender !== botJid) {
    return quotedSender
  }

  return null
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const chat = m.chat || m.key?.remoteJid
  if (!chat) return

  global.db.data.limona || (global.db.data.limona = {})

  const sender = String(
    m.sender ||
    m.key?.participant ||
    m.participant ||
    (m.key?.fromMe ? conn?.user?.id : '')
  )

  const botJid = conn.user?.jid || conn.user?.id || ''
  const target = resolveTarget(m, text, botJid)

  const q = buildContextMsg('*𝐋𝐈𝐌𝐎𝐍𝐀*')

  if (!target) {
    return conn.sendMessage(chat, {
      text:
`*⚠️ 𝐃𝐞𝐯𝐢 𝐦𝐞𝐧𝐳𝐢𝐨𝐧𝐚𝐫𝐞 𝐪𝐮𝐚𝐥𝐜𝐮𝐧𝐨 𝐨 𝐫𝐢𝐬𝐩𝐨𝐧𝐝𝐞𝐫𝐞 𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐩𝐞𝐫 𝐥𝐢𝐦𝐨𝐧𝐚𝐫𝐥𝐨 🍋*

*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix}${command} @utente*`,
      contextInfo: global.rcanal?.contextInfo || {}
    }, { quoted: q })
  }

  if (target === sender) {
    return conn.sendMessage(chat, {
      text: `🥵💋 ${tag(sender)} *𝐬𝐢 è 𝐥𝐢𝐦𝐨𝐧𝐚𝐭𝐨 𝐝𝐚 𝐬𝐨𝐥𝐨 😳*`,
      contextInfo: {
        ...(global.rcanal?.contextInfo || {}),
        mentionedJid: [sender]
      },
      mentions: [sender]
    }, { quoted: q })
  }

  const previousLimone = global.db.data.limona[sender]

  if (previousLimone && previousLimone !== target) {
    return conn.sendMessage(chat, {
      text: `*⚠️ 𝐏𝐮𝐨𝐢 𝐫𝐢𝐜𝐚𝐦𝐛𝐢𝐚𝐫𝐞 𝐢𝐥 𝐥𝐢𝐦𝐨𝐧𝐞 𝐬𝐨𝐥𝐨 𝐚 𝐜𝐡𝐢 𝐭𝐢 𝐡𝐚 𝐥𝐢𝐦𝐨𝐧𝐚𝐭𝐨*`,
      contextInfo: global.rcanal?.contextInfo || {}
    }, { quoted: q })
  }

  global.db.data.limona[target] = sender

  const senderNumero = String(sender)
    .split('@')[0]
    .split(':')[0]

  await conn.sendMessage(chat, {
    text: `🥵 ${tag(sender)} *𝐡𝐚 𝐥𝐢𝐦𝐨𝐧𝐚𝐭𝐨 ${tag(target)} 🍋*`,
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      mentionedJid: [sender, target]
    },
    mentions: [sender, target],
    buttons: [
      {
        buttonId: `${usedPrefix}${command} ${senderNumero}`,
        buttonText: {
          displayText: '💋 Ricambia il limone'
        },
        type: 1
      }
    ],
    headerType: 1
  }, { quoted: q })
}

handler.help = ['limona @user']
handler.tags = ['fun']
handler.command = ['limona', 'limone']
handler.group = true

export default handler