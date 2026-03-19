// Foxa - plugin by Bonzino
import fs from "fs"
import path from "path"

let handler = async (m, { conn }) => {
  const  audio = path.join(process.cwd(), "media", "foxa.wav")

  if (!fs.existsSync(videoPath)) {
    return conn.sendMessage(
      m.chat,
      { text: "❌ File audio non trovato" },
      { quoted: m }
    )
  }

  const  audioBuffer = fs.readFileSync( audioPath)

  await conn.sendMessage(
    m.chat,
    {
     audio:  audioBuffer,
      mimetype: " audio/wav"
    },
    { quoted: m }
  )
}

handler.help = ["foxa"]
handler.tags = ["fun"]
handler.command = ["foxa"]

export default handler
