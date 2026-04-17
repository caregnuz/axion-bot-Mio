// by Bonzino

import gis from 'g-i-s'

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[randomIndex]] = [array[randomIndex], array[i]]
  }
}

function cleanQuery(text = '') {
  return String(text).replace(/\s+/g, ' ').trim()
}

function pickImageUrl(item = {}) {
  return item.url || item.image || item.thumbnail || null
}

function cercaImmagini(query) {
  return new Promise((resolve, reject) => {
    gis(query, (error, results) => {
      if (error) reject(error)
      else resolve(results || [])
    })
  })
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const searchTerm = cleanQuery(text || m.quoted?.text || m.quoted?.caption || '')

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

    if (!results || !results.length) {
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

    const validResults = []

    for (const item of results) {
      const imageUrl = pickImageUrl(item)
      if (!imageUrl || typeof imageUrl !== 'string') continue
      if (!/^https?:\/\//i.test(imageUrl)) continue

      validResults.push({
        image: imageUrl,
        title: cleanQuery(item.title || searchTerm),
        source: cleanQuery(item.source || item.domain || 'Google Images'),
        pageUrl: item.url || imageUrl
      })
    }

    if (!validResults.length) {
      await conn.sendMessage(m.chat, {
        react: { text: '❌', key: m.key }
      })

      return conn.sendMessage(m.chat, {
        text:
`*❌ 𝐍𝐞𝐬𝐬𝐮𝐧𝐚 𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐞 𝐯𝐚𝐥𝐢𝐝𝐚 𝐭𝐫𝐨𝐯𝐚𝐭𝐚 𝐩𝐞𝐫:*
*${searchTerm}*`,
        contextInfo: global.rcanal?.contextInfo || {}
      }, { quoted: m })
    }

    shuffle(validResults)

    const item = validResults[0]

    await conn.sendMessage(m.chat, {
      image: { url: item.image },
      caption:
`*📸 𝐑𝐢𝐬𝐮𝐥𝐭𝐚𝐭𝐨 𝐭𝐫𝐨𝐯𝐚𝐭𝐨*

*🔎 𝐑𝐢𝐜𝐞𝐫𝐜𝐚:* *${searchTerm}*
*🖼️ 𝐓𝐢𝐭𝐨𝐥𝐨:* *${item.title}*
*🌐 𝐅𝐨𝐧𝐭𝐞:* *${item.source}*`,
      footer: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
      buttons: [
        {
          buttonId: `${usedPrefix}cercaimmagine ${searchTerm}`,
          buttonText: { displayText: '🔄 𝐀𝐥𝐭𝐫𝐞 𝐢𝐦𝐦𝐚𝐠𝐢𝐧𝐢' },
          type: 1
        }
      ],
      headerType: 4,
      contextInfo: {
        ...(global.rcanal?.contextInfo || {}),
        externalAdReply: {
          title: item.title,
          body: searchTerm,
          thumbnailUrl: item.image,
          sourceUrl: item.pageUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
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

*𝐑𝐢𝐩𝐫𝐨𝐯𝐚 𝐭𝐫𝐚 𝐩𝐨𝐜𝐨.*`,
      contextInfo: global.rcanal?.contextInfo || {}
    }, { quoted: m })
  }
}

handler.help = ['cercaimmagine <query>']
handler.tags = ['search']
handler.command = /^(cercaimmagine|cercaimg|searchimg|searchpicture)$/i

export default handler