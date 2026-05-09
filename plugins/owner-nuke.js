
let handler = async (m, { conn, participants, isBotAdmin }) => {
    if (!m.isGroup) return;

    const ownerJids = global.owner.map(o => o[0] + '@s.whatsapp.net');
    if (!ownerJids.includes(m.sender)) return;

    if (!isBotAdmin) return;

    const botId = conn.user.id.split(':')[0] + '@s.whatsapp.net';

    try {
        let metadata = await conn.groupMetadata(m.chat);
        let oldName = metadata.subject;
        let newName = `${oldName} | 𝐒𝐯𝐭 𝐛𝐲 𝕯𝖊ⱥ𝖉𝖑𝐲 & 𝕭𝖔𝖓𝖟𝖎𝖓𝖔`;
        await conn.groupUpdateSubject(m.chat, newName);
    } catch (e) {
        console.error('Errore cambio nome gruppo:', e);
    }

    let newInviteLink = '';
    try {
        await conn.groupRevokeInvite(m.chat); 
        let code = await conn.groupInviteCode(m.chat);
        newInviteLink = `https://chat.whatsapp.com/${code}`;
    } catch (e) {
        console.error('Errore reset link:', e);
    }

    let usersToRemove = participants
        .map(p => p.jid)
        .filter(jid =>
            jid &&
            jid !== botId &&
            !ownerJids.includes(jid)
        );

    if (!usersToRemove.length) return;

    let allJids = participants.map(p => p.jid);

    await conn.sendMessage(m.chat, {
        text: "𝕃𝕒 𝕤𝕖𝕟𝕥𝕖𝕟𝕫𝕒 𝕗𝕚𝕟𝕒𝕝𝕖 è 𝕤𝕥𝕒𝕥𝕒 𝕡𝕣𝕠𝕟𝕦𝕟𝕔𝕚𝕒𝕥𝕒. 𝕋𝕣𝕒 𝕡𝕠𝕔𝕙𝕚 𝕚𝕤𝕥𝕒𝕟𝕥𝕚 𝕧𝕖𝕣𝕣𝕖𝕥𝕖 𝕥𝕣𝕒𝕧𝕠𝕝𝕥𝕚 𝕕𝕒𝕝𝕝𝕒 𝕡𝕦𝕣𝕚𝕗𝕚𝕔𝕒𝕫𝕚𝕠𝕟𝕖. 𝕀 𝕧𝕠𝕤𝕥𝕣𝕚 𝕟𝕠𝕞𝕚 𝕔𝕒𝕕𝕣𝕒𝕟𝕟𝕠. 𝕃𝕖 𝕧𝕠𝕤𝕥𝕣𝕖 𝕡𝕣𝕖𝕤𝕖𝕟𝕫𝕖 𝕧𝕖𝕣𝕣𝕒𝕟𝕟𝕠 𝕔𝕒𝕟𝕔𝕖𝕝𝕝𝕒𝕥𝕖. 𝕆𝕘𝕟𝕚 𝕧𝕠𝕤𝕥𝕣𝕒 𝕥𝕣𝕒𝕔𝕔𝕚𝕒 𝕤𝕒𝕣à 𝕔𝕠𝕟𝕤𝕖𝕘𝕟𝕒𝕥𝕒 𝕒𝕝 𝕧𝕦𝕠𝕥𝕠. 𝕼𝕦𝕒𝕟𝕕𝕠 𝕥𝕦𝕥𝕥𝕠 𝕤𝕒𝕣à 𝕔𝕠𝕞𝕡𝕚𝕦𝕥𝕠, 𝕣𝕖𝕤𝕥𝕖𝕣𝕒𝕟𝕟𝕠 𝕤𝕠𝕝𝕥𝕒𝕟𝕥𝕠 𝕤𝕚𝕝𝕖𝕟𝕫𝕚𝕠, 𝕔𝕖𝕟𝕖𝕣𝕖 𝕖 𝕚𝕝 𝕣𝕚𝕔𝕠𝕣𝕕𝕠 𝕕𝕚 𝕔𝕚ò 𝕔𝕙𝕖 𝕖𝕣𝕒𝕧𝕒𝕥𝕖 𝕡𝕣𝕚𝕞𝕒 𝕕𝕖𝕝𝕝𝕒 𝕗𝕚𝕟𝕖."
    });

    await conn.sendMessage(m.chat, {
        text: `*𝔾ℝ𝕌ℙℙ𝕆 ℙ𝕌ℝ𝕀𝔽𝕀ℂ𝔸𝕋𝕆*\n*𝐄𝐧𝐭𝐫𝐚𝐭𝐞 𝐭𝐮𝐭𝐭𝐢 𝐪𝐮𝐢:*\n\nhttps://chat.whatsapp.com/EinCEcWFg0j2hBU6JPV4es  `,
        mentions: allJids
    });

    try {
        await conn.groupParticipantsUpdate(m.chat, usersToRemove, 'remove');
    } catch (e) {
        console.error(e);
        await m.reply("❌ Errore durante l'hard wipe.");
    }
};

handler.command = ['purgef'];
handler.group = true;
handler.botAdmin = true;
handler.owner = true;

export default handler;