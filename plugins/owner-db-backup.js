import fs from 'fs'
import path from 'path'

const BACKUP_DIR = path.resolve('./db-backup')

const BACKUP_INTERVAL_MINUTES = 5
const BACKUP_INTERVAL_MS = BACKUP_INTERVAL_MINUTES * 60 * 1000

const MAX_BACKUPS = 20

global.autoDbBackupState = global.autoDbBackupState || {
  started: false,
  interval: null
}

function ensureBackupDir() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true })
}

function getTimestamp() {
  const d = new Date()

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`
}

function getIntervalLabel() {

  if (BACKUP_INTERVAL_MINUTES < 60) {
    return `${BACKUP_INTERVAL_MINUTES} minuti`
  }

  if (BACKUP_INTERVAL_MINUTES % 60 === 0) {

    const hours = BACKUP_INTERVAL_MINUTES / 60

    return `${hours} ora${hours > 1 ? 'e' : ''}`
  }

  return `${BACKUP_INTERVAL_MINUTES} minuti`
}

function getSettingsKey(conn) {
  return conn?.user?.jid || 'main'
}

function isAutoEnabled(conn) {

  const key = getSettingsKey(conn)

  global.db.data.settings[key] ??= {}

  return !!global.db.data.settings[key].autoDbBackup
}

function setAutoEnabled(conn, value) {

  const key = getSettingsKey(conn)

  global.db.data.settings[key] ??= {}

  global.db.data.settings[key].autoDbBackup = !!value
}

function cleanupOldBackups() {

  ensureBackupDir()

  const files = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.endsWith('.json'))
    .map(file => ({
      file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtimeMs
    }))
    .sort((a, b) => b.time - a.time)

  for (let i = MAX_BACKUPS; i < files.length; i++) {
    try {
      fs.unlinkSync(files[i].path)
    } catch {}
  }
}

function createDatabaseBackup() {

  ensureBackupDir()

  cleanupOldBackups()

  const dbData =
    global.db?.data || {
      users: {},
      chats: {},
      settings: {}
    }

  const fileName =
    `database_backup_${getTimestamp()}.json`

  const filePath =
    path.join(BACKUP_DIR, fileName)

  fs.writeFileSync(
    filePath,
    JSON.stringify(dbData, null, 2)
  )

  return {
    fileName,
    filePath
  }
}

async function runAutoBackup(conn) {

  try {

    const { fileName } =
      createDatabaseBackup()

    console.log(
      `[*] Backup database creato: ${fileName}`
    )

  } catch (e) {

    console.error(
      'autodb backup error:',
      e
    )
  }
}

function startAutoBackupLoop(conn) {

  const state =
    global.autoDbBackupState

  if (state.interval) {
    clearInterval(state.interval)
  }

  if (isAutoEnabled(conn)) {
    runAutoBackup(conn)
  }

  state.interval = setInterval(async () => {

    if (!isAutoEnabled(conn)) return

    await runAutoBackup(conn)

  }, BACKUP_INTERVAL_MS)
}

let handler = async (
  m,
  {
    conn,
    command,
    args,
    isOwner,
    usedPrefix
  }
) => {

  if (!isOwner) {
    return m.reply(
`*𝐒𝐨𝐥𝐨 𝐢𝐥 𝐩𝐫𝐨𝐩𝐫𝐢𝐞𝐭𝐚𝐫𝐢𝐨 può 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*`
    )
  }

  const intervalLabel =
    getIntervalLabel()

  if (/^(backupdb|dbbackup)$/i.test(command)) {

    try {

      const { fileName } =
        createDatabaseBackup()

      return m.reply(
`*✅ 𝐁𝐚𝐜𝐤𝐮𝐩 𝐝𝐞𝐥 𝐝𝐚𝐭𝐚𝐛𝐚𝐬𝐞 𝐜𝐫𝐞𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨.*

*📁 𝐂𝐚𝐫𝐭𝐞𝐥𝐥𝐚:* *db-backup*
*🗂️ 𝐅𝐢𝐥𝐞:* *${fileName}*

*♻️ 𝐕𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐦𝐚𝐧𝐭𝐞𝐧𝐮𝐭𝐢 𝐠𝐥𝐢 𝐮𝐥𝐭𝐢𝐦𝐢:* *${MAX_BACKUPS} 𝐛𝐚𝐜𝐤𝐮𝐩*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
      )

    } catch (e) {

      return m.reply(
`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐢𝐥 𝐛𝐚𝐜𝐤𝐮𝐩.*

*🧾 𝐌𝐨𝐭𝐢𝐯𝐨:* *${e.message}*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
      )
    }
  }

  if (/^autodb$/i.test(command)) {

    const input =
      String(args[0] || '')
        .toLowerCase()
        .trim()

    if (!input) {

      const enabled =
        isAutoEnabled(conn)

      return m.reply(
`*🗂️ 𝐒𝐭𝐚𝐭𝐨 𝐀𝐮𝐭𝐨𝐁𝐚𝐜𝐤𝐮𝐩*

*⚙️ 𝐒𝐭𝐚𝐭𝐨:* *${enabled ? '𝐀𝐭𝐭𝐢𝐯𝐨' : '𝐃𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐨'}*
*⏱️ 𝐈𝐧𝐭𝐞𝐫𝐯𝐚𝐥𝐥𝐨:* *${intervalLabel}*
*📁 𝐂𝐚𝐫𝐭𝐞𝐥𝐥𝐚:* *db-backup*
*♻️ 𝐌𝐚𝐱 𝐛𝐚𝐜𝐤𝐮𝐩:* *${MAX_BACKUPS}*

*📌 𝐔𝐬𝐨:*
*${usedPrefix}autodb 1*
*${usedPrefix}autodb 0*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
      )
    }

    if ([
      '1',
      'on',
      'attiva',
      'enable',
      'start'
    ].includes(input)) {

      setAutoEnabled(conn, true)

      startAutoBackupLoop(conn)

      return m.reply(
`*✅ 𝐀𝐮𝐭𝐨𝐁𝐚𝐜𝐤𝐮𝐩 𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨.*

*📦 𝐈𝐥 𝐩𝐫𝐢𝐦𝐨 𝐛𝐚𝐜𝐤𝐮𝐩 𝐯𝐞𝐫𝐫à 𝐜𝐫𝐞𝐚𝐭𝐨 𝐬𝐮𝐛𝐢𝐭𝐨.*
*⏱️ 𝐁𝐚𝐜𝐤𝐮𝐩 𝐨𝐠𝐧𝐢:* *${intervalLabel}*
*📁 𝐂𝐚𝐫𝐭𝐞𝐥𝐥𝐚:* *db-backup*
*♻️ 𝐕𝐞𝐫𝐫𝐚𝐧𝐧𝐨 𝐦𝐚𝐧𝐭𝐞𝐧𝐮𝐭𝐢:* *${MAX_BACKUPS} 𝐛𝐚𝐜𝐤𝐮𝐩*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
      )
    }

    if ([
      '0',
      'off',
      'disattiva',
      'disable',
      'stop'
    ].includes(input)) {

      setAutoEnabled(conn, false)

      return m.reply(
`*❌ 𝐀𝐮𝐭𝐨𝐁𝐚𝐜𝐤𝐮𝐩 𝐝𝐢𝐬𝐚𝐭𝐭𝐢𝐯𝐚𝐭𝐨.*

*📁 𝐈 𝐛𝐚𝐜𝐤𝐮𝐩 𝐞𝐬𝐢𝐬𝐭𝐞𝐧𝐭𝐢 𝐫𝐞𝐬𝐭𝐚𝐧𝐨 𝐢𝐧:* *db-backup*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
      )
    }

    return m.reply(
`*⚠️ 𝐎𝐩𝐳𝐢𝐨𝐧𝐞 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐚.*

*📌 𝐔𝐬𝐚:*
*${usedPrefix}autodb 1*
*${usedPrefix}autodb 0*

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`
    )
  }
}

handler.before = async function (
  m,
  { conn }
) {

  const state =
    global.autoDbBackupState

  if (state.started) return

  state.started = true

  startAutoBackupLoop(conn)
}

handler.help = [
  'backupdb',
  'dbbackup',
  'autodb'
]

handler.tags = ['owner']

handler.command =
  /^(backupdb|dbbackup|autodb)$/i

handler.owner = true

export default handler