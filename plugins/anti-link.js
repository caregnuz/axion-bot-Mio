import { downloadContentFromMessage } from '@realvare/baileys'
import ffmpeg from 'fluent-ffmpeg'
import { createWriteStream, readFile } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { unlink } from 'fs/promises'
import Jimp from 'jimp'
import jsQR from 'jsqr'
import fetch from 'node-fetch'
import { FormData } from 'formdata-node'

const WHATSAPP_GROUP_REGEX = /\bchat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
const WHATSAPP_CHANNEL_REGEX = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i

const SHORT_URL_DOMAINS = [
  'bit.ly', 'tinyurl.com', 't.co', 'short.link', 'shorturl.at',
  'is.gd', 'v.gd', 'goo.gl', 'ow.ly', 'buff.ly', 'tiny.cc',
  'shorte.st', 'adf.ly', 'linktr.ee', 'rebrand.ly',
  'bitly.com', 'cutt.ly', 'short.io', 'links.new',
  'link.ly', 'ur.ly', 'shrinkme.io', 'clck.ru',
  'short.gy', 'lnk.to', 'sh.st', 'ouo.io', 'bc.vc',
  'adfoc.us', 'linkvertise.com', 'exe.io', 'linkbucks.com'
]

const SHORT_URL_REGEX = new RegExp(
  `https?:\\/\\/(?:www\\.)?(?:${SHORT_URL_DOMAINS.map(d => d.replace('.', '\\.')).join('|')})\\/[^\\s]*`,
  'gi'
)

const tag = jid => '@' + String(jid || '').split('@')[0]

function isWhatsAppLink(url) {
  return WHATSAPP_GROUP_REGEX.test(url) || WHATSAPP_CHANNEL_REGEX.test(url)
}

function getPlatform(text = '') {
  const t = String(text).toLowerCase()

  if (WHATSAPP_GROUP_REGEX.test(t) || WHATSAPP_CHANNEL_REGEX.test(t)) return 'WHATSAPP'
  if (t.includes('instagram.com')) return 'INSTAGRAM'
  if (t.includes('tiktok.com')) return 'TIKTOK'
  if (t.includes('youtube.com') || t.includes('youtu.be')) return 'YOUTUBE'
  if (t.includes('facebook.com')) return 'FACEBOOK'
  if (t.includes('twitter.com') || t.includes('x.com')) return 'TWITTER'
  if (t.includes('t.me')) return 'TELEGRAM'
  if (SHORT_URL_REGEX.test(t)) return 'LINK SOSPETTO'

  return 'LINK'
}

async function containsSuspiciousLink(text) {
  if (!text) return false
  if (isWhatsAppLink(text)) return true
  if (SHORT_URL_REGEX.test(text)) return true
  return false
}

function extractTextFromMessage(m) {
  return (
    m.text ||
    m.message?.extendedTextMessage?.text ||
    m.message?.imageMessage?.caption ||
    m.message?.videoMessage?.caption ||
    ''
  ).trim()
}

async function sendWarn(conn, m, warn, platform) {
  await conn.sendMessage(
    m.chat,
    {
      text: `*『 ⚠️ 』 ${tag(m.sender)} 𝐀𝐯𝐯𝐢𝐬𝐨 ${warn}/3 𝐩𝐞𝐫 𝐥𝐢𝐧𝐤 ${platform}.*\n\n*𝐀𝐥 𝐭𝐞𝐫𝐳𝐨 𝐚𝐯𝐯𝐢𝐬𝐨 𝐯𝐞𝐫𝐫𝐚𝐢 𝐫𝐢𝐦𝐨𝐬𝐬𝐨.*\n\n> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`,
      mentions: [m.sender]
    },
    { quoted: m }
  )
}

async function sendKickMessage(conn, m, platform) {
  await conn.sendMessage(
    m.chat,
    {
      text: `*『 🚫 』 ${tag(m.sender)} 𝐫𝐢𝐦𝐨𝐬𝐬𝐨.*\n\n*𝐌𝐨𝐭𝐢𝐯𝐨:* 𝐒𝐩𝐚𝐦 𝐥𝐢𝐧𝐤 ${platform}\n\n> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`,
      mentions: [m.sender]
    },
    { quoted: m }
  )
}

async function sendNoPerms(conn, m) {
  await conn.sendMessage(
    m.chat,
    {
      text: `*『 ⚠️ 』 ${tag(m.sender)} 𝐧𝐨𝐧 𝐩𝐨𝐬𝐬𝐨 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞.*\n\n> 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓`,
      mentions: [m.sender]
    },
    { quoted: m }
  )
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {
  if (!m.isGroup || isAdmin || isOwner || isROwner || m.fromMe) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antiLink) return false

  try {
    const text = extractTextFromMessage(m)
    if (!(await containsSuspiciousLink(text))) return false

    const user = global.db.data.users[m.sender]
    if (!user) return false

    if (typeof user.warn !== 'number') user.warn = 0

    const platform = getPlatform(text)
    user.warn += 1

    if (user.warn < 3) {
      await sendWarn(conn, m, user.warn, platform)
      return true
    }

    user.warn = 0

    if (!isBotAdmin) {
      await sendNoPerms(conn, m)
      return true
    }

    try {
      await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
      await sendKickMessage(conn, m, platform)
    } catch {
      await sendNoPerms(conn, m)
    }

    return true
  } catch (err) {
    console.error('Errore AntiLink AXION BOT:', err)
  }

  return false
}