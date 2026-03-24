// by Bonzino

let handler = async (m, { text, command, conn }) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  if (!user.profile) user.profile = {}

  if (command === 'setig') {
    if (!text) {
      return conn.sendMessage(m.chat, {
        text: '*⚠️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐭𝐮𝐨 𝐮𝐬𝐞𝐫𝐧𝐚𝐦𝐞 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦*\n\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨:\n.setig nomeutente',
        contextInfo: global.rcanal?.contextInfo || {}
      }, { quoted: m })
    }

    if (!text.match(/^[a-zA-Z0-9._]+$/)) {
      return conn.sendMessage(m.chat, {
        text: '*❌ 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨*\n\n𝐔𝐬𝐚 𝐬𝐨𝐥𝐨 𝐥𝐞𝐭𝐭𝐞𝐫𝐞, 𝐧𝐮𝐦𝐞𝐫𝐢, 𝐩𝐮𝐧𝐭𝐢 𝐞 𝐮𝐧𝐝𝐞𝐫𝐬𝐜𝐨𝐫𝐞',
        contextInfo: global.rcanal?.contextInfo || {}
      }, { quoted: m })
    }

    user.profile.instagram = text

    return conn.sendMessage(m.chat, {
      text: `*✅ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐬𝐚𝐥𝐯𝐚𝐭𝐨!*\n\n📸 instagram.com/${text}`,
      contextInfo: global.rcanal?.contextInfo || {}
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
      contextInfo: global.rcanal?.contextInfo || {}
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