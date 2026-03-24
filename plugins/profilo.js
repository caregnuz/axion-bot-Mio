// by Bonzino

import { getLevelFull } from '../lib/levels.js'

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

async function getDisplayName(conn, jid, meta, m) {
  const dbName = global?.db?.data?.users?.[jid]?.name
  if (dbName) return dbName

  if (bare(m.sender) === bare(jid) && m.pushName) return m.pushName

  try {
    const c = conn?.contacts?.[jid]
    const n = c?.name || c?.verifiedName || c?.notify || c?.pushName
    if (n) return n
  } catch {}

  try {
    if (Array.isArray(meta?.participants)) {
      const p = meta.participants.find(v => bare(v.id || v.jid) === bare(jid))
      if (p?.name || p?.notify) return p.name || p.notify
    }
  } catch {}

  return bare(jid)
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

  const user = global?.db?.data?.users?.[target] || {}
  const displayName = await getDisplayName(conn, target, meta, m)
  const totalMessages = Number(user.messages || 0)
  const monete = Number(user.euro || 0)
  const lvl = getLevelFull(totalMessages)
  const instagram = user.profile?.instagram
    ? `instagram.com/${user.profile.instagram}`
    : '𝐍𝐨𝐧 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨'

  const tag = '@' + bare(target)

  let pp = 'https://i.ibb.co/2kR7x9J/avatar.png'
  try {
    pp = await conn.profilePictureUrl(target, 'image')
  } catch {}

  const text = `*╭━━━━━━━✨━━━━━━━╮*
   *✦ 𝐏𝐑𝐎𝐅𝐈𝐋𝐎 ✦*
*╰━━━━━━━✨━━━━━━━╯*

*👤 𝐍𝐨𝐦𝐞:* ${displayName}
*🆔 𝐈𝐃:* ${tag}
*💬 𝐌𝐞𝐬𝐬𝐚𝐠𝐠𝐢:* ${totalMessages}
*🧠 𝐋𝐢𝐯𝐞𝐥𝐥𝐨:* ${lvl.level} (${lvl.icon} ${lvl.name})
*📈 𝐏𝐫𝐨𝐠𝐫𝐞𝐬𝐬𝐨:* ${lvl.bar} ${lvl.percent}%
*⬆️ 𝐏𝐫𝐨𝐬𝐬𝐢𝐦𝐨:* ${lvl.isMax ? '*𝐌𝐀𝐗*' : `${lvl.nextName} (${lvl.remaining} msg)`}
*🪙 𝐌𝐨𝐧𝐞𝐭𝐞:* ${monete}
*📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦:* ${instagram}`

  await conn.sendMessage(chatId, {
    text,
    mentions: [target],
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      externalAdReply: {
        title: displayName,
        body: 'Profilo utente',
        thumbnailUrl: pp,
        sourceUrl: '',
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, { quoted: m })
}

handler.help = ['profilo', 'profile']
handler.tags = ['info']
handler.command = /^(profilo|profile)$/i

export default handler