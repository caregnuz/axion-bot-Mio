import fs from 'fs'
import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`*⚠️ Formato richiesto:*
${usedPrefix + command} Descrizione | Link GitHub

*Esempio:*
${usedPrefix + command} Sistema avanzato di gestione | https://github.com/Axion/Axion-Bot`)

    let [desc, git] = text.split('|').map(v => v.trim())
    if (!desc) return m.reply(`*❌ Inserisci almeno una descrizione!*`)

    const botName = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
    m.reply('🌌 *ACCESSO OWNER AUTORIZZATO.*\nInizializzazione protocollo 𝛥𝐗𝐈𝚶𝐍...')

    // Configurazione Sezione GitHub
    let githubSection = git ? `
        <div class="card">
            <h2 class="cyan-text">💾 SOURCE CODE</h2>
            <p>Accedi alla repository ufficiale su GitHub per aggiornamenti e documentazione.</p>
            <a href="${git}" class="btn git-btn" target="_blank">GITHUB REPO</a>
        </div>` : ''

    // Struttura HTML Completa
    let htmlContent = `
<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${botName} - Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@300;500;700&display=swap" rel="stylesheet">
    <style>
        :root { --bg: #050505; --panel: rgba(20, 20, 30, 0.8); --accent: #00f2ff; --secondary: #7000ff; --text: #e0e0e0; }
        body { font-family: 'Rajdhani', sans-serif; background-color: var(--bg); color: var(--text); margin: 0; text-align: center; }
        header { padding: 100px 20px; background: linear-gradient(to bottom, rgba(0, 242, 255, 0.1), transparent); }
        h1 { font-family: 'Orbitron', sans-serif; font-size: 3.5rem; letter-spacing: 5px; background: linear-gradient(90deg, var(--accent), var(--secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; }
        .container { max-width: 900px; margin: -50px auto 50px auto; padding: 0 20px; }
        .card { background: var(--panel); backdrop-filter: blur(10px); border: 1px solid rgba(0, 242, 255, 0.2); border-radius: 20px; padding: 40px; margin-bottom: 30px; }
        .cyan-text { color: var(--accent); font-family: 'Orbitron', sans-serif; }
        .btn { display: inline-block; padding: 15px 35px; border-radius: 50px; text-decoration: none; font-weight: bold; font-family: 'Orbitron', sans-serif; transition: 0.4s; margin-top: 20px; }
        .main-btn { background: linear-gradient(45deg, var(--accent), var(--secondary)); color: white; }
        .git-btn { border: 2px solid var(--accent); color: var(--accent); }
        footer { padding: 40px; font-size: 0.8rem; color: #555; letter-spacing: 2px; }
    </style>
</head>
<body>
    <header>
        <h1>𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓</h1>
        <p style="color: var(--accent);">STAZIONE DI CONTROLLO OPERATIVA</p>
    </header>
    <div class="container">
        <div class="card">
            <h2 class="cyan-text">OVERVIEW</h2>
            <p style="font-size: 1.1rem;">${desc}</p>
            <a href="https://wa.me/${conn.user.jid.split('@')[0]}" class="btn main-btn">AVVIA PROTOCOLLO</a>
        </div>
        ${githubSection}
    </div>
    <footer>© 2026 AXION CORP. EXCLUSIVE OWNER ACCESS.</footer>
</body>
</html>`

    const path = `./tmp/AxionPortal_${m.sender.split('@')[0]}.html`
    if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp')
    fs.writeFileSync(path, htmlContent)

    try {
        const form = new FormData()
        form.append('file', fs.createReadStream(path))
        
        const res = await fetch('https://file.io/?expires=1d', {
            method: 'POST',
            body: form
        })
        
        const json = await res.json()
        
        let linkMsg = `🛸 *𝛥𝐗𝐈𝚶𝐍 𝐏𝐎𝐑𝐓𝐀𝐋 𝐆𝐄𝐍𝐄𝐑𝐀𝐓𝐄𝐃*\n\n`
        linkMsg += `🌐 *Link Sito:* ${json.link}\n`
        linkMsg += `🛡️ *Privilegi:* Solo Owner\n`
        linkMsg += `⏳ *Scadenza Link:* 24 Ore\n\n`
        linkMsg += `Il file HTML è stato allegato per l'archiviazione permanente.`

        await conn.sendMessage(m.chat, { text: linkMsg }, { quoted: m })
        
        await conn.sendMessage(m.chat, { 
            document: fs.readFileSync(path), 
            fileName: `AXION_PORTAL.html`, 
            mimetype: 'text/html'
        }, { quoted: m })

    } catch (e) {
        m.reply('❌ Errore nel caricamento online, invio solo il file locale.')
        await conn.sendMessage(m.chat, { document: fs.readFileSync(path), fileName: `AXION_PORTAL.html`, mimetype: 'text/html' }, { quoted: m })
    }

    if (fs.existsSync(path)) fs.unlinkSync(path)
}

handler.help = ['creasito']
handler.tags = ['owner']
handler.command = /^(creasito|makesite)$/i
handler.owner = true 

export default handler
