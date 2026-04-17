// Plugin npm manager by Bonzino

import { execSync } from 'child_process'
import fs from 'fs'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  global.npmBusy = global.npmBusy || false

  if (!text && /^(npmi|npmrm|npmver|npmdl)$/i.test(command)) {
    return conn.reply(
      m.chat,
      `📦 *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*

𝐂𝐨𝐦𝐚𝐧𝐝𝐢 𝐝𝐢𝐬𝐩𝐨𝐧𝐢𝐛𝐢𝐥𝐢:

${usedPrefix}npmi nomepacchetto
𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐚 𝐮𝐧 𝐩𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨

${usedPrefix}npmi nomepacchetto,versione
𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐚 𝐮𝐧𝐚 𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞 𝐬𝐩𝐞𝐜𝐢𝐟𝐢𝐜𝐚

${usedPrefix}npmrm nomepacchetto
𝐑𝐢𝐦𝐮𝐨𝐯𝐞 𝐮𝐧 𝐩𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨

${usedPrefix}npmver nomepacchetto
𝐂𝐨𝐧𝐭𝐫𝐨𝐥𝐥𝐚 𝐥𝐚 𝐯𝐞𝐫𝐬𝐢𝐨𝐧𝐞 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐚

${usedPrefix}npmdl nomepacchetto
𝐒𝐜𝐚𝐫𝐢𝐜𝐚 𝐢𝐥 𝐩𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 𝐜𝐨𝐦𝐞 𝐟𝐢𝐥𝐞 .tgz

𝐄𝐬𝐞𝐦𝐩𝐢:

${usedPrefix}npmi axios
${usedPrefix}npmi chalk,5.3.0
${usedPrefix}npmrm axios
${usedPrefix}npmver chalk
${usedPrefix}npmdl lodash
${usedPrefix}npmdl axios,1.6.8`,
      m
    )
  }

  if (global.npmBusy) {
    return conn.reply(
      m.chat,
      '⚠️ 𝐂𝐞̀ 𝐠𝐢𝐚̀ 𝐮𝐧’𝐚𝐥𝐭𝐫𝐚 𝐨𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐍𝐏𝐌 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨.',
      m
    )
  }

  try {
    global.npmBusy = true

    let [pkg, version] = String(text || '').split(',').map(v => v.trim())
    version = version || 'latest'

    if (!pkg) {
      global.npmBusy = false
      return conn.reply(m.chat, '❌ 𝐍𝐨𝐦𝐞 𝐩𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 𝐦𝐚𝐧𝐜𝐚𝐧𝐭𝐞.', m)
    }

    if (!/^[a-zA-Z0-9@._/-]+$/.test(pkg)) {
      global.npmBusy = false
      return conn.reply(m.chat, '❌ 𝐍𝐨𝐦𝐞 𝐩𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.', m)
    }

    await conn.sendMessage(m.chat, {
      react: { text: '⏱️', key: m.key }
    }).catch(() => {})

    if (/^npmi$/i.test(command)) {
      await conn.reply(
        m.chat,
        `📦 *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*

𝐈𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐳𝐢𝐨𝐧𝐞 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...

𝐏𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨: ${pkg}
𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞: ${version}`,
        m
      )

      const installCmd = version === 'latest'
        ? `npm install ${JSON.stringify(pkg)} --save`
        : `npm install ${JSON.stringify(`${pkg}@${version}`)} --save`

      execSync(installCmd, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      })

      global.npmBusy = false

      await conn.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      }).catch(() => {})

      return conn.reply(
        m.chat,
        `✅ 𝐏𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨

𝐏𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨: ${pkg}
𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞: ${version}`,
        m
      )
    }

    if (/^npmrm$/i.test(command)) {
      await conn.reply(
        m.chat,
        `🗑️ *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*

𝐑𝐢𝐦𝐨𝐳𝐢𝐨𝐧𝐞 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...

𝐏𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨: ${pkg}`,
        m
      )

      execSync(`npm uninstall ${JSON.stringify(pkg)}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      })

      global.npmBusy = false

      await conn.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      }).catch(() => {})

      return conn.reply(
        m.chat,
        `✅ 𝐏𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 𝐫𝐢𝐦𝐨𝐬𝐬𝐨 𝐜𝐨𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐨

𝐏𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨: ${pkg}`,
        m
      )
    }

    if (/^npmver$/i.test(command)) {
      const packageJson = JSON.parse(fs.readFileSync('./package.json'))
      const dependencies = {
        ...(packageJson.dependencies || {}),
        ...(packageJson.devDependencies || {})
      }

      const installedVersion = dependencies[pkg]

      global.npmBusy = false

      await conn.sendMessage(m.chat, {
        react: { text: installedVersion ? '✅' : '❌', key: m.key }
      }).catch(() => {})

      if (!installedVersion) {
        return conn.reply(
          m.chat,
          `❌ 𝐈𝐥 𝐩𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 ${pkg} 𝐧𝐨𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚 𝐢𝐧𝐬𝐭𝐚𝐥𝐥𝐚𝐭𝐨.`,
          m
        )
      }

      return conn.reply(
        m.chat,
        `📦 *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*

𝐏𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨: ${pkg}
𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞: ${installedVersion}`,
        m
      )
    }

    if (/^npmdl$/i.test(command)) {
      await conn.reply(
        m.chat,
        `📁 *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*

𝐃𝐨𝐰𝐧𝐥𝐨𝐚𝐝 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...

𝐏𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨: ${pkg}
𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞: ${version}`,
        m
      )

      const output = execSync(`npm pack ${JSON.stringify(`${pkg}@${version}`)}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe']
      }).trim()

      if (!output || !fs.existsSync(output)) {
        global.npmBusy = false
        await conn.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        }).catch(() => {})
        return conn.reply(
          m.chat,
          '❌ 𝐈𝐥 𝐩𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 𝐧𝐨𝐧 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨 𝐨 𝐧𝐨𝐧 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐠𝐞𝐧𝐞𝐫𝐚𝐭𝐨 𝐚𝐥𝐜𝐮𝐧 𝐟𝐢𝐥𝐞.',
          m
        )
      }

      const stats = fs.statSync(output)
      const maxSize = 50 * 1024 * 1024

      if (stats.size > maxSize) {
        try {
          fs.unlinkSync(output)
        } catch {}

        global.npmBusy = false

        await conn.sendMessage(m.chat, {
          react: { text: '❌', key: m.key }
        }).catch(() => {})

        return conn.reply(
          m.chat,
          '❌ 𝐈𝐥 𝐩𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 𝐬𝐮𝐩𝐞𝐫𝐚 𝐢𝐥 𝐥𝐢𝐦𝐢𝐭𝐞 𝐝𝐢 50 𝐌𝐁.',
          m
        )
      }

      const fileBuffer = fs.readFileSync(output)

      const packageLink = version === 'latest'
        ? `https://www.npmjs.com/package/${pkg}`
        : `https://www.npmjs.com/package/${pkg}/v/${version}`

      await conn.sendMessage(
        m.chat,
        {
          document: fileBuffer,
          mimetype: 'application/gzip',
          fileName: output,
          caption:
`📦 𝐏𝐚𝐜𝐜𝐡𝐞𝐭𝐭𝐨 𝐬𝐜𝐚𝐫𝐢𝐜𝐚𝐭𝐨

𝐍𝐨𝐦𝐞: ${pkg}
𝐕𝐞𝐫𝐬𝐢𝐨𝐧𝐞: ${version}
𝐅𝐢𝐥𝐞: ${output}
𝐃𝐢𝐦𝐞𝐧𝐬𝐢𝐨𝐧𝐞: ${(stats.size / 1024 / 1024).toFixed(2)} MB

${packageLink}`
        },
        { quoted: m }
      )

      try {
        fs.unlinkSync(output)
      } catch {}

      global.npmBusy = false

      await conn.sendMessage(m.chat, {
        react: { text: '✅', key: m.key }
      }).catch(() => {})

      return
    }

    global.npmBusy = false
  } catch (e) {
    global.npmBusy = false

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    return conn.reply(
      m.chat,
      `❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐝𝐮𝐫𝐚𝐧𝐭𝐞 𝐥'𝐨𝐩𝐞𝐫𝐚𝐳𝐢𝐨𝐧𝐞 𝐧𝐩𝐦

${e.message}`,
      m
    )
  }
}

handler.help = ['npmi', 'npmrm', 'npmver', 'npmdl']
handler.tags = ['owner']
handler.command = /^(npmi|npmrm|npmver|npmdl)$/i
handler.owner = true

export default handler