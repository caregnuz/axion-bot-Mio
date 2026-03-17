var handler = async (m, { conn, args, usedPrefix, command }) => {
    // Determina quale comando è stato usato o l'argomento
    let rawCommand = args[0] ? args[0].toLowerCase() : command.toLowerCase();

    const actionCommand = {
        'chiudi': 'chiuso',
        'apri': 'aperto',
        'chiuso': 'chiuso',
        'aperto': 'aperto'
    }[rawCommand];

    const isClose = {
        'aperto': 'not_announcement',
        'chiuso': 'announcement',
        'apri': 'not_announcement',
        'chiudi': 'announcement',
    }[actionCommand];

    // Se il comando non è chiaro, mostra i bottoni iniziali
    if (!isClose) {
        const buttons = [
            { buttonId: `${usedPrefix}apri`, buttonText: { displayText: '🔓 APRI GRUPPO' }, type: 1 },
            { buttonId: `${usedPrefix}chiudi`, buttonText: { displayText: '🔒 CHIUDI GRUPPO' }, type: 1 }
        ];

        const msg = {
            text: `⚙️ *GESTIONE GRUPPO*\n\n` +
                  `✨ Scegli una delle opzioni per gestire lo stato del gruppo:\n\n` +
                  `• *${usedPrefix}apri / ${usedPrefix}aperto* - Apri il gruppo e consenti a tutti di scrivere 💬\n` +
                  `• *${usedPrefix}chiudi / ${usedPrefix}chiuso* - Chiudi il gruppo, solo admin possono scrivere 🔒\n\n` +
                  `Oppure usa i bottoni qui sotto:`,
            buttons,
            headerType: 1
        };

        return conn.sendMessage(m.chat, msg, { quoted: m });
    }

    // Esegui l'azione sul gruppo
    await conn.groupSettingUpdate(m.chat, isClose);

    // Messaggio di conferma
    const oppositeCommand = actionCommand === 'aperto' ? 'chiudi' : 'apri';
    const toggleButtons = [
        { 
            buttonId: `${usedPrefix}${oppositeCommand}`, 
            buttonText: { displayText: oppositeCommand === 'apri' ? '🔓 APRI GRUPPO' : '🔒 CHIUDI GRUPPO' }, 
            type: 1 
        }
    ];

    const confirmMessage = {
        text: `🎯 *STATO DEL GRUPPO AGGIORNATO*\n\n` +
              `✅ Il gruppo è ora *${actionCommand === 'aperto' ? '🔓 APERTO' : '🔒 CHIUSO'}*\n` +
              `💡 Puoi cambiare lo stato in qualsiasi momento usando i bottoni qui sotto.`,
        buttons: toggleButtons,
        headerType: 1,
        contextInfo: global.fake
    };

    await conn.sendMessage(m.chat, confirmMessage, { quoted: m });
};

handler.help = ['aperto/chiuso', 'apri/chiudi'];
handler.tags = ['gruppo'];
handler.command = /^(aperto|chiuso|apri|chiudi)$/i;
handler.admin = true;
handler.botAdmin = true;

export default handler;