import fs from 'fs'
import os from 'os'
import { performance } from 'perf_hooks'

const toMathematicalAlphanumericSymbols = number => {
  const map = {
    '0': '𝟎','1': '𝟏','2': '𝟐','3': '𝟑','4': '𝟒',
    '5': '𝟓','6': '𝟔','7': '𝟕','8': '𝟖','9': '𝟗','.': '.'
  }
  return number.toString().split('').map(d => map[d] || d).join('')
}

const clockString = ms => {
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  const minutes = Math.floor((ms % 3600000) / 60000)

  return `${toMathematicalAlphanumericSymbols(days.toString().padStart(2,'0'))}d ${toMathematicalAlphanumericSymbols(hours.toString().padStart(2,'0'))}h ${toMathematicalAlphanumericSymbols(minutes.toString().padStart(2,'0'))}m`
}

const handler = async (m, { conn, usedPrefix }) => {

  // SOLO GRUPPI
  if (!m.isGroup) return conn.reply(m.chat, '❌ Questo comando funziona solo nei gruppi.', m)

  const _uptime = process.uptime() * 1000
  const uptime = clockString(_uptime)

  const start = performance.now()
  const end = performance.now()
  const speed = (end - start).toFixed(4)
  const speedWithFont = toMathematicalAlphanumericSymbols(speed)

  const totalMem = (os.totalmem() / (1024 * 1024)).toFixed(0)
  const usedMem = ((os.totalmem() - os.freemem()) / (1024 * 1024)).toFixed(0)

  const processMemory = process.memoryUsage()
  const heapUsed = (processMemory.heapUsed / (1024 * 1024)).toFixed(1)

  const info = `
『 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 — 𝐒𝐓𝐀𝐓𝐔𝐒 』

🚀 𝐋𝐀𝐓𝐄𝐍𝐙𝐀
╰➤ ${speedWithFont} ms

⏱️ 𝐔𝐏𝐓𝐈𝐌𝐄
╰➤ ${uptime}

💻 𝐑𝐄𝐒𝐎𝐔𝐑𝐂𝐄𝐒
╰➤ Server: ${usedMem} / ${totalMem} MB
╰➤ Engine: ${heapUsed} MB

🛰️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐎𝐍𝐋𝐈𝐍𝐄
`.trim()

  const buttons = [
    { buttonId: `${usedPrefix}ping`, buttonText: { displayText: '🔄 Rifai Ping' }, type: 1 },
    { buttonId: `${usedPrefix}menu`, buttonText: { displayText: '📋 Menu' }, type: 1 }
  ]

  await conn.sendMessage(m.chat, {
    text: info,
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 𝐒𝐘𝐒𝐓𝐄𝐌',
    buttons: buttons,
    headerType: 1
  }, { quoted: m })
}

handler.command = /^(ping)$/i

export default handler