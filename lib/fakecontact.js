import fetch from 'node-fetch'
import fs from 'fs'

async function getUserPfp(conn, jid) {
  try {
    return await conn.profilePictureUrl(jid, 'image')
  } catch {
    return './media/default-avatar.png'
  }
}

export async function createFakeContact(m, conn) {
  const userPfp = await getUserPfp(conn, m.sender)

  const displayName =
    m.pushName ||
    await conn.getName(m.sender).catch(() => null) ||
    'Utente'

  return {
    key: {
      participants: '0@s.whatsapp.net',
      fromMe: false,
      id: 'AXION'
    },
    message: {
      contactMessage: {
        displayName,
        vcard:
`BEGIN:VCARD
VERSION:3.0
FN:${displayName}
TEL;type=CELL;type=VOICE;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}
END:VCARD`,
        jpegThumbnail: Buffer.isBuffer(userPfp)
          ? userPfp
          : userPfp.startsWith('./')
            ? await fs.promises.readFile(userPfp)
            : await (await fetch(userPfp)).buffer()
      }
    },
    participant: '0@s.whatsapp.net'
  }
}