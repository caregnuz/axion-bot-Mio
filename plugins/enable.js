import fs from 'fs'
import fetch from 'node-fetch'

let handler = async (m, { conn, command, args, isAdmin, isOwner, isROwner }) => {
  const isEnable = /attiva|enable|1/i.test(command)

  const chats = global.db.data.chats
  const settings = global.db.data.settings

  chats[m.chat] ??= {}
  settings[conn.user.jid] ??= {}

  const chat = chats[m.chat]
  const bot = settings[conn.user.jid]

  let pp = null
  try {
    pp = await conn.profilePictureUrl(m.sender, 'image')
  } catch {}

  const getBuffer = async (url) => {
    if (!url) return null
    try {
      const res = await fetch(url)
      if (!res.ok) return null
      return Buffer.from(await res.arrayBuffer())
    } catch {
      return null
    }
  }

  let profileBuffer = await getBuffer(pp)
  if (!profileBuffer) {
    try {
      profileBuffer = fs.readFileSync('./media/default-avatar.png')
    } catch {
      profileBuffer = null
    }
  }

  let senderName = 'Utente'
  try {
    senderName = await conn.getName(m.sender)
  } catch {
    senderName = m.pushName || 'Utente'
  }

  const box = (title, stato, desc) => `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐂𝐎𝐑𝐄 』
╼━━━━━━━━━━━━━━╾
  ◈ *ғᴜɴᴢɪᴏɴᴇ:* ${title}
  ◈ *sᴛᴀᴛᴏ:* ${stato}
╼━━━━━━━━━━━━━━╾
  ⌬ ${desc}
`.trim()

  const noAdmin = box('ᴀᴄᴄᴇssᴏ NEGATO', '🛑 sɪsᴛᴇᴍ ʟᴏᴄᴋ', 'Permessi amministratore mancanti.')
  const noOwner = box('ᴘʀɪᴠɪʟᴇɢɪᴏ 𝛥𝐗𝐈𝚶𝐍', '⚠️ ʀᴇsᴛʀɪᴛᴛᴏ', 'Accesso riservato al Mainframe Owner.')

  if (!args[0]) {
    throw `
『 𝚫𝐗𝐈𝐎𝐍 • 𝐈𝐍𝐓𝐄𝐑𝐅𝐀𝐂𝐄 』
╼━━━━━━━━━━━━━━╾
  💡 *ᴄᴍᴅ:*
  .1 <funzione>
  .0 <funzione>

  *sɪᴄᴜʀᴇᴢᴢᴀ:*
  🛡️ antilink, antispam, antibot
  🔞 antiporno, antigore, antitrava
  🔒 antitag, antiprivato
  
  *ʀᴇᴛᴇ:*
  📱 antiinsta, antitelegram, antitiktok
  
  *ɢᴇsᴛɪᴏɴᴇ:*
  ⚙️ soloadmin, benvenuto, addio
╼━━━━━━━━━━━━━━╾`.trim()
  }

  let feature = args[0].toLowerCase()
  let result = ''

  const requireAdmin = () => {
    if (m.isGroup && !(isAdmin || isOwner || isROwner)) {
      throw noAdmin
    }
  }

  const requireOwner = () => {
    if (!(isOwner || isROwner)) {
      throw noOwner
    }
  }

  switch (feature) {

    case 'antilink':
      requireAdmin()
      chat.antiLink = isEnable
      result = box('ᴀɴᴛɪʟɪɴᴋ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', '🔒 Protocollo AntiLink attivo')
      break

    case 'antiinsta':
      requireAdmin()
      chat.antiInsta = isEnable
      result = box('ᴀɴᴛɪ-ɪɴsᴛᴀɢʀᴀᴍ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Filtro Instagram')
      break

    case 'antitelegram':
      requireAdmin()
      chat.antiTelegram = isEnable
      result = box('ᴀɴᴛɪ-ᴛᴇʟᴇɢʀᴀᴍ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Filtro Telegram')
      break

    case 'antitiktok':
      requireAdmin()
      chat.antiTiktok = isEnable
      result = box('ᴀɴᴛɪ-ᴛɪᴋᴛᴏᴋ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Filtro TikTok')
      break

    case 'antitag':
      requireAdmin()
      chat.antiTag = isEnable
      result = box('ᴀɴᴛɪ-ᴛᴀɢ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Protezione tag')
      break

    case 'antigore':
      requireAdmin()
      chat.antigore = isEnable
      result = box('ᴀɴᴛɪ-ɢᴏʀᴇ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Filtro contenuti violenti')
      break

    case 'antiporno':
    case 'antiporn':
      requireAdmin()
      chat.antiporno = isEnable
      result = box('ᴀɴᴛɪ-ᴘᴏʀɴᴏ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Filtro NSFW')
      break

    case 'soloadmin':
      requireAdmin()
      chat.modoadmin = isEnable
      result = box('ᴍᴏᴅᴏ ᴀᴅᴍɪɴ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Solo admin possono usare il bot')
      break

    case 'benvenuto':
      requireAdmin()
      chat.welcome = isEnable
      result = box('ᴡᴇʟᴄᴏᴍᴇ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Messaggi di benvenuto')
      break

    case 'addio':
      requireAdmin()
      chat.goodbye = isEnable
      result = box('ɢᴏᴏᴅʙʏᴇ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Messaggi di uscita')
      break

    case 'antiprivato':
      requireOwner()
      bot.antiprivato = isEnable
      result = box('ᴀɴᴛɪ-ᴘʀɪᴠᴀᴛᴏ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Blocca chat private')
      break

    case 'antibot':
      requireAdmin()
      chat.antiBot = isEnable
      result = box('ᴀɴᴛɪ-ʙᴏᴛ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Blocca altri bot')
      break

    case 'antispam':
      requireAdmin()
      chat.antispam = isEnable
      result = box('ᴀɴᴛɪ-sᴘᴀᴍ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Filtro spam')
      break

    case 'antitrava':
      requireAdmin()
      chat.antitrava = isEnable
      result = box('ᴀɴᴛɪ-ᴛʀᴀᴠᴀ', isEnable ? '🔵 ᴀᴛᴛɪᴠᴏ' : '⚪ ᴅɪsᴀᴛᴛɪᴠᴏ', 'Protezione crash')
      break

    default:
      throw box('ᴜɴᴋɴᴏᴡɴ', '⚠️ ᴡᴀʀɴɪɴɢ', 'Funzione non riconosciuta')
  }

  await conn.sendMessage(m.chat, {
    text: result,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363424041538498@newsletter',
        serverMessageId: '',
        newsletterName: '𝛥𝐗𝐈𝐎𝐍 𝚩𝚯𝐓'
      },
      externalAdReply: {
        title: '𝚫𝐗𝐈𝐎𝐍 • 𝐒𝐘𝐒𝐓𝐄𝐌',
        body: `Utenza: ${senderName}`,
        thumbnail: profileBuffer,
        sourceUrl: '',
        mediaType: 1
      }
    }
  }, { quoted: m })
}

handler.help = ['attiva <feature>', 'disattiva <feature>']
handler.tags = ['group']
handler.command = ['attiva', 'disattiva', 'enable', 'disable', '1', '0']

export default handler