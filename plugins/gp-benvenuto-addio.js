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
  const cleanUserId = m.sender.split('@')[0]

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
      mentions: [m.sender]
    },
    { quoted: m }
  )
}

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return false

  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat || (!chat.welcome && !chat.goodbye)) return false

  const isAdd = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
  const isRemove = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE

  if (!isAdd && !isRemove) return false

  const who = m.messageStubParameters?.[0]
  if (!who) return false

  const jid = conn.decodeJid(who)
  const cleanUserId = jid.split('@')[0]

  let metadata = groupMetadata
  if (!metadata) {
    try {
      metadata = await conn.groupMetadata(m.chat)
    } catch {}
  }

  const groupName = metadata?.subject || 'Gruppo'

  let text = ''

  if (isRemove && chat.goodbye) {
    text = `@${cleanUserId} 𝐡𝐚 𝐚𝐛𝐛𝐚𝐧𝐝𝐨𝐧𝐚𝐭𝐨 𝐢𝐥 𝐠𝐫𝐮𝐩𝐩𝐨`
  }

  if (isAdd && chat.welcome) {
    text = `@${cleanUserId} 𝐁𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨 𝐬𝐮 ${groupName}`
  }

  if (!text) return false

  await conn.sendMessage(
    m.chat,
    {
      text,
      mentions: [jid]
    },
    { quoted: m }
  )

  return true
}

handler.help = ['testwelcome', 'testaddio']
handler.tags = ['group']
handler.command = /^(testwelcome|testaddio)$/i
handler.admin = true
handler.group = true

export default handler