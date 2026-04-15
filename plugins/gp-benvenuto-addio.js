import { WAMessageStubType } from '@realvare/baileys'

let handler = async (m, { conn, command, groupMetadata }) => {
  if (!m.isGroup) return

  let metadata = groupMetadata
  if (!metadata) {
    try {
      metadata = await conn.groupMetadata(m.chat)
    } catch {}
  }

  const groupName = metadata?.subject || 'Gruppo'
  const jid = conn.decodeJid(m.sender)
  const cleanUserId = jid.split('@')[0]

  let text = ''

  if (/^testwelcome$/i.test(command)) {
    text = `@${cleanUserId} 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐬𝐮 ${groupName}`
  }

  if (/^testaddio$/i.test(command)) {
    text = `@${cleanUserId} 𝐡𝐚 𝐚𝐛𝐛𝐚𝐧𝐝𝐨𝐧𝐚𝐭𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨`
  }

  if (!text) return

  await conn.sendMessage(
    m.chat,
    {
      text,
      mentions: [jid]
    },
    { quoted: m }
  )
}

handler.help = ['testwelcome', 'testaddio']
handler.tags = ['group']
handler.command = /^(testwelcome|testaddio)$/i
handler.admin = true
handler.group = true

handler.participantsUpdate = async function ({ id, participants, action }) {
  const conn = this
  const chat = global.db?.data?.chats?.[id]
  if (!chat || (!chat.welcome && !chat.goodbye)) return

  let metadata
  try {
    metadata = await conn.groupMetadata(id)
  } catch {}

  const groupName = metadata?.subject || 'Gruppo'

  for (const who of participants || []) {
    const jid = conn.decodeJid(who)
    const cleanUserId = jid.split('@')[0]

    if (action === 'add' && chat.welcome) {
      await conn.sendMessage(id, {
        text: `@${cleanUserId} 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐬𝐮 ${groupName}`,
        mentions: [jid]
      })
    }

    if ((action === 'remove' || action === 'leave') && chat.goodbye) {
      await conn.sendMessage(id, {
        text: `@${cleanUserId} 𝐡𝐚 𝐚𝐛𝐛𝐚𝐧𝐝𝐨𝐧𝐚𝐭𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨`,
        mentions: [jid]
      })
    }
  }
}

export default handler