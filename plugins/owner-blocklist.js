// Plugin blocklist by Bonzino

const box = (title, desc) => `╭━━━━━━━🚫━━━━━━━╮
*✦ ${title} ✦*
╰━━━━━━━🚫━━━━━━━╯

${desc}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

function formatDate(ms) {
  if (!ms) return '𝐍/𝐃'

  try {
    return new Date(ms).toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return '𝐍/𝐃'
  }
}

let handler = async (m, { conn }) => {
  global.db.data.settings ??= {}
  global.db.data.settings.blockedUsers ??= {}

  const blockedUsers = global.db.data.settings.blockedUsers
  const entries = Object.entries(blockedUsers)

  if (!entries.length) {
    return m.reply(box(
      '𝐁𝐋𝐎𝐂𝐊𝐋𝐈𝐒𝐓',
      '*✅ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐨 𝐝𝐚𝐥 𝐛𝐨𝐭.*'
    ))
  }

  const mentions = []
  let text = `*🚫 𝐔𝐭𝐞𝐧𝐭𝐢 𝐛𝐥𝐨𝐜𝐜𝐚𝐭𝐢:* *${entries.length}*\n`

  entries.forEach(([jid, data], i) => {
    mentions.push(jid)

    const blockedBy = data?.blockedBy
    if (blockedBy) mentions.push(blockedBy)

    text += `\n*${i + 1}. @${jid.split('@')[0]}*`
    text += `\n*⏱️ 𝐃𝐚𝐭𝐚:* *${formatDate(data?.blockedAt)}*`

    if (blockedBy) {
      text += `\n*👑 𝐁𝐥𝐨𝐜𝐜𝐚𝐭𝐨 𝐝𝐚:* @${blockedBy.split('@')[0]}`
    }

    text += '\n'
  })

  return conn.sendMessage(m.chat, {
    text: box('𝐁𝐋𝐎𝐂𝐊𝐋𝐈𝐒𝐓', text),
    mentions
  }, { quoted: m })
}

handler.help = ['blocklist']
handler.tags = ['owner']
handler.command = /^(blocklist|listabloccati)$/i
handler.owner = true

export default handler