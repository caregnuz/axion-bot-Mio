Il fix giusto è smettere di fidarsi del catch come se volesse dire “già retrocesso” e controllare lo stato prima e dopo. groupParticipantsUpdate(...) lancia su errore, ma non tutti i casi equivalgono a “già retrocesso”; inoltre in based gli eventi gruppo espongono JID normalizzati, quindi conviene normalizzare sempre gli id. 

Ti conviene sostituire tutto il blocco centrale del comando con questa versione.

// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import fetch from 'node-fetch'

const S = v => String(v || '')

function normalizeJid(jid) {
  return String(jid || '').split(':')[0]
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

function makeParticipantMap(metadata) {
  return new Map(
    (metadata.participants || []).map(p => [
      normalizeJid(p.id),
      p.admin != null || p.admin === true
    ])
  )
}

var handler = async (m, { conn, text, command }) => {
  let action, title, icon
  const sender = m.sender

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

  if (['promote', 'promuovi', 'p', 'p2'].includes(command)) {
    action = 'promote'
    icon = '👑'
    title = '𝐏𝐑𝐎𝐌𝐎𝐙𝐈𝐎𝐍𝐄'
  } else {
    action = 'demote'
    icon = '🙇‍♂️'
    title = '𝐑𝐄𝐓𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐎𝐍𝐄'
  }

  try {
    if (global.groupCache?.del) global.groupCache.del(m.chat)
    const beforeMeta = await conn.groupMetadata(m.chat)
    const beforeMap = makeParticipantMap(beforeMeta)

    const ownerNumbers = (global.owner || []).map(v => String(Array.isArray(v) ? v[0] : v))
    const ownerJids = ownerNumbers.map(v => v.replace(/\D/g, '') + '@s.whatsapp.net')

    const groupOwner = normalizeJid(beforeMeta.owner || '')
    const blockedBotOwners = []
    const blockedGroupOwners = []
    const alreadyOk = []
    const toUpdate = []

    for (const user of users) {
      const isAdminNow = beforeMap.get(normalizeJid(user)) || false

      if (action === 'promote') {
        if (isAdminNow) alreadyOk.push(user)
        else toUpdate.push(user)
      } else {
        if (ownerJids.includes(user)) blockedBotOwners.push(user)
        else if (groupOwner && user === groupOwner) blockedGroupOwners.push(user)
        else if (!isAdminNow) alreadyOk.push(user)
        else toUpdate.push(user)
      }
    }

    if (!toUpdate.length) {
      let warningText = ''

      if (blockedBotOwners.length) {
        warningText = '*⛔️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭.*'
      } else if (blockedGroupOwners.length) {
        warningText = '*⛔️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 𝐢𝐥 𝐜𝐫𝐞𝐚𝐭𝐨𝐫𝐞 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*'
      } else {
        warningText = action === 'promote'
          ? "*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐚𝐝𝐦𝐢𝐧.*"
          : "*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐨.*"
      }

      const shownList = [...alreadyOk, ...blockedBotOwners, ...blockedGroupOwners]
      const tagList = shownList.length
        ? shownList.map(u => `• @${u.split('@')[0]}`).join('\n')
        : users.map(u => `• @${u.split('@')[0]}`).join('\n')

      const msg = `*╭━━━━━━━${icon}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${icon}━━━━━━━╯*

${warningText}

*👥 𝐔𝐭𝐞𝐧𝐭𝐢:*
${tagList}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

      return conn.sendMessage(m.chat, {
        text: msg,
        mentions: shownList.length ? shownList : users
      }, { quoted: m })
    }

    await conn.groupParticipantsUpdate(m.chat, toUpdate, action)

    if (global.groupCache?.del) global.groupCache.del(m.chat)
    await new Promise(resolve => setTimeout(resolve, 800))
    const afterMeta = await conn.groupMetadata(m.chat)
    const afterMap = makeParticipantMap(afterMeta)

    const reallyUpdated = []
    const failedUpdate = []

    for (const user of toUpdate) {
      const isAdminAfter = afterMap.get(normalizeJid(user)) || false

      if (action === 'promote') {
        if (isAdminAfter) reallyUpdated.push(user)
        else failedUpdate.push(user)
      } else {
        if (!isAdminAfter) reallyUpdated.push(user)
        else failedUpdate.push(user)
      }
    }

    if (!reallyUpdated.length) {
      const warningText = action === 'promote'
        ? '*⚠️ 𝐋𝐚 𝐩𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 è 𝐚𝐧𝐝𝐚𝐭𝐚 𝐚 𝐛𝐮𝐨𝐧 𝐟𝐢𝐧𝐞.*'
        : '*⚠️ 𝐋𝐚 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 è 𝐚𝐧𝐝𝐚𝐭𝐚 𝐚 𝐛𝐮𝐨𝐧 𝐟𝐢𝐧𝐞.*'

      const tagList = toUpdate.map(u => `• @${u.split('@')[0]}`).join('\n')

      const msg = `*╭━━━━━━━${icon}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${icon}━━━━━━━╯*

${warningText}

*👥 𝐔𝐭𝐞𝐧𝐭𝐢:*
${tagList}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

      return conn.sendMessage(m.chat, {
        text: msg,
        mentions: toUpdate
      }, { quoted: m })
    }

    const thumbnailBuffer = await getThumbnailBuffer(conn, m.chat)

    const targetLabel = reallyUpdated.length === 1
      ? `@${reallyUpdated[0].split('@')[0]}`
      : 'gli utenti selezionati'

    const actionText = action === 'promote'
      ? `*@${sender.split('@')[0]} 𝐡𝐚 𝐝𝐚𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚 ${targetLabel}.* 👑`
      : `*@${sender.split('@')[0]} 𝐡𝐚 𝐭𝐨𝐥𝐭𝐨 𝐢 𝐩𝐨𝐭𝐞𝐫𝐢 𝐚 ${targetLabel}.* 🙇‍♂️`

    const tagList = reallyUpdated.map(u => `• @${u.split('@')[0]}`).join('\n')

    let extraText = ''

    if (alreadyOk.length) {
      const alreadyList = alreadyOk.map(u => `• @${u.split('@')[0]}`).join('\n')
      extraText += action === 'promote'
        ? `\n\n*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐚𝐝𝐦𝐢𝐧.*\n${alreadyList}`
        : `\n\n*⚠️ 𝐋'𝐮𝐭𝐞𝐧𝐭𝐞 è 𝐠𝐢à 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐨.*\n${alreadyList}`
    }

    if (blockedBotOwners.length) {
      const ownerList = blockedBotOwners.map(u => `• @${u.split('@')[0]}`).join('\n')
      extraText += `\n\n*⛔️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 𝐮𝐧 𝐨𝐰𝐧𝐞𝐫 𝐝𝐞𝐥 𝐛𝐨𝐭.*\n${ownerList}`
    }

    if (blockedGroupOwners.length) {
      const ownerList = blockedGroupOwners.map(u => `• @${u.split('@')[0]}`).join('\n')
      extraText += `\n\n*⛔️ 𝐍𝐨𝐧 𝐩𝐮𝐨𝐢 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐝𝐞𝐫𝐞 𝐢𝐥 𝐜𝐫𝐞𝐚𝐭𝐨𝐫𝐞 𝐝𝐞𝐥 𝐠𝐫𝐮𝐩𝐩𝐨.*\n${ownerList}`
    }

    if (failedUpdate.length) {
      const failedList = failedUpdate.map(u => `• @${u.split('@')[0]}`).join('\n')
      extraText += action === 'promote'
        ? `\n\n*⚠️ 𝐋𝐚 𝐩𝐫𝐨𝐦𝐨𝐳𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 è 𝐚𝐧𝐝𝐚𝐭𝐚 𝐚 𝐛𝐮𝐨𝐧 𝐟𝐢𝐧𝐞.*\n${failedList}`
        : `\n\n*⚠️ 𝐋𝐚 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 è 𝐚𝐧𝐝𝐚𝐭𝐚 𝐚 𝐛𝐮𝐨𝐧 𝐟𝐢𝐧𝐞.*\n${failedList}`
    }

    const msg = `*╭━━━━━━━${icon}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${icon}━━━━━━━╯*

${actionText}

*👥 𝐔𝐭𝐞𝐧𝐭𝐢:*
${tagList}${extraText}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

    await conn.sendMessage(m.chat, {
      text: msg,
      mentions: [sender, ...reallyUpdated, ...alreadyOk, ...blockedBotOwners, ...blockedGroupOwners, ...failedUpdate],
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
    }, { quoted: m })

  } catch (e) {
    conn.reply(
      m.chat,
      '*⚠️ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐦𝐨𝐝𝐢𝐟𝐢𝐜𝐚 𝐝𝐞𝐢 𝐩𝐞𝐫𝐦𝐞𝐬𝐬𝐢.*\n\n> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*',
      m
    )
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['admin']
handler.command = ['promote', 'promuovi', 'p', 'p2', 'demote', 'retrocedi', 'r']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler