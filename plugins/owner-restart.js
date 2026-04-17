// Plugin restart by 𝕯𝖊ⱥ𝖉𝖑𝐲 e Bonzino

import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn }) => {
  try {
    const startTime = Date.now()

    await conn.reply(m.chat, '*🔄 𝐑𝐢𝐚𝐯𝐯𝐢𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...*', m)

    const steps = [
      '█▒▒▒▒▒▒▒▒▒ 10%',
      '███▒▒▒▒▒▒▒ 30%',
      '█████▒▒▒▒▒ 50%',
      '███████▒▒▒ 70%',
      '█████████▒ 90%',
      '██████████ 100%'
    ]

    for (const step of steps) {
      await sleep(350)
      await conn.reply(m.chat, `*${step}*`, m)
    }

    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    const restartState = {
      chat: m.chat,
      sender: m.sender,
      messageId: m.key?.id || null,
      startedAt: startTime,
      type: 'restart'
    }

    fs.writeFileSync(
      path.join(tmpDir, 'restart-state.json'),
      JSON.stringify(restartState, null, 2)
    )

    const isPm2 =
      process.env.pm_id !== undefined ||
      process.env.PM_ID !== undefined ||
      process.env.NODE_APP_INSTANCE !== undefined

    if (isPm2) {
      setTimeout(() => {
        process.exit(0)
      }, 1000)
      return
    }

    const child = spawn(process.argv[0], process.argv.slice(1), {
      cwd: process.cwd(),
      detached: true,
      stdio: 'inherit'
    })

    child.unref()

    setTimeout(() => {
      process.exit(0)
    }, 1000)

  } catch (err) {
    console.error('restart error:', err)
    return conn.reply(
      m.chat,
      `*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐢𝐥 𝐫𝐢𝐚𝐯𝐯𝐢𝐨:*\n\n${err.message || err}`,
      m
    )
  }
}

handler.help = ['restart', 'riavvia']
handler.tags = ['owner']
handler.command = /^(restart|riavvia|rbt)$/i
handler.owner = true

export default handler