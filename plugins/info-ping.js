// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import os from 'os'
import { performance } from 'perf_hooks'

const toMath = number => {
  const map = {
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒',
    '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗', '.': '.'
  }
  return String(number).split('').map(v => map[v] || v).join('')
}

const clockString = ms => {
  const d = Math.floor(ms / 86400000)
  const h = Math.floor((ms % 86400000) / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)

  return `${toMath(String(d).padStart(2, '0'))}d ${toMath(String(h).padStart(2, '0'))}h ${toMath(String(m).padStart(2, '0'))}m`
}

let handler = async (m, { conn, usedPrefix, isAdmin, isOwner, isROwner }) => {
  const user = global.db.data.users[m.sender] || {}
  const isModerator = !!user.premium && user.premiumGroup === m.chat

  if (!isAdmin && !isOwner && !isROwner && !isModerator) {
    return conn.reply(
      m.chat,
      '*⛔️ 𝐍𝐨𝐧 𝐬𝐞𝐢 𝐚𝐮𝐭𝐨𝐫𝐢𝐳𝐳𝐚𝐭𝐨 𝐚𝐝 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨*',
      m
    )
  }

  const start = performance.now()
  await new Promise(resolve => setImmediate(resolve))
  const latency = (performance.now() - start).toFixed(4)

  const uptime = clockString(process.uptime() * 1000)

  const totalMem = os.totalmem() / (1024 * 1024)
  const freeMem = os.freemem() / (1024 * 1024)
  const usedMem = totalMem - freeMem
  const ramPercent = ((usedMem / totalMem) * 100).toFixed(0)

  const heapUsed = (process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(1)

  const cpuModel = os.cpus()[0]?.model || 'Unknown CPU'
  const cpuCores = os.cpus().length
  const platform = `${os.platform()} ${os.arch()}`
  const nodeVersion = process.version

  const info = `*╭━━━━━━━⚡━━━━━━━╮*
*✦ 𝚫𝐗𝐈𝐎𝐍 • 𝐒𝐓𝐀𝐓𝐔𝐒 ✦*
*╰━━━━━━━⚡━━━━━━━╯*

*🚀 𝐋𝐚𝐭𝐞𝐧𝐜𝐲:*
*╰➤* ${toMath(latency)} ms

*⏱️ 𝐔𝐩𝐭𝐢𝐦𝐞:*
*╰➤* ${uptime}

*💻 𝐑𝐀𝐌:*
*╰➤* ${toMath(usedMem.toFixed(0))} / ${toMath(totalMem.toFixed(0))} MB *(${toMath(ramPercent)}%)*

*🧠 𝐇𝐞𝐚𝐩:*
*╰➤* ${toMath(heapUsed)} MB

*⚙️ 𝐂𝐏𝐔:*
*╰➤* ${cpuModel}
*╰➤* ${toMath(cpuCores)} Cores

*🖥️ 𝐎𝐒:*
*╰➤* ${platform}

*📦 𝐍𝐨𝐝𝐞:*
*╰➤* ${nodeVersion}

*✅ 𝐒𝐭𝐚𝐭𝐮𝐬:*
*╰➤* System Online

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

  const buttons = [
    {
      buttonId: `${usedPrefix}ping`,
      buttonText: { displayText: '🔄 Rifai Ping' },
      type: 1
    },
    {
      buttonId: `${usedPrefix}menu`,
      buttonText: { displayText: '📋 Menu' },
      type: 1
    }
  ]

  await conn.sendMessage(m.chat, {
    text: info,
    footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    buttons,
    headerType: 1
  }, { quoted: m })
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler