// by Bonzino

import axios from 'axios'

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[randomIndex]] = [array[randomIndex], array[i]]
  }
}

function cleanQuery(text = '') {
  return String(text).replace(/\s+/g, ' ').trim()
}

async function cercaImmagini(query) {
  const url = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&safeSearch=off`

  const { data } = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    },
    timeout: 20000
  })

  const matches = [
    ...data.matchAll(/murl&quot;:&quot;(.*?)&quot;/g)
  ]

  return matches.map(v => ({
    image: v[1]
      .replace(/\\u002f/g, '/')
      .replace(/\\/g, '')
  }))
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const searchTerm = cleanQuery(
      text ||
      m.quoted?.text ||
      m.quoted?.caption ||
      ''
    )

    if (!searchTerm) {
      return conn.sendMessage(m.chat, {
        text:
`*⚠️ 𝐈𝐧𝐬𝐞𝐫𝐢𝐬𝐜𝐢 𝐜𝐢𝐨̀ 𝐜𝐡𝐞 𝐯𝐮𝐨𝐢 𝐜𝐞𝐫𝐜𝐚𝐫𝐞*

*𝐄𝐬𝐞𝐦𝐩𝐢𝐨:*
*${usedPrefix + command} gatti neri*`,
        contextInfo: global.rcanal?.contextInfo || {}
      }, { quoted: m })
    }

    await conn.sendMessage(m.chat, {
      react: { text: '🔎', key: m.key }
    })

    const results = await cercaImmagini(searchTerm)

    if (!results.length) {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      })

      return conn.sendMessage(m.chat, {
        text:
`*❌ 𝐍𝐞𝐬𝐬𝐮𝐧 𝐫𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨 𝐩𝐞𝐫:*
*${searchTerm}*`,
        contextInfo: global.rcanal?.contextInfo || {}
      }, { quoted: m })
    }

    shuffle(results)

    const item = results[0]

    await conn.sendMessage(m.chat, {
      image: { url: item.image || item.url },
      caption:
`*📸 𝐑𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨*

*🔎 𝐑𝐢𝐜𝐞𝐫𝐜𝐚:* *${searchTerm}*`,
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: [
        {
          buttonId: `${usedPrefix}cercaimmagine ${searchTerm}`,
          buttonText: {
            displayText: '🔄 𝐀𝐥𝐭𝐫𝐞 𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐢'
          },
          type: 1
        }
      ],
      headerType: 4,
      contextInfo: global.rcanal?.contextInfo || {}
    }, { quoted: m })

    await conn.sendMessage(m.chat, {
      react: { text: '✅', key: m.key }
    })

  } catch (e) {
    console.error('cercaimmagine error:', e)

    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    }).catch(() => {})

    return conn.sendMessage(m.chat, {
      text:
`*❌ 𝐄𝐫𝐫𝐨𝐫𝐞 𝐧𝐞𝐥𝐥𝐚 𝐫𝐢𝐜𝐞𝐫𝐜𝐚 𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐢*

\`\`\`
${e?.message || e}
\`\`\``,
      contextInfo: global.rcanal?.contextInfo || {}
    }, { quoted: m })
  }
}

handler.help = ['cercaimmagine <query>']
handler.tags = ['search']
handler.command = /^(cercaimmagine|cercaimg|searchimg|searchpicture)$/i

export default handler