const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var handler = async (m, { conn, text, command, isOwner, usedPrefix }) => {
  if (!isOwner) return

  let groups = Object.values(
    await conn.groupFetchAllParticipating()
  )

  if (command === 'gruppi') {

    if (!groups.length) {
      return conn.reply(m.chat,
`*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐠𝐫𝐮𝐩𝐩𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`, m)
    }

    let txt =
`*╭━━━━━━━🏢━━━━━━━╮*
*✦ 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐆𝐑𝐔𝐏𝐏𝐈 ✦*
*╰━━━━━━━🏢━━━━━━━╯*

*⚠️ 𝐔𝐬𝐚:*
*${usedPrefix}esci numero si/no*

*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix}esci 2 si*

*📢 "si" = 𝐢𝐧𝐯𝐢𝐚 5 𝐭𝐚𝐠 𝐠𝐥𝐨𝐛𝐚𝐥𝐢 𝐞 𝐩𝐨𝐢 𝐞𝐬𝐜𝐞.*\n`

    groups.forEach((g, i) => {
      txt += `\n*${i + 1}.* *${g.subject}*`
      txt += `\n*👥 𝐌𝐞𝐦𝐛𝐫𝐢:* *${g.participants.length}*\n`
    })

    txt += `\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

    return conn.reply(m.chat, txt, m)
  }

  if (command === 'esci') {

    let [num, spam] = text.split(' ')
    let index = parseInt(num) - 1

    if (!num || isNaN(index) || !groups[index]) {
      return conn.reply(m.chat,
`*⚠️ 𝐅𝐨𝐫𝐦𝐚𝐭𝐨 𝐞𝐫𝐫𝐚𝐭𝐨.*

*𝐔𝐬𝐚:*
*${usedPrefix}esci numero si/no*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`, m)
    }

    let targetGroup = groups[index]
    let participants = targetGroup.participants.map(u => u.id)

    try {

      if (spam === 'si') {

        for (let i = 0; i < 5; i++) {

          await conn.sendMessage(targetGroup.id, {
            text:
`*╭━━━━━━━📢━━━━━━━╮*
*✦ 𝐍𝐎𝐓𝐈𝐅𝐈𝐂𝐀 𝐃𝐈 𝐔𝐒𝐂𝐈𝐓𝐀 ✦*
*╰━━━━━━━📢━━━━━━━╯*

*📣 𝐄𝐧𝐭𝐫𝐚𝐭𝐞 𝐧𝐞𝐥 𝐜𝐚𝐧𝐚𝐥𝐞 𝐮𝐟𝐟𝐢𝐜𝐢𝐚𝐥𝐞:*

https://whatsapp.com/channel/0029Vb8MQ3U1CYoMEtU1832d

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
            mentions: participants
          })

          await delay(500)
        }
      }

      await conn.reply(targetGroup.id,
`*👋 𝐀𝐝𝐝𝐢𝐨 𝐬𝐟𝐢𝐠𝐚𝐭𝐢!*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`)

      await conn.groupLeave(targetGroup.id)

      return conn.reply(m.chat,
`*✅ 𝐈𝐥 𝐛𝐨𝐭 𝐡𝐚 𝐚𝐛𝐛𝐚𝐧𝐝𝐨𝐧𝐚𝐭𝐨:*

*🏢 ${targetGroup.subject}*

*📢 𝐒𝐩𝐚𝐦:* *${String(spam || 'no').toUpperCase()}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`, m)

    } catch (e) {

      console.error(e)

      return conn.reply(m.chat,
`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥’𝐨𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`, m)
    }
  }
}

handler.command = ['gruppi', 'esci']
handler.owner = true

export default handler