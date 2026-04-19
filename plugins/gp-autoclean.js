// Plugin pulizia automatica by Bonzino

import fs from 'fs'
import path from 'path'

const CLEANUP_INTERVAL_HOURS = 6
const START_HOUR = 20
const START_MINUTE = 35
const RUN_WINDOW_MINUTES = 10
const DELAY_TRA_GRUPPI_MS = 3000
const MIN_FILE_AGE_MS = 30 * 60 * 1000

const TEMP_DIRS = ['temp', 'tmp']
const SAFE_FILES = new Set(['restart-state.json', '.gitkeep'])

global.autoCleanState = global.autoCleanState || {
  lastRunSlot: null,
  running: false
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

function getBaseStartTimestamp() {
  return new Date(2026, 0, 1, START_HOUR, START_MINUTE, 0, 0).getTime()
}

function getCurrentRunSlot(nowMs) {
  const intervalMs = CLEANUP_INTERVAL_HOURS * 60 * 60 * 1000
  const baseStart = getBaseStartTimestamp()

  if (nowMs < baseStart) return null

  const slot = Math.floor((nowMs - baseStart) / intervalMs)
  const slotStart = baseStart + (slot * intervalMs)
  const slotEnd = slotStart + (RUN_WINDOW_MINUTES * 60 * 1000)

  if (nowMs >= slotStart && nowMs < slotEnd) {
    return String(slot)
  }

  return null
}

function isOldEnough(stats) {
  return Date.now() - stats.mtimeMs >= MIN_FILE_AGE_MS
}

function collectFiles(dirPath, list = []) {
  if (!fs.existsSync(dirPath)) return list

  for (const name of fs.readdirSync(dirPath)) {
    const full = path.join(dirPath, name)

    let stats
    try {
      stats = fs.statSync(full)
    } catch {
      continue
    }

    if (stats.isDirectory()) {
      collectFiles(full, list)
      continue
    }

    list.push({ full, name, stats })
  }

  return list
}

function removeEmptyDirs(dirPath) {
  if (!fs.existsSync(dirPath)) return

  for (const name of fs.readdirSync(dirPath)) {
    const full = path.join(dirPath, name)

    let stats
    try {
      stats = fs.statSync(full)
    } catch {
      continue
    }

    if (stats.isDirectory()) {
      removeEmptyDirs(full)

      try {
        if (!fs.readdirSync(full).length) fs.rmdirSync(full)
      } catch {}
    }
  }
}

function cleanupDirGroup(dirNames = []) {
  let removed = 0

  for (const dirName of dirNames) {
    const dirPath = path.join(process.cwd(), dirName)
    const files = collectFiles(dirPath)

    for (const file of files) {
      if (SAFE_FILES.has(file.name)) continue
      if (!isOldEnough(file.stats)) continue

      try {
        fs.unlinkSync(file.full)
        removed++
      } catch {}
    }

    try {
      removeEmptyDirs(dirPath)
    } catch {}
  }

  return removed
}

function runCleanup() {
  const tempRemoved = cleanupDirGroup(TEMP_DIRS)

  return { tempRemoved}
}

async function announceCleanup(conn, summary) {
  const chats = global.db?.data?.chats || {}
  const groupIds = Object.keys(chats).filter(id => id.endsWith('@g.us'))

  for (const chatId of groupIds) {
    try {
      await conn.sendMessage(chatId, {
        text:
`╭━━━〔 🧹 *𝐏𝐔𝐋𝐈𝐙𝐈𝐀 𝐀𝐔𝐓𝐎𝐌𝐀𝐓𝐈𝐂𝐀* 〕━━━⬣
┃ *𝐒𝐨𝐧𝐨 𝐬𝐭𝐚𝐭𝐢 𝐞𝐥𝐢𝐦𝐢𝐧𝐚𝐭𝐢 ${summary.tempRemoved} 𝐟𝐢𝐥𝐞 𝐭𝐞𝐦𝐩𝐨𝐫𝐚𝐧𝐞𝐢 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨✅️*
╰━━━━━━━━━━━━━━━━━━━━⬣

> △𝐗𝐈𝐎𝐍 𝐁𝐎𝐓*`
      })
    } catch (e) {
      console.error('cleanup announce error:', chatId, e)
    }

    await delay(DELAY_TRA_GRUPPI_MS)
  }
}

async function maybeRunCleanup(conn) {
  const state = global.autoCleanState
  if (state.running) return

  const nowMs = Date.now()
  const slot = getCurrentRunSlot(nowMs)
  if (slot === null) return
  if (state.lastRunSlot === slot) return

  state.running = true

  try {
    const summary = runCleanup()
    state.lastRunSlot = slot
    await announceCleanup(conn, summary)
  } catch (e) {
    console.error('auto cleanup error:', e)
  } finally {
    state.running = false
  }
}

let handler = async () => {}

handler.before = async function (m, { conn }) {
  if (!m || !m.chat || m.isBaileys) return
  await maybeRunCleanup(conn)
}

export default handler