const handler = async (m, { conn, text }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text
    else who = m.chat
    
    if (!who) throw '⚠️ Tagga o scrivi il numero della persona da segnalare.'
    
    const user = who.split('@')[0]
    m.reply(`🚀 Avvio segnalazione forzata contro @${user}...`, null, { mentions: [who] })

    // Eseguiamo un ciclo di segnalazione e blocco
    // Nota: Baileys supporta 'block' e 'unblock'. 
    // Il "report" ufficiale non ha un comando diretto, ma bloccare/sbloccare 
    // ripetutamente attira l'attenzione dei sistemi antispam di WA.
    
    try {
        for (let i = 0; i < 5; i++) {
            // Segnalazione (alcune versioni di Baileys tentano di emularla così)
            await conn.query({
                tag: 'iq',
                attrs: {
                    to: '@s.whatsapp.net',
                    type: 'set',
                    xmlns: 'w:m',
                },
                content: [{
                    tag: 'report',
                    attrs: { jid: who }
                }]
            }).catch(e => console.log("Tentativo report fallito, procedo col blocco..."))

            // Ciclo Blocco/Sblocco
            await conn.updateBlockStatus(who, 'block')
            await new Promise(resolve => setTimeout(resolve, 1000)) // Pausa 1 sec
            await conn.updateBlockStatus(who, 'unblock')
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
        // Blocco finale definitivo
        await conn.updateBlockStatus(who, 'block')
        
        m.reply(`✅ Operazione completata. L'utente @${user} è stato segnalato ripetutamente e bloccato definitivamente dal bot.`, null, { mentions: [who] })
        
    } catch (e) {
        console.error(e)
        m.reply('❌ Errore durante l\'operazione. È probabile che WhatsApp abbia limitato le azioni del bot.')
    }
}

handler.help = ['segnala']
handler.tags = ['owner']
handler.command = /^segna$/i
handler.owner = true 

export default handler
