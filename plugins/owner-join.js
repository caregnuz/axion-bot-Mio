const handler = async (m, { conn, text, args }) => {
    const link = args.length >= 1 ? args[0] : text
    const regex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i
    const match = link ? link.match(regex) : null

    if (!match) return m.reply('⚠️ Link non valido. Assicurati di inviare un link di WhatsApp corretto.')

    const code = match[1]

    try {
        const res = await conn.groupGetInviteInfo(code)
        await conn.groupAcceptInvite(code)

        let ownerJid = res.owner || ''
        let mentionsList = ownerJid ? [ownerJid] : []

        const isLid = ownerJid.includes('@lid')

        let contact = conn.contacts?.[ownerJid]

        if (isLid) {
            try {
                const metadata = await conn.groupMetadata(res.id)
                const realOwner =
                    metadata.owner ||
                    metadata.participants.find(p => p.admin === 'superadmin')?.id

                if (realOwner && !realOwner.includes('@lid')) {
                    ownerJid = realOwner
                    mentionsList = [ownerJid]
                    contact = conn.contacts?.[ownerJid]
                }
            } catch {}
        }

        const ownerName = contact?.notify || contact?.name || contact?.verifiedName || null
        const ownerDisplay = ownerName
            ? `@~${ownerName}`
            : ownerJid
                ? `@${ownerJid.split('@')[0]}`
                : 'Sconosciuto'

        await m.reply(`✅ *ENTRATO CON SUCCESSO*\n\n📌 *Gruppo:* ${res.subject}\n🆔 *ID:* ${res.id}\n👑 *Creatore:* ${ownerDisplay}`)

    } catch (e) {
        console.error(e)

        if (e.message?.includes('401') || e.message?.includes('not-authorized')) {
            return m.reply('❌ *IMPOSSIBILE ENTRARE*\nIl bot è stato rimosso o bannato da questo gruppo in precedenza.')
        }

        if (e.message?.includes('404') || e.message?.includes('resource-gone')) {
            return m.reply('❌ *LINK SCADUTO*\nIl link di invito è stato revocato o non è valido.')
        }

        m.reply('⚠️ Link non valido. Assicurati di inviare un link di WhatsApp corretto.')
    }
}

handler.help = ['join <link>']
handler.tags = ['owner']
handler.command = ['join', 'entra']
handler.owner = true

export default handler