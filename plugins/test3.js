let handler = async (m, { conn }) => {
    await conn.sendMessage(m.chat, {
        text: '',
        contextInfo: await global.axionContext(conn, m.sender)
    })
}

handler.command = ['test3']
export default handler