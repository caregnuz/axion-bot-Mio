// DebugPlugins by Bonzino

function truncate(text = '', max = 3500) {
  const str = String(text || '')
  return str.length > max ? str.slice(0, max) + '\n...' : str
}

let handler = async (m, { conn, args }) => {
  try {
    const debugId = args[0]

    if (!debugId) {
      return conn.reply(
        m.chat,
        '*❌ 𝐃𝐞𝐯𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞 𝐮𝐧 𝐈𝐃 𝐝𝐢 𝐝𝐞𝐛𝐮𝐠.*',
        m
      )
    }

    if (!global.pluginDebugErrors) {
      global.pluginDebugErrors = {}
    }

    const item = global.pluginDebugErrors[debugId]

    if (!item) {
      return conn.reply(
        m.chat,
        '*❌ 𝐃𝐞𝐛𝐮𝐠 𝐧𝐨𝐧 𝐭𝐫𝐨𝐯𝐚𝐭𝐨 𝐨 𝐬𝐜𝐚𝐝𝐮𝐭𝐨.*',
        m
      )
    }

    const fullMsg =
`🛠️ *𝐃𝐞𝐛𝐮𝐠 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐨*

*Titolo:* ${item.title || 'N/D'}
${item.extra ? `*Plugin:* ${item.extra}\n` : ''}*Messaggio:* ${item.message || 'N/D'}

\`\`\`
${truncate(item.stack || 'Nessuno stack disponibile', 3000)}
\`\`\``

    await conn.reply(m.chat, fullMsg, m)

  } catch (err) {
    await conn.reply(
      m.chat,
      `*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥 𝐝𝐞𝐛𝐮𝐠:*\n\n${err.message}`,
      m
    )
  }
}

handler.help = ['debugplugin <id>']
handler.tags = ['owner']
handler.command = /^(debugplugin|db)$/i
handler.owner = true

export default handler