// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fetch from 'node-fetch'

const S = v => String(v || '')
const ACTION_CACHE_MS = 8000

global.roleActionCache = global.roleActionCache || new Map()

function normalizeJid(jid) {
  return String(jid || '').split(':')[0]
}

function getActionCacheKey(chatId, action, users = []) {
  const sorted = [...users].map(normalizeJid).sort().join(',')
  return `${chatId}|${action}|${sorted}`
}

function markRecentAction(chatId, action, users = []) {
  const key = getActionCacheKey(chatId, action, users)
  global.roleActionCache.set(key, Date.now())
}

function isRecentAction(chatId, action, users = []) {
  const key = getActionCacheKey(chatId, action, users)
  const ts = global.roleActionCache.get(key)
  if (!ts) return false
  if (Date.now() - ts > ACTION_CACHE_MS) {
    global.roleActionCache.delete(key)
    return false
  }
  return true
}

function cleanupRecentActions() {
  const now = Date.now()
  for (const [key, ts] of global.roleActionCache.entries()) {
    if (now - ts > ACTION_CACHE_MS) global.roleActionCache.delete(key)
  }
}

function getOwnerJids() {
  const ownerNumbers = (global.owner || []).map(v => String(Array.isArray(v) ? v[0] : v))
  return ownerNumbers.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net')
}

function getTitleAndIcon(action) {
  if (action === 'promote') {
    return {
      action: 'promote',
      icon: '👑',
      title: '𝐏𝐑𝐎𝐌𝐎𝐙𝐈𝐎𝐍𝐄'
    }
  }

  return {
    action: 'demote',
    icon: '🙇‍♂️',
    title: '𝐑𝐄𝐓𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐎𝐍𝐄'
  }
}

async function getThumbnailBuffer(conn, chat) {
  let thumb = 'https://i.ibb.co/2kR7x9J/avatar.png'
  try {
    thumb = await conn.profilePictureUrl(chat, 'image')
  } catch {}

  return typeof thumb === 'string'
    ? await (await fetch(thumb)).buffer()
    : thumb
}

async function sendRoleMessage(conn, chatId, quoted, sender, users, action, extraText = '') {
  const { icon, title } = getTitleAndIcon(action)
  const thumbnailBuffer = await getThumbnailBuffer(conn, chatId)

  const targetLabel = users.length === 1
    ? `@${users[0].split('@')[0]}`
    : 'gli utenti selezionati'

  const actionText = action === 'promote'
    ? `*@${sender.split('@')[0]} 𝐡𝐚 𝐝𝐚𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚 ${targetLabel}.* 👑`
    : `*@${sender.split('@')[0]} 𝐡𝐚 𝐭𝐨𝐥𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚 ${targetLabel}.* 🙇‍♂️`

  const tagList = users.map(u => `• @${u.split('@')[0]}`).join('\n')

  const msg = `*╭━━━━━━━${icon}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${icon}━━━━━━━╯*

${actionText}${extraText}

*👥 𝐔𝐭𝐞𝐧𝐭𝐢:*
${tagList}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  await conn.sendMessage(chatId, {
    text: msg,
    mentions: [sender, ...users],
    contextInfo: {
      ...(global.rcanal?.contextInfo || {}),
      externalAdReply: {
        title: 'Gestione permessi gruppo',
        body: ' ',
        thumbnail: thumbnailBuffer,
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: false
      }
    }
  }, { quoted })
}

async function sendWarningMessage(conn, chatId, quoted, users, action, warningText) {
  const { icon, title } = getTitleAndIcon(action)
  const tagList = users.map(u => `• @${u.split('@')[0]}`).join('\n')

  const msg = `*╭━━━━━━━${icon}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${icon}━━━━━━━╯*

${warningText}

*👥 𝐔𝐭𝐞𝐧𝐭𝐢:*
${tagList}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  await conn.sendMessage(chatId, {
    text: msg,
    mentions: users
  }, { quoted })
}

