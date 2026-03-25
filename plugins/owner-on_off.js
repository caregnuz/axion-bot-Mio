// plugin by Bonzino

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function editMessage(conn, chatId, key, text) {
  await conn.relayMessage(
    chatId,
    {
      protocolMessage: {
        key,
        type: 14,
        editedMessage: {
          extendedTextMessage: {
            text
          }
        }
      }
    },
    {}
  )
}

let handler = async (m, { conn, command }) => {
  global.db.data.settings = global.db.data.settings || {}

  const chatId = m.chat
  if (!chatId) return

  if (command === 'off') {
    const sent = await conn.sendMessage(
      chatId,
      {
        text: `╭━━━━━━━🛑━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━🛑━━━━━━━╯

⏳ 𝐒𝐩𝐞𝐠𝐧𝐢𝐦𝐞𝐧𝐭𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.`
      },
      { quoted: m }
    )

    const key = sent?.key
    if (!key) return

    const frames = [
      `╭━━━━━━━🛑━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━🛑━━━━━━━╯

⏳ 𝐒𝐩𝐞𝐠𝐧𝐢𝐦𝐞𝐧𝐭𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.`,
      `╭━━━━━━━🛑━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━🛑━━━━━━━╯

⏳ 𝐒𝐩𝐞𝐠𝐧𝐢𝐦𝐞𝐧𝐭𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨..`,
      `╭━━━━━━━🛑━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━🛑━━━━━━━╯

⏳ 𝐒𝐩𝐞𝐠𝐧𝐢𝐦𝐞𝐧𝐭𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...`
    ]

    for (const frame of frames) {
      await editMessage(conn, chatId, key, frame)
      await sleep(700)
    }

    global.db.data.settings.botOff = true

    await editMessage(
      conn,
      chatId,
      key,
      `╭━━━━━━━🛑━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━🛑━━━━━━━╯

🛑 𝐎𝐟𝐟𝐥𝐢𝐧𝐞`
    )

    return
  }

  if (command === 'on') {
    const sent = await conn.sendMessage(
      chatId,
      {
        text: `╭━━━━━━━⚡━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━⚡━━━━━━━╯

⏳ 𝐀𝐯𝐯𝐢𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.`
      },
      { quoted: m }
    )

    const key = sent?.key
    if (!key) return

    const frames = [
      `╭━━━━━━━⚡━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━⚡━━━━━━━╯

⏳ 𝐀𝐯𝐯𝐢𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.`,
      `╭━━━━━━━⚡━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━⚡━━━━━━━╯

⏳ 𝐀𝐯𝐯𝐢𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨..`,
      `╭━━━━━━━⚡━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━⚡━━━━━━━╯

⏳ 𝐀𝐯𝐯𝐢𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...`
    ]

    for (const frame of frames) {
      await editMessage(conn, chatId, key, frame)
      await sleep(700)
    }

    global.db.data.settings.botOff = false

    await editMessage(
      conn,
      chatId,
      key,
      `╭━━━━━━━⚡━━━━━━━╮
✦ 𝐒𝐈𝐒𝐓𝐄𝐌𝐀 ✦
╰━━━━━━━⚡━━━━━━━╯

✅ 𝐎𝐧𝐥𝐢𝐧𝐞`
    )

    return
  }
}

handler.help = ['off', 'on']
handler.tags = ['owner']
handler.command = /^(off|on)$/i
handler.owner = true

export default handler