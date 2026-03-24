// by Bonzino

import { getDevice } from '@realvare/baileys'
import fetch from 'node-fetch'

const S = v => String(v || '')

function bare(j = '') {
  return S(j).split('@')[0].split(':')[0]
}

function resolveTargetJid(m) {
  const ctx = m.message?.extendedTextMessage?.contextInfo || {}

  if (Array.isArray(m.mentionedJid) && m.mentionedJid.length) return m.mentionedJid[0]
  if (Array.isArray(ctx.mentionedJid) && ctx.mentionedJid.length) return ctx.mentionedJid[0]
  if (m.quoted?.sender) return m.quoted.sender
  if (m.quoted?.participant) return m.quoted.participant
  if (ctx.participant) return ctx.participant

  return m.sender || m.key?.participant || m.participant || null
}

function isRealOwner(jid) {
  try {
    const num = bare(jid)
    if (!Array.isArray(global.owner)) return false

    const owners = global.owner
      .map(o => Array.isArray(o) ? o[0] : o)
      .map(v => bare(v))
      .filter(Boolean)

    return owners.includes(num)
  } catch {
    return false
  }
}

function getMessageId(m) {
  return m?.quoted?.id || m?.quoted?.key?.id || m?.key?.id || ''
}

function mapDeviceName(device) {
  switch (String(device || '').toLowerCase()) {
    case 'ios': return '🍏 *𝐢𝐎𝐒*'
    case 'android': return '📱 *𝐀𝐧𝐝𝐫𝐨𝐢𝐝*'
    case 'web': return '💻 *𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐖𝐞𝐛*'
    case 'desktop': return '🖥️ *𝐖𝐡𝐚𝐭𝐬𝐀𝐩𝐩 𝐃𝐞𝐬𝐤𝐭𝐨𝐩*'
    default: return '❓ *𝐒𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨*'
  }
}

async function getDisplayName(conn, jid, meta, m) {
  const dbName = global?.db?.data?.users?.[jid]?.name
  if (dbName) return dbName

  if (bare(m.sender) === bare(jid) && m.pushName) return m.pushName

  try {
    const c = conn?.contacts?.[jid]
    const n = c?.name || c?.verifiedName || c?.notify || c?.pushName
    if (n) return n
  } catch {}

  return bare(jid)
}

function formatDate(ts) {
  if (!ts || isNaN(ts)) return '𝐍𝐨𝐧 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐞'
  return new Date(ts).toLocaleString('it-IT')
}

let handler = async (m, { conn }) => {
  const chatId = m.chat
  if (!chatId) return

  let meta = null
  try {
    if (m.isGroup) meta = await conn.groupMetadata(chatId)
  } catch {}

  const target = resolveTargetJid(m)
  if (!target) return

  const user = global.db.data.users[target] || {}
  const chat = global.db.data.chats?.[chatId] || {}
  const oggiCount = chat?.archivioMessaggi?.utenti?.[target]?.conteggio || 0
  const messaggiGruppo = chat?.users?.[target]?.messages || 0

  const displayName = await getDisplayName(conn, target, meta, m)

  const warn = user.warn || 0
  const muted = !!user.muto
  const totalMessages = user.messages || 0
  const monete = user.euro || 0

  const joinedAt = formatDate(user.regTime || user.firstTime)

  let device = '❓ *𝐒𝐜𝐨𝐧𝐨𝐬𝐜𝐢𝐮𝐭𝐨*'
  try {
    device = mapDeviceName(getDevice(getMessageId(m)))
  } catch {}

  const tag = '@' + bare(target)

  let pp = 'https://i.ibb.co/2kR7x9J/avatar.png'
  try {
    pp = await conn.profilePictureUrl(target, 'image')
  } catch {}

  const thumbnailBuffer = await (await fetch(pp)).buffer()

  const text = `*╭━━━━━━━📌━━━━━━━╮*
   *✦ 𝐈𝐍𝐅𝐎 𝐔𝐓𝐄𝐍𝐓𝐄 ✦*
*╰━━━━━━━📌━━━━━━━╯*

*👤 𝐍𝐨𝐦𝐞:* ${displayName}
*🆔 𝐈𝐃:* ${tag}
*📱 𝐃𝐞𝐯𝐢𝐜𝐞:* ${device}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐭𝐨𝐭𝐚𝐥𝐢:* ${totalMessages}
*📅 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐨𝐠𝐠𝐢:* ${oggiCount}
*🫂 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢 𝐠𝐫𝐮𝐩𝐩𝐨:* ${messaggiGruppo}
*🪙 𝐌𝐨𝐧𝐞𝐭𝐞:* ${monete}
*📅 𝐄𝐧𝐭𝐫𝐚𝐭𝐚:* ${joinedAt}
*⚠️ 𝐖𝐚𝐫𝐧:* ${warn}/3
*🔇 𝐌𝐮𝐭𝐞:* ${muted ? '*𝐒𝐢*' : '*𝐍𝐨*'}`

  await conn.sendMessage(chatId, {
    text,
    mentions: [target],
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      mentionedJid: [target],
      externalAdReply: {
        title: displayName,
        body: '',
        thumbnail: thumbnailBuffer,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.command = /^(infoutente|info)$/i
handler.owner = true

export default handler