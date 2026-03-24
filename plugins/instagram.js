// by Bonzino

let handler = async (m, { text, command }) => {
  let user = global.db.data.users[m.sender]
  if (!user) return

  if (!user.profile) user.profile = {}

  if (command === 'setig') {
    if (!text) {
      return m.reply('*⚠️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐢𝐥 𝐭𝐮𝐨 𝐮𝐬𝐞𝐫𝐧𝐚𝐦𝐞 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦*\n\n𝐄𝐬𝐞𝐦𝐩𝐢𝐨:\n.setig nomeutente')
    }

    if (!text.match(/^[a-zA-Z0-9._]+$/)) {
      return m.reply('*❌ 𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨*\n\n𝐔𝐬𝐚 𝐬𝐨𝐥𝐨 𝐥𝐞𝐭𝐭𝐞𝐫𝐞, 𝐧𝐮𝐦𝐞𝐫𝐢, 𝐩𝐮𝐧𝐭𝐢 𝐞 𝐮𝐧𝐝𝐞𝐫𝐬𝐜𝐨𝐫𝐞')
    }

    user.profile.instagram = text

    return m.reply(`*✅ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐬𝐚𝐥𝐯𝐚𝐭𝐨!*\n\n📸 instagram.com/${text}`)
  }

  if (command === 'ig') {
    let target = m.mentionedJid?.[0] || m.quoted?.sender || m.sender
    let targetUser = global.db.data.users[target] || {}

    let ig = targetUser.profile?.instagram

    if (!ig) {
      return m.reply('*📸 𝐍𝐞𝐬𝐬𝐮𝐧 𝐚𝐜𝐜𝐨𝐮𝐧𝐭 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐢𝐦𝐩𝐨𝐬𝐭𝐚𝐭𝐨*')
    }

    return m.reply(`*📸 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦:*\ninstagram.com/${ig}`, null, {
      mentions: [target]
    })
  }

  if (command === 'delig') {
    if (!user.profile.instagram) {
      return m.reply('*⚠️ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐝𝐚 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞*')
    }

    delete user.profile.instagram

    return m.reply('*🗑️ 𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦 𝐫𝐢𝐦𝐨𝐬𝐬𝐨*')
  }
}

handler.help = ['setig', 'ig', 'delig']
handler.tags = ['tools']
handler.command = /^(setig|ig|delig)$/i

export default handler