let handler = async (m) => {
  try {
    await import('sharp')
    m.reply('✅ sharp OK')
  } catch {
    m.reply('❌ sharp NON installato')
  }
}

handler.command = /^checksharp$/i
handler.owner = true

export default handler