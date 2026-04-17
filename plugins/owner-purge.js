
//By Bonzino 

let handler = async (m, { conn, participants, isBotAdmin, command }) => {
    if (!m.isGroup) return

    const jidOwner = global.owner.map(o => o[0] + '@s.whatsapp.net')
    if (!jidOwner.includes(m.sender)) return

    if (!isBotAdmin) return

    const usaLinkAttuale = /^purgef$/i.test(command)

    let metadatiGruppo = null
    let nomePrecedente = ''
    let partecipanti = []
    let nuovoLinkInvito = ''

    try {
        metadatiGruppo = await conn.groupMetadata(m.chat)
        nomePrecedente = metadatiGruppo.subject || 'Gruppo'
        partecipanti = metadatiGruppo.participants || []
    } catch (e) {
        console.error('Errore recupero metadata gruppo:', e)
        return m.reply('Errore nel recupero delle informazioni del gruppo.')
    }

    try {
        await conn.groupRevokeInvite(m.chat)
        const codiceInvito = await conn.groupInviteCode(m.chat)
        nuovoLinkInvito = `https://chat.whatsapp.com/${codiceInvito}`
    } catch (e) {
        console.error('Errore reset link:', e)
    }

    const linkDestinazione = usaLinkAttuale
        ? nuovoLinkInvito
        : (global.NuovoGruppoLink || '')

    try {
        const suffisso = '𝐒𝐯𝐭 𝐛𝐲 𝕯𝖊ⱥ𝖉𝖑𝐲 & 𝕭𝖔𝖓𝖟𝖎𝖓𝖔'
        const nomeAggiornato = nomePrecedente.includes(suffisso)
            ? nomePrecedente
            : `${nomePrecedente} | ${suffisso}`

        await conn.groupUpdateSubject(m.chat, nomeAggiornato)
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e)
    }

    const tuttiJid = partecipanti
        .map(p => p.jid || p.id)
        .filter(Boolean)
        
 const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net'

let usersToRemove = partecipanti
    .map(p => p.jid || p.id)
    .filter(jid =>
        jid &&
        jid !== botId &&
        !jidOwner.includes(jid)
    )

    await conn.sendMessage(m.chat, {
        text: "𝕷𝖆 𝖘𝖊𝖓𝖙𝖊𝖓𝖟𝖆 𝖋𝖎𝖓𝖆𝖑𝖊 è 𝖘𝖙𝖆𝖙𝖆 𝖕𝖗𝖔𝖓𝖚𝖓𝖈𝖎𝖆𝖙𝖆. 𝕿𝖗𝖆 𝖕𝖔𝖈𝖍𝖎 𝖎𝖘𝖙𝖆𝖓𝖙𝖎 𝖛𝖊𝖗𝖗𝖊𝖙𝖊 𝖙𝖗𝖆𝖛𝖔𝖑𝖙𝖎 𝖉𝖆𝖑𝖑𝖆 𝖕𝖚𝖗𝖎𝖋𝖎𝖈𝖆𝖟𝖎𝖔𝖓𝖊. 𝕴 𝖛𝖔𝖘𝖙𝖗𝖎 𝖓𝖔𝖒𝖎 𝖈𝖆𝖉𝖗𝖆𝖓𝖓𝖔. 𝕷𝖊 𝖛𝖔𝖘𝖙𝖗𝖊 𝖕𝖗𝖊𝖘𝖊𝖓𝖟𝖊 𝖛𝖊𝖗𝖗𝖆𝖓𝖓𝖔 𝖈𝖆𝖓𝖈𝖊𝖑𝖑𝖆𝖙𝖊. 𝕺𝖌𝖓𝖎 𝖛𝖔𝖘𝖙𝖗𝖆 𝖙𝖗𝖆𝖈𝖈𝖎𝖆 𝖘𝖆𝖗à 𝖈𝖔𝖓𝖘𝖊𝖌𝖓𝖆𝖙𝖆 𝖆𝖑 𝖛𝖚𝖔𝖙𝖔. 𝕼𝖚𝖆𝖓𝖉𝖔 𝖙𝖚𝖙𝖙𝖔 𝖘𝖆𝖗à 𝖈𝖔𝖒𝖕𝖎𝖚𝖙𝖔, 𝖗𝖊𝖘𝖙𝖊𝖗𝖆𝖓𝖓𝖔 𝖘𝖔𝖑𝖙𝖆𝖓𝖙𝖔 𝖘𝖎𝖑𝖊𝖓𝖟𝖎𝖔, 𝖈𝖊𝖓𝖊𝖗𝖊 𝖊 𝖎𝖑 𝖗𝖎𝖈𝖔𝖗𝖉𝖔 𝖉𝖎 𝖈𝖎ò 𝖈𝖍𝖊 𝖊𝖗𝖆𝖛𝖆𝖙𝖊 𝖕𝖗𝖎𝖒𝖆 𝖉𝖊𝖑𝖑𝖆 𝖋𝖎𝖓𝖊."
    }, { quoted: m })

    await new Promise(resolve => setTimeout(resolve, 1000))

    await conn.sendMessage(m.chat, {
        text: `*𝔾ℝ𝕌ℙℙ𝕆 ℙ𝕌ℝ𝕀𝔽𝕀ℂ𝔸𝕋𝕆*

*𝐄𝐧𝐭𝐫𝐚𝐭𝐞 𝐭𝐮𝐭𝐭𝐢 𝐪𝐮𝐢:* ${linkDestinazione || '𝐋𝐢𝐧𝐤 𝐧𝐨𝐧 𝐜𝐨𝐧𝐟𝐢𝐠𝐮𝐫𝐚𝐭𝐨 𝐢𝐧 private.js'} `,
        mentions: tuttiJid
    }, { quoted: m })
    
    if (usaLinkAttuale) return
    if (!usersToRemove.length) return
        try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove')
    } catch (e) {
        console.error(e)
        await m.reply("Errore durante l'esecuzione.")
    }
}

handler.command = ['purge', 'purgef']
handler.group = true
handler.botAdmin = true
handler.owner = true

export default handler