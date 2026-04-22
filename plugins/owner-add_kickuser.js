let handler = async (m, { conn, text, usedPrefix, command, isOwner, isROwner }) => {
  const input = String(text || '').trim()

  const log = (...a) => console.log('[OWNER-ADD_KICKUSER]', ...a)

  log('========================================')
  log('MESSAGE CONTEXT:', {
    chat: m.chat,
    remoteJid: m.key?.remoteJid,
    sender: m.sender,
    participant: m.key?.participant,
    fromMe: m.fromMe,
    isGroup: m.isGroup,
    pushName: m.pushName
  })
  log('========================================')

  if (!input) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━👥━━━━━━━╮*
*✦ 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐔𝐓𝐄𝐍𝐓𝐈 ✦*
*╰━━━━━━━👥━━━━━━━╯*

*📌 𝐀𝐠𝐠𝐢𝐮𝐧𝐠𝐢:*
*${usedPrefix}adduser 393xxxxxxxxx 1203630xxxxxxxxx@g.us*

*📌 𝐑𝐢𝐦𝐮𝐨𝐯𝐢:*
*${usedPrefix}kickuser 393xxxxxxxxx 1203630xxxxxxxxx@g.us*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,
      m
    )
  }

  if (!(isOwner || isROwner)) {
    return conn.reply(
      m.chat,
      `*╭━━━━━━━⛔━━━━━━━╮*
*✦ 𝐀𝐂𝐂𝐄𝐒𝐒𝐎 𝐍𝐄𝐆𝐀𝐓𝐎 ✦*
*╰━━━━━━━⛔━━━━━━━╯*`,
      m
    )
  }

  const isAdd = ['adduser', 'addnum', 'addutente'].includes(command)
  const action = isAdd ? 'add' : 'remove'
  const actionLabel = isAdd ? '𝐀𝐆𝐆𝐈𝐔𝐍𝐓𝐎' : '𝐑𝐈𝐌𝐎𝐒𝐒𝐎'
  const actionVerb = isAdd ? 'aggiunto' : 'rimosso'

  const normalized = input
    .replace(/\r/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s*@\s*g\.us/gi, '@g.us')
    .trim()

  const extractGroupId = str => {
    const match = str.match(/(?:^|\s)(\d{10,}@g\.us)(?=$|\s)/i)
    return match ? match[1] : null
  }

  const extractInvite = str => {
    const match = str.match(/chat\.whatsapp\.com\/([A-Za-z0-9]+)/i)
    return match ? match[1] : null
  }

  const extractNumber = str => {
    const match = str.match(/\b\d{6,15}\b/)
    return match ? match[0] : ''
  }

  const normalizeJid = jid => {
    if (!jid) return ''
    try {
      if (typeof conn.decodeJid === 'function') jid = conn.decodeJid(jid)
    } catch {}
    return String(jid || '').trim().toLowerCase()
  }

  const jidPhone = jid => {
    const decoded = normalizeJid(jid)
    return decoded.split('@')[0].split(':')[0].replace(/\D/g, '')
  }

  const participantIds = p => {
    return [
      p?.id,
      p?.jid,
      p?.lid,
      p?.participant
    ].filter(Boolean)
  }

  const groupId = extractGroupId(normalized)
  const inviteCode = extractInvite(normalized)
  const number = extractNumber(normalized)
  const userJid = number ? `${number}@s.whatsapp.net` : ''
  const cleanUser = jidPhone(userJid)

  log('INPUT:', input)
  log('NORMALIZED:', normalized)
  log('GROUP ID:', groupId)
  log('INVITE:', inviteCode)
  log('NUMBER:', number)
  log('USER JID:', userJid)
  log('USER PHONE:', cleanUser)

  if (!number) {
    return conn.reply(m.chat, `*❌ Numero non valido*`, m)
  }

  if (!groupId && !inviteCode) {
    return conn.reply(m.chat, `*⚠️ Gruppo mancante*`, m)
  }

  const withTimeout = (p, ms = 30000) =>
    Promise.race([
      p,
      new Promise((_, r) => setTimeout(() => r(new Error(`timeout_${ms}`)), ms))
    ])

  const sleep = ms => new Promise(r => setTimeout(r, ms))

  const getGroupMetadataSafe = async jid => {
    let lastError = null
    for (let i = 0; i < 3; i++) {
      try {
        log(`METADATA TRY ${i + 1}:`, jid)
        const meta = await withTimeout(conn.groupMetadata(jid), 20000)
        log(`METADATA OK ${i + 1}:`, meta?.id)
        return meta
      } catch (e) {
        lastError = e
        log(`METADATA FAIL ${i + 1}:`, e)
        await sleep(1500)
      }
    }
    throw lastError
  }

  let target = null

  if (groupId) {
    target = groupId
  } else {
    try {
      const info = await withTimeout(conn.groupGetInviteInfo(inviteCode), 20000)
      target = info?.id
    } catch (e) {
      log('INVITE ERROR:', e)
    }
  }

  log('TARGET RESOLVED:', target)

  log('BLOCK CHECK:', {
    currentChat: m.chat,
    target,
    same: target === m.chat
  })

  if (target === m.chat) {
    log('BLOCKED: TARGET IS CURRENT CHAT')
    return conn.reply(m.chat, `*⚠️ Non puoi operare su questo gruppo*`, m)
  }

  try {
    const meta = await getGroupMetadataSafe(target)
    const participants = Array.isArray(meta?.participants) ? meta.participants : []

    log('PARTICIPANTS COUNT:', participants.length)

    const match = participants.find(p => {
      const ids = participantIds(p)
      const phones = ids.map(id => jidPhone(id)).filter(Boolean)
      return phones.includes(cleanUser)
    })

    const exists = !!match

    log('EXISTS:', exists)
    log('MATCHED:', match || null)

    if (action === 'remove' && !exists) {
      return conn.reply(m.chat, `*ℹ️ Utente non trovato*`, m)
    }

    if (action === 'add' && exists) {
      return conn.reply(m.chat, `*ℹ️ Utente già presente*`, m)
    }

    let ok = false

    for (let i = 0; i < 3; i++) {
      try {
        log(`UPDATE TRY ${i + 1}`)
        await withTimeout(conn.groupParticipantsUpdate(target, [userJid], action), 30000)
        ok = true
        break
      } catch (e) {
        log('UPDATE ERROR:', e)
        await sleep(2000)
      }
    }

    if (!ok) {
      return conn.reply(m.chat, `*⚠️ Timeout operazione*`, m)
    }

    return conn.reply(
      m.chat,
      `*╭━━━━━━━✅━━━━━━━╮*
*✦ 𝐔𝐓𝐄𝐍𝐓𝐄 ${actionLabel} ✦*
*╰━━━━━━━✅━━━━━━━╯*

*@${number} è stato ${actionVerb}.*`,
      m,
      { mentions: [userJid] }
    )

  } catch (e) {
    log('FATAL:', e)
    return conn.reply(m.chat, `*⚠️ Errore operazione*`, m)
  }
}

handler.command = ['adduser', 'kickuser']
handler.rowner = true

export default handler