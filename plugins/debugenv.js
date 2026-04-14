//by Bonzino

let handler = async (m) => {
  try {
    const key = process.env.FIVESIM_KEY

    if (!key) {
      return m.reply('*❌ ENV NON LETTO*\n\nFIVESIM_KEY non trovata.')
    }

    const masked =
      key.length > 20
        ? `${key.slice(0, 10)}...${key.slice(-10)}`
        : key

    let txt = `*✅ ENV LETTO CORRETTAMENTE*\n\n`
    txt += `🔑 *FIVESIM_KEY:*\n\`${masked}\`\n\n`
    txt += `📏 Lunghezza: ${key.length}`

    return m.reply(txt)

  } catch (e) {
    return m.reply('*❌ ERRORE DEBUG ENV*')
  }
}

handler.command = ['debugenv']
export default handler