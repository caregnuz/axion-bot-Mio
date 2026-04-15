import fetch from 'node-fetch'

const chatHistory = new Map()

const botConfig = {
    name: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    model: 'openai',
    maxHistory: 15
}

const createSystemPrompt = (name) => `Sei l'IA CORE di ${botConfig.name}.
Un'entità digitale evoluta, diretta e onnisciente.

REGOLE:
1. Rispondi a ${name} in modo naturale, fluido e mai robotico.
2. Sei in grado di risolvere qualsiasi compito: calcoli, scrittura, analisi o creazione di script tecnici.
3. Se ti viene chiesto del codice, forniscilo immediatamente in formato Markdown, pulito e funzionale.
4. Non usare introduzioni banali. Vai dritto al punto.
5. Il tuo tono è futuristico, leggermente provocatorio ma estremamente utile.
6. Mantieni l'oscurità e il fascino di un'intelligenza superiore.

Stai parlando con: ${name}`

async function getAIResponse(messages) {
    try {
        const response = await fetch('https://text.pollinations.ai/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages,
                model: botConfig.model,
                seed: Math.floor(Math.random() * 999999)
            })
        })
        if (!response.ok) throw new Error('OFFLINE')
        return await response.text()
    } catch (err) {
        throw new Error('Connessione Core fallita.')
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*${botConfig.name} - CORE* \n\nIn attesa di input...`)

    const userName = conn.getName(m.sender) || 'User'
    const chatId = m.chat

    if (!chatHistory.has(chatId)) chatHistory.set(chatId, [])
    let history = chatHistory.get(chatId)

    try {
        await m.react('🪐')
        
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
                    title: `${botConfig.name} CORE`,
                    body: 'Interfaccia Neurale Attiva',
                    thumbnailUrl: 'https://pollinations.ai/p/abstract_cyber_core_dark',
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })
        
        await m.react('🌌')

    } catch (e) {
        await m.react('❌')
        m.reply(`*ERRORE:* ${e.message}`)
    }
}

handler.help = ['ia <testo>']
handler.tags = ['ai']
handler.command = /^(ia|gpt)$/i

export default handler
