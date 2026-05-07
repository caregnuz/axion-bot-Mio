

import { execFile } from 'child_process'

const FOOTER = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'

function S(v) {
  return String(v || '')
}

function execCmd(cmd, args = [], timeout = 60000) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { timeout }, (error, stdout, stderr) => {
      if (error) return reject(new Error(S(stderr || stdout || error.message).slice(0, 1200)))
      resolve(stdout || stderr || '')
    })
  })
}

function normalizeNumber(input) {
  let number = S(input).replace(/[^\d+]/g, '')
  if (number.startsWith('00')) number = '+' + number.slice(2)
  if (!number.startsWith('+') && number.startsWith('39')) number = '+' + number
  if (!number.startsWith('+') && number.length >= 9) number = '+39' + number
  return number
}

async function react(m, emoji) {
  try {
    await m.react(emoji)
  } catch {}
}

function cleanOutput(raw) {
  const text = S(raw).trim()
  if (!text) return null

  try {
    const jsonStart = text.indexOf('{')
    const jsonEnd = text.lastIndexOf('}')
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(text.slice(jsonStart, jsonEnd + 1))
    }
  } catch {}

  return text
}

function pick(...values) {
  return values.find(v => v !== undefined && v !== null && S(v).trim()) || 'N/D'
}

function formatResult(number, data) {
  if (!data) {
    return `*╭━━━━━━━📞━━━━━━━╮*
*✦ 𝐈𝐍𝐅𝐎 𝐍𝐔𝐌𝐄𝐑𝐎 ✦*
*╰━━━━━━━📞━━━━━━━╯*

*📱 𝐍𝐮𝐦𝐞𝐫𝐨:* *${number}*
*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨.*

> ${FOOTER}`
  }

  if (typeof data === 'string') {
    return `*╭━━━━━━━📞━━━━━━━╮*
*✦ 𝐈𝐍𝐅𝐎 𝐍𝐔𝐌𝐄𝐑𝐎 ✦*
*╰━━━━━━━📞━━━━━━━╯*

*📱 𝐍𝐮𝐦𝐞𝐫𝐨:* *${number}*

\`\`\`
${data.slice(0, 2500)}
\`\`\`

> ${FOOTER}`
  }

  const item = Array.isArray(data?.data) ? data.data[0] : data?.data || data

  const name = pick(
    item?.name,
    item?.profile?.name,
    item?.result?.name,
    item?.details?.name
  )

  const altName = pick(
    item?.altName,
    item?.alternateName,
    item?.nameDetails?.alternateName
  )

  const country = pick(
    item?.countryDetails?.name,
    item?.country,
    item?.countryName,
    item?.addresses?.[0]?.countryCode
  )

  const carrier = pick(
    item?.phones?.[0]?.carrier,
    item?.carrier,
    item?.provider
  )

  const type = pick(
    item?.phones?.[0]?.type,
    item?.type
  )

  const spam = pick(
    item?.spamInfo?.spamScore,
    item?.spamScore,
    item?.spam
  )

  const email = pick(
    item?.internetAddresses?.[0]?.id,
    item?.email
  )

  return `*╭━━━━━━━📞━━━━━━━╮*
*✦ 𝐈𝐍𝐅𝐎 𝐍𝐔𝐌𝐄𝐑𝐎 ✦*
*╰━━━━━━━📞━━━━━━━╯*

*📱 𝐍𝐮𝐦𝐞𝐫𝐨:* *${number}*
*👤 𝐍𝐨𝐦𝐞:* *${name}*
*📝 𝐍𝐨𝐦𝐞 𝐚𝐥𝐭𝐞𝐫𝐧𝐚𝐭𝐢𝐯𝐨:* *${altName}*
*🌍 𝐏𝐚𝐞𝐬𝐞:* *${country}*
*📡 𝐎𝐩𝐞𝐫𝐚𝐭𝐨𝐫𝐞:* *${carrier}*
*☎️ 𝐓𝐢𝐩𝐨:* *${type}*
*📧 𝐄𝐦𝐚𝐢𝐥:* *${email}*
*🚨 𝐒𝐩𝐚𝐦:* *${spam}*

> ${FOOTER}`
}

let handler = async (m, { conn, args, usedPrefix }) => {
  try {
    await react(m, '🔎')

    const number = normalizeNumber(args.join(''))

    if (!number || number.length < 8) {
      await react(m, '⚠️')
      return conn.reply(
        m.chat,
        `*╭━━━━━━━📞━━━━━━━╮*
*✦ 𝐔𝐒𝐎 ✦*
*╰━━━━━━━📞━━━━━━━╯*

*📌 𝐂𝐨𝐦𝐚𝐧𝐝𝐨:* *${usedPrefix}infonum +393331234567*

> ${FOOTER}`,
        m
      )
    }

    const wait = await conn.sendMessage(m.chat, {
      text: '*🔎 𝐑𝐢𝐜𝐞𝐫𝐜𝐚 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐳𝐢𝐨𝐧𝐢 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...*'
    }, { quoted: m }).catch(() => null)

    let raw

    try {
      raw = await execCmd('npx', ['truecallerjs', '-s', number, '--json'], 60000)
    } catch {
      raw = await execCmd('truecallerjs', ['-s', number, '--json'], 60000)
    }

    const parsed = cleanOutput(raw)

    try {
      if (wait?.key) await conn.sendMessage(m.chat, { delete: wait.key })
    } catch {}

    await conn.sendMessage(m.chat, {
      text: formatResult(number, parsed)
    }, { quoted: m })

    await react(m, '✅')

  } catch (e) {
    console.error('Errore infonum:', e?.message || e)
    await react(m, '❌')

    await conn.reply(
      m.chat,
      `*╭━━━━━━━⚠️━━━━━━━╮*
*✦ 𝐄𝐑𝐑𝐎𝐑𝐄 ✦*
*╰━━━━━━━⚠️━━━━━━━╯*

*❌ 𝐑𝐢𝐜𝐞𝐫𝐜𝐚 𝐧𝐨𝐧 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐚.*

\`\`\`
${S(e?.message || e).slice(0, 1000)}
\`\`\`

> ${FOOTER}`,
      m
    )
  }
}

handler.help = ['infonum <numero>']
handler.tags = ['owner']
handler.command = /^(infonum|numinfo|lookupnum)$/i
handler.owner = true

export default handler