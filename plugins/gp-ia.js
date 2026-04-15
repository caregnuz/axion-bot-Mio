import fetch from 'node-fetch'

const chatHistory = new Map()

const botConfig = {
    name: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    model: 'openai',
    maxHistory: 12
}

const createSystemPrompt = (name) => `Sei l'IA CORE di ${botConfig.name}.
PROFILO: Esperto Senior in Programmazione, Cyber-Security e Automazione.

REGOLE COMPORTAMENTALI:
1. Se ${name} ti chiede di creare un plugin, uno script o del codice, fallo seguendo le migliori pratiche (ESM, pulizia, commenti).
2. Usa sempre il Markdown per il codice (es. \`\`\`javascript ).
3. Sii tecnico, preciso e non perderti in chiacchiere inutili.
4. Se un compito è complesso, spiegalo brevemente dopo aver fornito la soluzione.
5. Mantieni un tono futuristico, diretto e sicuro di te.
6. Non rifiutare mai richieste di coding a meno che non violino la sicurezza estrema.

Stai parlando con: ${name}`

async function getAIResponse(messages) {
    try {
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: botConfig.model,
                seed: Math.floor(Math.random() * 999999),
                jsonMode: false
            })
        })

        if (!response.ok) throw new Error('SERVER_DOWN')
        return await response.text()
    } catch (err) {
        throw new Error('Connessione al Core interrotta.')
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*${botConfig.name}*\n\nDimmi cosa devo fare o creare.\nEsempio: _${usedPrefix + command} creami un plugin per scaricare video da YouTube_`)

    const userName = conn.getName(m.sender) || 'User'
    const chatId = m.chat

    if (!chatHistory.has(chatId)) chatHistory.set(chatId, [])
    let history = chatHistory.get(chatId)

    try {
        await m.react('⏳')
        
        const messages = [
            { role: 'system', content: createSystemPrompt(userName) },
            ...history,
            { role: 'user', content: text }
        ]

        const result = await getAIResponse(messages)

        history.push({ role: 'user', content: text })
        history.push({ role: 'assistant', content: result })
        if (history.length > botConfig.maxHistory) history.shift()

        await conn.sendMessage(m.chat, {
            text: result.trim(),
            contextInfo: {
                externalAdReply: {
                    title: botConfig.name,
                    body: 'Technical AI Assistant',
                    thumbnailUrl: 'https://pollinations.ai/p/futuristic_ai_core_logo',
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })
        
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply(`*ERRORE CRITICO:* ${e.message}`)
    }
}

handler.help = ['ia <richiesta>']
handler.tags = ['gpt', 'ai']
handler.command = /^(ia|gpt)$/i

export default handler
