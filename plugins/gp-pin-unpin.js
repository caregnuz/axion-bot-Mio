//by Bonzino

import { Buffer } from 'buffer'

const DURATE = {
  '24h': 86400,
  '7d': 604800,
  '30d': 2592000,
}

function getKey(q, chat, conn) {
  if (!q) return null

  if (q.key) {
    return {
      id: q.key.id,
      fromMe: q.key.fromMe || false,
      remoteJid: conn.decodeJid(q.key.remoteJid || chat)
    }
  }

  if (q.id) {
    return {
      id: q.id,
      fromMe: q.fromMe || false,
      remoteJid: conn.decodeJid(chat)
    }
  }

  return null
}

let handler = async (m, { conn, args, command }) => {
  command = command.toLowerCase()

  const isUnpin = ['unpin', 'defissa'].includes(command)
  const isUnpinAll = ['unpinall', 'defissatutti'].includes(command)
  const isFinalPin = command === 'pinfinal'
  const isPin = !isUnpin && !isUnpinAll && !isFinalPin

  if (isUnpinAll) {
    try {
      await conn.sendMessage(m.chat, { pin: { type: 3 } })
      return m.reply('*✅ 𝐓𝐮𝐭𝐭𝐢 𝐢 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐬𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐝𝐞𝐟𝐢𝐬𝐬𝐚𝐭𝐢.*')
    } catch (e) {
      console.error('unpinall error:', e)
      return m.reply(global.errore)
    }
  }

  if (isUnpin) {
    if (!m.quoted) {
      return m.reply('*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚𝐥 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐚 𝐝𝐞𝐟𝐢𝐬𝐬𝐚𝐫𝐞.*')
    }

    const key = getKey(m.quoted, m.chat, conn)
    if (!key) return m.reply(global.errore)

    try {
      await conn.sendMessage(m.chat, {
        pin: {
          type: 2,
          key
        }
      })

      return m.reply('*✅ 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐝𝐞𝐟𝐢𝐬𝐬𝐚𝐭𝐨.*')
    } catch (e) {
      console.error('unpin error:', e, key)
      return m.reply(global.errore)
    }
  }

  if (isFinalPin) {
    const [secondsRaw, base64Key] = args
    const seconds = parseInt(secondsRaw)

    let key
    try {
      if (isNaN(seconds)) throw 0
      const keyString = Buffer.from(base64Key, 'base64').toString('utf8')
      key = JSON.parse(keyString)
      if (!key || !key.id) throw 0
    } catch {
      return m.reply(global.errore)
    }

    try {
      await conn.sendMessage(m.chat, { pin: { type: 1, time: seconds, key } })
      const label = Object.entries(DURATE).find(([, s]) => s === seconds)?.[0] || `${seconds}s`
      return m.reply(`*📌 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐟𝐢𝐬𝐬𝐚𝐭𝐨 𝐩𝐞𝐫 ${label}.*`)
    } catch (e) {
      console.error('pinfinal error:', e)
      return m.reply(global.errore)
    }
  }

  if (isPin) {
    const text = args.join(' ')

    if (m.quoted && !text) {
      const key = getKey(m.quoted, m.chat, conn)
      if (!key) return m.reply(global.errore)
      return inviaBottoni(conn, m.chat, key)
    }

    if (text) {
      try {
        const sent = await conn.sendMessage(m.chat, { text }, { quoted: m })
        return inviaBottoni(conn, m.chat, {
          id: sent.key.id,
          fromMe: sent.key.fromMe || false,
          remoteJid: conn.decodeJid(sent.key.remoteJid || m.chat)
        })
      } catch (e) {
        console.error('pin send error:', e)
        return m.reply(global.errore)
      }
    }

    return m.reply('*⚠️ 𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐦𝐞𝐬𝐬𝐚𝐠𝐠𝐢𝐨 𝐨 𝐬𝐜𝐫𝐢𝐯𝐢 𝐮𝐧 𝐭𝐞𝐬𝐭𝐨.*')
  }
}

async function inviaBottoni(conn, chat, key) {
  const base64Key = Buffer.from(JSON.stringify(key)).toString('base64')

  const buttons = Object.entries(DURATE).map(([label, seconds]) => ({
    buttonId: `.pinfinal ${seconds} ${base64Key}`,
    buttonText: { displayText: `⏱️ ${label}` },
    type: 1
  }))

  await conn.sendMessage(chat, {
    text: '*📌 𝐒𝐜𝐞𝐠𝐥𝐢 𝐥𝐚 𝐝𝐮𝐫𝐚𝐭𝐚 𝐝𝐞𝐥 𝐩𝐢𝐧:*',
    buttons,
    footer: '',
    headerType: 1,
  })
}

handler.command = ['pin', 'pinna', 'fissa', 'fissamsg', 'unpin', 'defissa', 'unpinall', 'defissatutti', 'pinfinal']
handler.tags = ['gruppo']
handler.help = ['pin', 'unpin/unpinall']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler