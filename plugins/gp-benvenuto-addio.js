// welcome/addio by Bonzino

import { WAMessageStubType } from '@realvare/baileys'

let handler = m => m

handler.before = async function (m, { conn, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return false

  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat || (!chat.welcome && !chat.goodbye)) return false

  const isAdd = m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD
  const isRemove =
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE ||
    m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE

  if (!isAdd && !isRemove) return false

  const who = m.messageStubParameters?.[0]
  if (!who) return false

  const jid = conn.decodeJid(who)
  const cleanUserId = jid.split('@')[0]
  const groupName = groupMetadata?.subject || 'Gruppo'

  let text = ''

  if (isAdd && chat.welcome) {
    text = `*╭━━━━━━━👋━━━━━━━╮*
*✦ 𝐁𝐄𝐍𝐕𝐄𝐍𝐔𝐓𝐎/𝐀 ✦*
*╰━━━━━━━👋━━━━━━━╯*

*@${cleanUserId} 𝐛𝐞𝐧𝐯𝐞𝐧𝐮𝐭𝐨/𝐚 𝐢𝐧 ${groupName}!*

*𝐏𝐞𝐫 𝐢𝐧𝐢𝐳𝐢𝐚𝐫𝐞, 𝐩𝐫𝐞𝐬𝐞𝐧𝐭𝐚𝐭𝐢 𝐜𝐨𝐧:*
*✦ 𝐍𝐨𝐦𝐞*
*✦ 𝐏𝐫𝐨𝐯𝐞𝐧𝐢𝐞𝐧𝐳𝐚*
*✦ 𝐄𝐭𝐚̀*
*✦ 𝐅𝐨𝐭𝐨 𝐚 𝐯𝐢𝐬𝐮𝐚𝐥𝐢𝐳𝐳𝐚𝐳𝐢𝐨𝐧𝐞 𝐮𝐧𝐢𝐜𝐚*

*📜 𝐓𝐢 𝐢𝐧𝐯𝐢𝐭𝐢𝐚𝐦𝐨 𝐚 𝐥𝐞𝐠𝐠𝐞𝐫𝐞 𝐥𝐞 𝐫𝐞𝐠𝐨𝐥𝐞 𝐜𝐨𝐧 𝐢𝐥 𝐜𝐨𝐦𝐚𝐧𝐝𝐨:* *.regole*

*𝐁𝐮𝐨𝐧𝐚 𝐩𝐞𝐫𝐦𝐚𝐧𝐞𝐧𝐳𝐚!* ✨

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
  }

  if (isRemove && chat.goodbye) {
    text = `*╭━━━━━━━👋━━━━━━━╮*
*✦ 𝐀𝐃𝐃𝐈𝐎 ✦*
*╰━━━━━━━👋━━━━━━━╯*

*@${cleanUserId} 𝐡𝐚 𝐥𝐚𝐬𝐜𝐢𝐚𝐭𝐨 ${groupName}.*

*𝐓𝐚𝐧𝐭𝐨 𝐧𝐨𝐧 𝐟𝐫𝐞𝐠𝐚𝐯𝐚 𝐮𝐧 𝐜𝐚𝐳𝐳𝐨 𝐚 𝐧𝐞𝐬𝐬𝐮𝐧𝐨 𝐝𝐢 𝐭𝐞*`

    text += `

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
  }

  if (!text) return false

  await conn.sendMessage(
    m.chat,
    {
      text: text.trim(),
      mentions: [jid]
    },
    { quoted: m }
  )

  return true
}

export default handler