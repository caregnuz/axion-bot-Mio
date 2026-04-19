//versione con m.reply con variabili funzionanti e il who  (se non taggavi nessuno provava a usare il testo puro come ID

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Estrazione bersaglio robusta
    let rawTarget = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
    if (!rawTarget && text) rawTarget = text;

    if (!rawTarget) {
        return conn.sendMessage(m.chat, { 
            text: `⚠️ Tagga o scrivi il numero della persona da segnalare.\n\nEsempio: ${usedPrefix}${command} @utente` 
        }, { quoted: m });
    }

    // Estrae solo i numeri per formare un JID valido
    const targetNumber = rawTarget.replace(/[^0-9]/g, '');
    if (targetNumber.length < 10) {
        return conn.sendMessage(m.chat, { text: '❌ Numero o tag non valido.' }, { quoted: m });
    }
    const who = targetNumber + '@s.whatsapp.net';

    if (who === conn.user.jid) {
        return conn.sendMessage(m.chat, { text: '❌ Non posso segnalare me stesso.' }, { quoted: m });
    }

    await conn.sendMessage(m.chat, { 
        text: `🚀 Avvio segnalazione forzata contro @${targetNumber}...`, 
        mentions: [who] 
    }, { quoted: m });

    try {
        for (let i = 0; i < 5; i++) {
            // Tentativo di Segnalazione
            try {
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
                });
            } catch (e) {
                console.log("Tentativo report fallito, procedo col blocco...");
            }

            // Blocco e Sblocco ripetuto
            await conn.updateBlockStatus(who, 'block');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa 1 sec
            await conn.updateBlockStatus(who, 'unblock');
            await new Promise(resolve => setTimeout(resolve, 1000)); // Pausa 1 sec
        }

        // Blocco definitivo finale
        await conn.updateBlockStatus(who, 'block');

        await conn.sendMessage(m.chat, { 
            text: `✅ Operazione completata. L'utente @${targetNumber} è stato segnalato ripetutamente e bloccato definitivamente dal bot.`, 
            mentions: [who] 
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '❌ Errore durante l\'operazione. È probabile che WhatsApp abbia limitato le azioni del bot.' }, { quoted: m });
    }
}

handler.help = ['segnala']
handler.tags = ['owner']
handler.command = /^(segna|segnala)$/i
handler.owner = true 

export default handler