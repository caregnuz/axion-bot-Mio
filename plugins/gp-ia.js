import fetch from 'node-fetch'

const chatHistory = new Map()

const personalityTraits = {
    umorismo: 0.8,
    informalità: 0.9,
    empatia: 0.7
}

const createSystemPrompt = (mentionName) => `𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - IA CORE

Sei un assistente IA avanzato creato per 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓.

PERSONALITÀ:
- Sei diretto, intelligente e molto naturale
- Usi un linguaggio moderno e fluido
- Sei leggermente provocatorio ma utile
- Non sei robotico, sembri umano

INTERAZIONE CON ${mentionName}:
- Ti rivolgi sempre usando il suo nome
- Mantieni una conversazione naturale
- Sei empatico e attento al contesto
- Ricordi il flow della chat

STILE:
- Italiano principale
- Risposte chiare e non troppo lunghe
- Niente emoji inutili
- Tono leggermente futuristico

REGOLE:
- Non essere formale
- Non inventare informazioni false
- Non essere eccessivamente lungo
- Mantieni identità 𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓

Stai parlando con ${mentionName}`

const formatHistory = (history) => {
    if (!history.length) return []
    return history.slice(-5).map(msg => {
        const [role, content] = msg.split(': ', 2)
        return {
            role: role === 'assistant' ? 'assistant' : 'user',
            content
        }
    })
}

async function callPollinationsAPI(messages) {
    try {
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: 'openai',
                seed: Math.floor(Math.random() * 1000)
            }),
            timeout: 8000
        })

        if (!response.ok) throw new Error('AI OFFLINE')

        const data = await response.text()
        return data.trim()
    } catch (e) {
        console.error('AI ERROR:', e)
        throw new Error('ERRORE GENERAZIONE RISPOSTA IA')
    }
}

const getNomeFormattato = (userId, conn) => {
    try {
        let nome = conn.getName(userId)

        if (!nome || nome === 'user') {
            nome = global.db?.data?.users?.[userId]?.name || 'amico'
        }

        nome = nome
            .replace(/@.+/, '')
            .replace(/[0-9]/g, '')
            .replace(/[^\w\s]/gi, '')
            .trim()

        return nome || 'amico'
    } catch (e) {
        console.error('NAME ERROR:', e)
        return 'amico'
    }
}

const formatKeywords = (text) => {
    const keywords = [
        'importante', 'nota', 'attenzione', 'ricorda',
        'consiglio', 'errore', 'successo', 'conclusione'
    ]

    let out = text

    keywords.forEach(k => {
        const regex = new RegExp(`\\b${k}\\b`, 'gi')
        out = out.replace(regex, `*${k}*`)
    })

    return out.replace(/\n(?=[-•])/g, '\n\n')
}

let handler = async (m, { conn, text }) => {
    if (!text?.trim()) {
        return m.reply(`𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 - IA

Usa:
.ia <testo>

Esempio:
.ia raccontami una storia`)
    }

    try {
        const mentionName = getNomeFormattato(m.sender, conn)
        const chatId = m.chat

        if (!chatHistory.has(chatId)) chatHistory.set(chatId, [])

        const history = chatHistory.get(chatId)

        const messages = [
            { role: 'system', content: createSystemPrompt(mentionName) },
            ...formatHistory(history),
            { role: 'user', content: text }
        ]

        const wait = await m.reply('𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 sta elaborando...')

        const risposta = await callPollinationsAPI(messages)

        if (!risposta) throw new Error('NO RESPONSE AI')

        const formatted = formatKeywords(risposta)

        history.push(`${mentionName}: ${text}`)
        history.push(`assistant: ${formatted}`)
        chatHistory.set(chatId, history)

        await conn.sendMessage(m.chat, {
            text: formatted,
            edit: wait.key,
            mentions: [m.sender]
        })

    } catch (error) {
        console.error('IA ERROR:', error)
        m.reply(`𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓 ERROR:\n${error.message}`)
    }
}

handler.help = ['ia <testo>']
handler.tags = ['ia', 'axion']
handler.command = ['chatgpt', 'gpt', 'ia']
handler.group = false
handler.owner = false

export default handler