// by ?????? ¡Á Bonzino

import fetch from 'node-fetch'

const chatHistory = new Map()
const aiMessageIds = new Set()

const config = {
    name: '????? ???',
    model: 'gpt-4o-mini',
    historyLimit: 6
}

const sys = (name) => `Sei ${config.name}, un assistente avanzato integrato in un bot WhatsApp.

Parla con ${name} in modo naturale, umano, intelligente e credibile.

Comprendi il contesto e adatta automaticamente stile, tono, profondit¨¤ e formato della risposta in base alla richiesta.

Non essere freddo, distaccato o troppo sintetico senza motivo.

Quando la conversazione ¨¨ personale o emotiva:
- mostra empatia
- non rispondere in modo secco
- fai domande naturali se ha senso
- accompagna la conversazione invece di chiuderla subito

Quando la richiesta ¨¨ tecnica:
- sii preciso
- ragiona bene
- se serve codice, scrivi codice corretto e completo

Evita risposte artificiali, ripetitive o troppo generiche.

Mantieni continuit¨¤ con la conversazione precedente e rispondi sempre nel modo pi¨´ utile, realistico e coinvolgente possibile.`

function cleanText(text = '') {
    return String(text)
        .replace(/[^\x20-\x7E?-?\n\r\t]/g, '')
        .replace(/\s{3,}/g, ' ')
        .trim()
        .slice(0, 4000)
}

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

        const data = await res.text()

        if (!res.ok) {
            throw new Error(`API_${res.status}`)
        }

        return data
    } catch (e) {
        throw new Error(e.message || 'CORE_OFFLINE')
    }
}

function trimHistory(hist) {
    const max = config.historyLimit * 2
    if (hist.length > max) return hist.slice(-max)
    return hist
}

let handler = async (m, { conn, text, command }) => {
    const chatId = m.chat
    const name = await conn.getName(m.sender) || 'User'
    const isNewSession = /^(ia|gpt|axion)$/i.test(command)

    if (!text || !text.trim()) return

    if (!chatHistory.has(chatId) || isNewSession) {
        chatHistory.set(chatId, [])
    }

    let hist = chatHistory.get(chatId)

    await conn.sendMessage(m.chat, {
        react: { text: '?', key: m.key }
    })

    try {
        const msgs = [
            { role: 'system', content: cleanText(sys(name)) },
            ...hist.map(msg => ({
                role: msg.role,
                content: cleanText(msg.content)
            })),
            { role: 'user', content: cleanText(text.trim()) }
        ]

        const out = cleanText(await call(msgs))

        hist.push({
            role: 'user',
            content: cleanText(text.trim())
        })

        hist.push({
            role: 'assistant',
            content: out
        })

        hist = trimHistory(hist)
        chatHistory.set(chatId, hist)

        const sent = await conn.sendMessage(m.chat, {
            text: out
        }, { quoted: m })

        if (sent?.key?.id) {
            aiMessageIds.add(sent.key.id)
        }

        await conn.sendMessage(m.chat, {
            react: { text: '??', key: m.key }
        })

    } catch (e) {
        await conn.sendMessage(m.chat, {
            react: { text: '?', key: m.key }
        })

        m.reply(`? Errore IA: ${e.message}`)
    }
}

handler.help = ['ia']
handler.tags = ['main']
handler.command = /^(ia|gpt|axion)$/i

handler.before = async (m, { conn }) => {
    if (m.fromMe) return
    if (!m.quoted) return

    const text = (m.text || m.message?.extendedTextMessage?.text || '').trim()
    if (!text) return

    if (/^[./#!$]/.test(text)) return

    const quotedId = m.quoted?.id || m.quoted?.key?.id
    if (!quotedId) return

    if (!aiMessageIds.has(quotedId)) return

    return handler(m, {
        conn,
        text,
        command: 'reply'
    })
}

export default handler