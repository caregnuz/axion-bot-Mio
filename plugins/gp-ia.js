// by deadly e Bonzino

import fetch from 'node-fetch'

const chatHistory = new Map()

const config = {
    name: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    model: 'openai',
    historyLimit: 15
}

const sys = (name) => `Sei ${config.name}.
Rispondi a ${name} seguendo fedelmente lo stile e la struttura degli esempi ricevuti.

REGOLE:
1. Se ricevi codice o strutture tecniche, rispondi SOLTANTO con il codice aggiornato.
2. NON aggiungere testo descrittivo, saluti o spiegazioni.
3. Se ricevi testo normale, sii sintetico e diretto.
4. Mantieni esattamente la logica e il formato che vedi nei messaggi precedenti.`

async function call(messages) {
    try {
        const res = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: config.model,
                seed: Math.floor(Math.random() * 999999)
            })
        })
        return await res.text()
    } catch (e) {
        throw new Error('CORE_OFFLINE')
    }
}

let handler = async (m, { conn, text, command, usedPrefix }) => {
    const chatId = m.chat
    const name = await conn.getName(m.sender) || 'User'

    const isReply = !!m.quoted
    const quotedText = m.quoted?.text || m.quoted?.caption || ''

    const isReplyToBot = isReply && (
        quotedText.includes('𝛥𝐗𝐈𝚶𝐍') ||
        quotedText.includes('AXION') ||
        m.quoted?.fromMe
    )

    const isNewSession = /^(ia|gpt|axion)$/i.test(command)

    if (!text && !(isReply && isReplyToBot)) return

    if (!chatHistory.has(chatId) || isNewSession) {
        chatHistory.set(chatId, [])
    }

    let hist = chatHistory.get(chatId)

    let prompt = text

    if (!prompt && isReply && isReplyToBot) {
        prompt = m.text || m.message?.extendedTextMessage?.text || ''
    }

    if (!prompt) return

    await conn.sendMessage(m.chat, {
        react: {
            text: '⏳',
            key: m.key
        }
    })

    try {
        const msgs = [
            { role: 'system', content: sys(name) },
            ...hist,
            { role: 'user', content: prompt }
        ]

        const out = await call(msgs)

        hist.push({ role: 'user', content: prompt })
        hist.push({ role: 'assistant', content: out })

        if (hist.length > config.historyLimit * 2) {
            hist = hist.slice(-config.historyLimit * 2)
            chatHistory.set(chatId, hist)
        }

        await conn.sendMessage(m.chat, {
            text: out.trim()
        }, { quoted: m })

        await conn.sendMessage(m.chat, {
            react: {
                text: '✅️',
                key: m.key
            }
        })

    } catch (e) {
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key
            }
        })

        m.reply(`[ERROR]: ${e.message}`)
    }
}

handler.help = ['ia']
handler.tags = ['main']
handler.command = /^(ia|gpt|axion)$/i

handler.before = async (m, { conn }) => {
    if (m.fromMe) return
    if (!m.quoted) return

    const quotedText = m.quoted?.text || m.quoted?.caption || ''

    const isReplyToBot = (
        quotedText.includes('𝛥𝐗𝐈𝚶𝐍') ||
        quotedText.includes('AXION') ||
        m.quoted?.fromMe
    )

    if (!isReplyToBot) return

    if (/^[./#!$]/.test(m.text || '')) return

    return handler(m, {
        conn,
        text: m.text || m.message?.extendedTextMessage?.text || '',
        command: 'reply'
    })
}

export default handler