let handler = async (m, { conn }) => {

  await conn.sendMessage(m.chat, {
    text: 'TEST',
    ...global.rcanal
  }, { quoted: m })

}

handler.help = ['testheader']
handler.tags = ['test']
handler.command = /^(test)$/i

export default handler