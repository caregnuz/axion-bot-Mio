// by Bonzino

const IG_THUMB = 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png'

function extractInstagramUsername(input = '') {
  let text = String(input || '').trim()

  if (!text) return null

  if (text.startsWith('@')) text = text.slice(1)

  if (/instagram\.com/i.test(text)) {
    try {
      text = text
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split('?')[0]
        .split('#')[0]

      const parts = text.split('/').filter(Boolean)
      const idx = parts.findIndex(v => /instagram\.com/i.test(v))

      if (idx !== -1 && parts[idx + 1]) {
        text = parts[idx + 1]
      }
    } catch {}
  }

  text = text.replace(/\/+$/, '').trim()

  if (!/^[a-zA-Z0-9._]+$/.test(text)) return null
  return text
}

let handler = async (m, { text, command, conn }) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  if (!user.profile) user.profile = {}

  if (command === 'setig') {
    if (!text) {
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐭𝐮𝐨 𝐮𝐬𝐞𝐫𝐧𝐚𝐦𝐞 𝐨 𝐥𝐢𝐧𝐤 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦*\n\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨:\n.setig nomeutente\n.setig https://instagram.com/nomeutente',
        contextInfo: global.rcanal?.contextInfo || {}
      }, { quoted: m })
    }

    const username = extractInstagramUsername(text)

    if (!username) {
      return conn.sendMessage(m.chat, {
        text: '*❌ 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 𝐨 𝐥𝐢𝐧𝐤 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨*',
        contextInfo: global.rcanal?.contextInfo || {}
      }, { quoted: m })
    }

    user.profile.instagram = username

    return conn.sendMessage(m.chat, {
      text: `*✅ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐬𝐚𝐥𝐯𝐚𝐭𝐨!*\n\n📸 instagram.com/${username}`,
      contextInfo: {
        ...(global.rcanal?.contextInfo || {}),
        externalAdReply: {
          title: `@${username}`,
          body: 'Instagram',
          thumbnailUrl: IG_THUMB,
          sourceUrl: `https://instagram.com/${username}`,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
    }, { quoted: m })
  }

  if (command === 'ig') {
    let target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    let targetUser = global.db.data.users[target] || {}
    let ig = targetUser.profile?.instagram

    if (!ig) {
      return conn.sendMessage(m.chat, {
        text: '*📸 𝐍𝐞𝐬𝐬𝐮𝐧 𝐚𝐜𝐜𝐨𝐮𝐧𝐭 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨*',
        contextInfo: global.rcanal?.contextInfo || {}
      }, { quoted: m })
    }

    return conn.sendMessage(m.chat, {
      text: `*📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦:*\ninstagram.com/${ig}`,
      mentions: [target],
      contextInfo: {
        ...(global.rcanal?.contextInfo || {}),
        externalAdReply: {
          title: `@${ig}`,
          body: 'Instagram',
          thumbnailUrl: IG_THUMB,
          sourceUrl: `https://instagram.com/${ig}`,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
    }, { quoted: m })
  }

  if (command === 'delig') {
    if (!user.profile.instagram) {
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞*',
        contextInfo: global.rcanal?.contextInfo || {}
      }, { quoted: m })
    }

    delete user.profile.instagram

    return conn.sendMessage(m.chat, {
      text: '*🗑️ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐫𝐢𝐦𝐨𝐬𝐬𝐨*',
      contextInfo: global.rcanal?.contextInfo || {}
    }, { quoted: m })
  }
}

handler.help = ['setig', 'ig', 'delig']
handler.tags = ['tools']
handler.command = /^(setig|ig|delig)$/i

export default handler