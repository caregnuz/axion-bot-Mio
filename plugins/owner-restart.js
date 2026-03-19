//Plugin restart by Bonzino

const handler = async (m, { conn, isOwner }) => {
    await m.reply('♻️ Riavvio del bot in corso...');

    // compstibile con PM2
    process.exit(0);
};

handler.help = ['restart'];
handler.tags = ['owner'];
handler.command = /^restart$/i;
handler.owner = true

export default handler;
