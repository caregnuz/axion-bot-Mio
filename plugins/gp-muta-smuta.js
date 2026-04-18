// Plugin muta by Bonzino e 𝕯𝖊ⱥ𝖉𝖑𝐲

const tag = (jid = '') => '@' + String(jid).split('@')[0].split(':')[0]

function resolveTarget(m, text = '') {
  const ctx = m.message?.extendedTextMessage?.contextInfo || {}

  if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) return m.mentionedJid[0]
  if (Array.isArray(ctx.mentionedJid) && ctx.mentionedJid.length) return ctx.mentionedJid[0]

  if (m.quoted?.sender) return m.quoted.sender
  if (m.quoted?.participant) return m.quoted.participant
  if (ctx.participant) return ctx.participant

  const numero = String(text || '').replace(/[^\d]/g, '')
  if (numero.length >= 8 && numero.length <= 15) return `${numero}@s.whatsapp.net`

  if (String(text || '').endsWith('@s.whatsapp.net') || String(text || '').endsWith('@c.us')) {
    return String(text).trim()
  }

  return null
}

let handler = async (m, { conn, command, text, isAdmin }) => {
  const chatId = m.chat
  if (!chatId) return

  const BOT_OWNERS = (global.owner || []).map(o => o[0] + '@s.whatsapp.net')
  const mentionedJid = resolveTarget(m, text)
  const botNumber = conn.user?.jid || conn.user?.id || ''

  let groupOwner = null
  try {
    const metadata = await conn.groupMetadata(chatId)
    groupOwner = metadata.owner
  } catch {
    groupOwner = null
  }

  if (!isAdmin) {
    throw `*╭━━━❌━━━╮*
*𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎*
*╰━━━❌━━━╯*

*𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*`
  }

  if (!mentionedJid) {
    return conn.sendMessage(chatId, {
      text: `*╭━━━⚠️━━━╮*
*𝐔𝐓𝐄𝐍𝐓𝐄 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎*
*╰━━━⚠️━━━╯*

*𝐓𝐚𝐠𝐠𝐚 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 𝐝𝐚 ${command === 'muta' ? '𝐦𝐮𝐭𝐚𝐫𝐞 🔇' : '𝐬𝐦𝐮𝐭𝐚𝐫𝐞 🔊'}*`,
      contextInfo: global.rcanal?.contextInfo || {}
    }, { quoted: m })
  }

  if ([groupOwner, botNumber, ...BOT_OWNERS].includes(mentionedJid)) {
    throw `*╭━━━👑━━━╮*
*𝐏𝐑𝐎𝐓𝐄𝐓𝐓𝐎*
*╰━━━👑━━━╯*

*𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 ${command === 'muta' ? '𝐦𝐮𝐭𝐚𝐫𝐞' : '𝐬𝐦𝐮𝐭𝐚𝐫𝐞'} 𝐪𝐮𝐞𝐬𝐭𝐨 𝐮𝐭𝐞𝐧𝐭𝐞 𝐩𝐞𝐫𝐜𝐡𝐞́ è 𝐩𝐫𝐨𝐭𝐞𝐭𝐭𝐨.*`
  }

  if (!global.db.data.users[mentionedJid]) global.db.data.users[mentionedJid] = {}
  const user = global.db.data.users[mentionedJid]
  const isMute = command === 'muta'

  if (isMute) {
    if (user.muto) {
      throw `*⚠️ 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢𝐚̀ 𝐦𝐮𝐭𝐚𝐭𝐨.*`
    }

    user.muto = true

    return conn.sendMessage(chatId, {
      text: `*╭━━━━━━━🔇━━━━━━━╮*
*✦ 𝐌𝐔𝐓𝐄 𝐀𝐓𝐓𝐈𝐕𝐀𝐓𝐎 ✦*
*╰━━━━━━━🔇━━━━━━━╯*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag(mentionedJid)}
*🔇 𝐒𝐭𝐚𝐭𝐨:* *𝐌𝐮𝐭𝐚𝐭𝐨*
*🗑 𝐀𝐳𝐢𝐨𝐧𝐞:* *𝐈 𝐬𝐮𝐨𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐯𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢.*`,
      contextInfo: {
        ...(global.rcanal?.contextInfo || {}),
        mentionedJid: [mentionedJid]
      },
      mentions: [mentionedJid]
    }, { quoted: m })
  }

  if (!user.muto) {
    throw `*⚠️ 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 è 𝐦𝐮𝐭𝐚𝐭𝐨.*`
  }

  user.muto = false

  return conn.sendMessage(chatId, {
    text: `*╭━━━━━━━🔊━━━━━━━╮*
*✦ 𝐌𝐔𝐓𝐄 𝐑𝐈𝐌𝐎𝐒𝐒𝐎 ✦*
*╰━━━━━━━🔊━━━━━━━╯*

*👤 𝐔𝐭𝐞𝐧𝐭𝐞:* ${tag(mentionedJid)}
*🔊 𝐒𝐭𝐚𝐭𝐨:* *𝐒𝐦𝐮𝐭𝐚𝐭𝐨*`,
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      mentionedJid: [mentionedJid]
    },
    mentions: [mentionedJid]
  }, { quoted: m })
}

handler.before = async function (m, { conn, isBotAdmin }) {
  if (!m.chat || !m.sender || !global.db.data.users[m.sender]) return

  const user = global.db.data.users[m.sender]

  if (user.muto) {
    if (!isBotAdmin) return
    await conn.sendMessage(m.chat, { delete: m.key })
    return false
  }
}

handler.command = /^(muta|smuta)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler