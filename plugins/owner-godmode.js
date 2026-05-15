const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

async function getGroupId(conn, text) {
  const input = String(text || '').trim()

  if (!input) return null

  if (input.endsWith('@g.us')) return input

  if (/^\d{10,30}$/.test(input)) {
    return `${input}@g.us`
  }

  const inviteMatch =
    input.match(/chat\.whatsapp\.com\/([0-9A-Za-z]+)/i)

  const inviteCode = inviteMatch?.[1]

  if (inviteCode) {

    const info =
      await conn.groupGetInviteInfo(inviteCode)

    const id = info?.id || info?.jid

    if (!id) return null

    return id.endsWith('@g.us')
      ? id
      : `${id}@g.us`
  }

  return null
}

async function isBotAdmin(conn, groupId) {

  const metadata =
    await conn.groupMetadata(groupId)

  const botJid =
    conn.user.jid.split(':')[0] +
    '@s.whatsapp.net'

  const bot =
    metadata.participants.find(p =>
      p.id === botJid ||
      p.jid === botJid ||
      p.id === conn.user.jid ||
      p.jid === conn.user.jid
    )

  return Boolean(bot?.admin)
}

let handler = async (
  m,
  { conn, args, usedPrefix, command }
) => {

  const targetUser = m.sender

  const targetGroup = m.isGroup
    ? m.chat
    : await getGroupId(
        conn,
        args.join(' ')
      )

  if (!targetGroup) {
    return conn.sendMessage(m.chat, {
      text:
`*⚠️ 𝐈𝐧 𝐩𝐫𝐢𝐯𝐚𝐭𝐨 𝐝𝐞𝐯𝐢 𝐢𝐧𝐬𝐞𝐫𝐢𝐫𝐞 𝐢𝐥 𝐥𝐢𝐧𝐤 𝐨 𝐥'𝐈𝐃 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*

*📌 𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix + command} https://chat.whatsapp.com/xxxx*
*${usedPrefix + command} 120363xxxxxxxx@g.us*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    }, { quoted: m })
  }

  try {

    const botAdmin =
      await isBotAdmin(
        conn,
        targetGroup
      )

    if (!botAdmin) {
      return conn.sendMessage(m.chat, {
        text:
`*❌ 𝐈𝐥 𝐛𝐨𝐭 𝐧𝐨𝐧 è 𝐚𝐝𝐦𝐢𝐧 𝐢𝐧 𝐪𝐮𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
      }, { quoted: m })
    }

    const metadata =
      await conn.groupMetadata(targetGroup)

    const groupName =
      metadata.subject || 'Gruppo'

    await conn.groupParticipantsUpdate(
      targetGroup,
      [targetUser],
      'promote'
    )

    await sleep(500)

    const successText =
  targetGroup !== m.chat
    ? `*✅ 𝐎𝐫𝐚 𝐬𝐞𝐢 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐭𝐨 𝐃𝐢𝐨 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨:* ${groupName} 👑`
    : `*✅ 𝐎𝐫𝐚 𝐬𝐞𝐢 𝐝𝐢𝐯𝐞𝐧𝐭𝐚𝐭𝐨 𝐃𝐢𝐨 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨* 👑`

    return conn.sendMessage(m.chat, {
      text:
`${successText}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      mentions: [targetUser]
    }, { quoted: m })

  } catch (e) {

    console.error(
      '[GODMODE ERROR]',
      e
    )

    return conn.sendMessage(m.chat, {
      text:
`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥𝐚 𝐩𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞.*

*⚠️ 𝐀𝐬𝐬𝐢𝐜𝐮𝐫𝐚𝐭𝐢 𝐜𝐡𝐞:*
*• 𝐈𝐥 𝐛𝐨𝐭 𝐬𝐢𝐚 𝐚𝐝𝐦𝐢𝐧*
*• 𝐓𝐮 𝐬𝐢𝐚 𝐠𝐢à 𝐧𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨*
*• 𝐈𝐥 𝐥𝐢𝐧𝐤/𝐈𝐃 𝐬𝐢𝐚 𝐜𝐨𝐫𝐫𝐞𝐭𝐭𝐨*

*🧾 ${e.message || e}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    }, { quoted: m })
  }
}

handler.help = ['godmode']
handler.tags = ['owner']
handler.command = /^godmode$/i
handler.owner = true

export default handler