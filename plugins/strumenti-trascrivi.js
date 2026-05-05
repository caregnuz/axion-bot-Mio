// trascrivi by Bonzino

import fs from 'fs'
import os from 'os'
import path from 'path'
import fetch from 'node-fetch'
import FormData from 'form-data'
import dotenv from 'dotenv'
import { downloadContentFromMessage } from '@realvare/baileys'

dotenv.config()

const TMP = os.tmpdir()

const cleanJid = jid => String(jid || '').replace(/[^0-9]/g, '')

const box = (emoji, title, body) => `*╭━━━━━━━${emoji}━━━━━━━╮*
*✦ ${title} ✦*
*╰━━━━━━━${emoji}━━━━━━━╯*

${body}`

function pickMedia(msg) {
  if (!msg) return null

  if (msg.audioMessage) return { type: 'audio', node: msg.audioMessage }
  if (msg.videoMessage) return { type: 'video', node: msg.videoMessage }
  if (msg.documentMessage) {
    const mime = msg.documentMessage.mimetype || ''
    if (mime.startsWith('audio/')) return { type: 'audio', node: msg.documentMessage }
    if (mime.startsWith('video/')) return { type: 'video', node: msg.documentMessage }
  }

  const keys = [
    'message',
    'quotedMessage',
    'ephemeralMessage',
    'viewOnceMessage',
    'viewOnceMessageV2',
    'extendedTextMessage',
    'contextInfo'
  ]

  for (const k of keys) {
    if (msg[k]) {
      const deep = pickMedia(msg[k])
      if (deep) return deep
    }
  }

  return null
}

async function downloadBuffer(type, node) {
  const stream = await downloadContentFromMessage(node, type)
  const chunks = []
  for await (const c of stream) chunks.push(c)
  return Buffer.concat(chunks)
}

async function trascriviGladia(buffer) {
  const key = process.env.GLADIA_API_KEY
  if (!key) throw '*❌️ 𝐀𝐏𝐈 𝐊𝐄𝐘 𝐦𝐚𝐧𝐜𝐚𝐧𝐭𝐞*'

  const form = new FormData()
  form.append('audio', buffer, {
    filename: 'audio.ogg',
    contentType: 'audio/ogg'
  })

  const res = await fetch('https://api.gladia.io/audio/text/audio-transcription', {
    method: 'POST',
    headers: {
      'x-gladia-key': key,
      ...form.getHeaders()
    },
    body: form
  })

  const data = await res.json()

  if (!res.ok) throw JSON.stringify(data)

  let text = ''

  if (Array.isArray(data.prediction)) {
    text = data.prediction.map(x => x.transcription || '').join(' ')
  }

  if (!text && typeof data.text === 'string') text = data.text

  if (!text) throw '𝐓𝐫𝐚𝐬𝐜𝐫𝐢𝐳𝐢𝐨𝐧𝐞 𝐯𝐮𝐨𝐭𝐚'

  return text.trim()
}

let handler = async (m, { conn }) => {
  const chat = m.chat

  let loading = await conn.sendMessage(chat, {
    text: box(
      '🎙️',
      '𝐓𝐑𝐀𝐒𝐂𝐑𝐈𝐙𝐈𝐎𝐍𝐄',
      `*𝐄𝐥𝐚𝐛𝐨𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...*`
    ),
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
  }, { quoted: m })

  let media = null

  if (m.quoted?.message) {
    const picked = pickMedia(m.quoted.message)
    if (picked) media = await downloadBuffer(picked.type, picked.node)
  }

  if (!media) {
    const picked = pickMedia(m.message)
    if (picked) media = await downloadBuffer(picked.type, picked.node)
  }

  if (!media) {
    const msgs = conn.store?.messages?.[chat]?.array || []
    const recent = [...msgs].reverse().slice(0, 20)

    for (const msg of recent) {
      const picked = pickMedia(msg.message)
      if (picked) {
        try {
          media = await downloadBuffer(picked.type, picked.node)
          break
        } catch {}
      }
    }
  }

  if (!media) {
    return conn.sendMessage(chat, {
      text: box(
        '⚠️',
        '𝐀𝐔𝐃𝐈𝐎 𝐍𝐎𝐍 𝐓𝐑𝐎𝐕𝐀𝐓𝐎',
        `*𝐑𝐢𝐬𝐩𝐨𝐧𝐝𝐢 𝐚 𝐮𝐧 𝐯𝐨𝐜𝐚𝐥𝐞 𝐨 𝐢𝐧𝐯𝐢𝐚 𝐮𝐧 𝐚𝐮𝐝𝐢𝐨 𝐜𝐨𝐧 .𝐭𝐫𝐚𝐬𝐜𝐫𝐢𝐯𝐢*`
      ),
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
    }, { quoted: m })
  }

  try {
    const testo = await trascriviGladia(media)

    await conn.sendMessage(chat, {
      text: box(
        '📝',
        '𝐓𝐑𝐀𝐒𝐂𝐑𝐈𝐙𝐈𝐎𝐍𝐄',
        `*${testo}*`
      ),
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
    }, { quoted: m })

  } catch (e) {
    await conn.sendMessage(chat, {
      text: box(
        '❌',
        '𝐄𝐑𝐑𝐎𝐑𝐄',
        `*${String(e).slice(0, 200)}*`
      ),
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
    }, { quoted: m })
  }
}

handler.command = /^(trascrivi|transcribe)$/i
handler.group = true

export default handler