var handler = async (m, { conn, text, command }) => {
  cleanupRecentActions()

  let users = m.mentionedJid && m.mentionedJid.length > 0
    ? m.mentionedJid
    : (m.quoted ? [m.quoted.sender] : [])

  if (!users.length && text) {
    const numbers = S(text).split(/[\s,]+/).filter(v => !isNaN(v))
    users = numbers.map(n => n + '@s.whatsapp.net')
  }

  users = [...new Set(users.map(normalizeJid))]

  if (!users.length) {
    return conn.reply(m.chat, '*⚠️ 𝐈𝐧𝐝𝐢𝐜𝐚 𝐚𝐥𝐦𝐞𝐧𝐨 𝐮𝐧 𝐮𝐭𝐞𝐧𝐭𝐞.*', m)
  }

  const action = ['promote', 'promuovi', 'p', 'p2'].includes(command) ? 'promote' : 'demote'

  try {
    if (global.groupCache?.del) global.groupCache.del(m.chat)
    const metadata = await conn.groupMetadata(m.chat)

    const participantMap = new Map(
      (metadata.participants || []).map(p => [
        normalizeJid(p.id),
        p.admin != null || p.admin === true
      ])
    )

    const ownerJids = getOwnerJids()
    const alreadyOk = []
    const blockedOwners = []
    const toUpdate = []

    for (const user of users) {
      const isAdminNow = participantMap.get(normalizeJid(user)) || false

      if (action === 'promote') {
        if (isAdminNow) alreadyOk.push(user)
        else toUpdate.push(user)
      } else {
        if (ownerJids.includes(user)) blockedOwners.push(user)
        else if (!isAdminNow) alreadyOk.push(user)
        else toUpdate.push(user)
      }
    }

    if (!toUpdate.length) {
      if (blockedOwners.length) {
        return sendWarningMessage(
          conn,
          m.chat,
          m,
          blockedOwners,
          action,
          '*⛔️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭.*'
        )
      }

      return sendWarningMessage(
        conn,
        m.chat,
        m,
        alreadyOk.length ? alreadyOk : users,
        action,
        action === 'promote'
          ? "*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐚𝐝𝐦𝐢𝐧.*"
          : "*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐨.*"
      )
    }

    markRecentAction(m.chat, action, toUpdate)
    await conn.groupParticipantsUpdate(m.chat, toUpdate, action)
    if (global.groupCache?.del) global.groupCache.del(m.chat)

    let extraText = ''

    if (alreadyOk.length) {
      const alreadyList = alreadyOk.map(u => `• @${u.split('@')[0]}`).join('\n')
      extraText += action === 'promote'
        ? `\n\n*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐚𝐝𝐦𝐢𝐧.*\n${alreadyList}`
        : `\n\n*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐨.*\n${alreadyList}`
    }

    if (blockedOwners.length) {
      const ownerList = blockedOwners.map(u => `• @${u.split('@')[0]}`).join('\n')
      extraText += `\n\n*⛔️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭.*\n${ownerList}`
    }

    await sendRoleMessage(conn, m.chat, m, m.sender, toUpdate, action, extraText)
  } catch (e) {
    conn.reply(
      m.chat,
      '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 𝐝𝐞𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',
      m
    )
  }
}

handler.participantsUpdate = async function ({ id, participants, action, author }) {
  try {
    cleanupRecentActions()

    if (!id || !participants?.length) return
    if (action !== 'promote' && action !== 'demote') return

    const users = [...new Set(participants.map(normalizeJid))]
    if (!users.length) return

    if (isRecentAction(id, action, users)) return

    const sender = normalizeJid(author || this.user?.jid || '')
    if (!sender) return

    await sendRoleMessage(this, id, null, sender, users, action)
  } catch (e) {
    console.error('participantsUpdate role message error:', e)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['admin']
handler.command = ['promote', 'promuovi', 'p', 'p2', 'demote', 'retrocedi', 'r']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler