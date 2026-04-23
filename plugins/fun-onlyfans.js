import { createCanvas, loadImage } from 'canvas'

const handler = async (m, { conn, args }) => {
  const cleanNumber = (txt = '') => {
    const match = txt.replace(/\D/g, '')
    return match.length >= 6 ? match : null
  }

  let target =
    m.quoted?.sender ||
    m.mentionedJid?.[0]

  if (!target) {
    const num = cleanNumber(args.join(' '))
    if (num) target = num + '@s.whatsapp.net'
  }

  if (!target) target = m.sender

  const targetNumber = target.split('@')[0]

  const getDisplayName = async () => {
    try {
      const name = await conn.getName(target)
      if (name && name !== target) return name
    } catch {}

    if (m.quoted?.sender === target) {
      return m.quoted.pushName || m.quoted.name || `@${targetNumber}`
    }

    if (target === m.sender) {
      return m.pushName || `@${targetNumber}`
    }

    return `@${targetNumber}`
  }

  const nome = (await getDisplayName())?.slice(0, 22)

  const random = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  const formatNum = n => n.toLocaleString('it-IT')

  const id = random(100000, 999999)
  const prezzo = random(7, 39)
  const followers = random(5000, 850000)
  const post = random(10, 420)
  const likes = random(20000, 1200000)
  const verified = Math.random() < 0.35
  const onlineNow = random(120, 7800)

  const bioList = [
    'Solo per veri fan',
    'Contenuti esclusivi ogni giorno',
    'Accesso VIP senza limiti',
    'Premium content',
    'Nuovi contenuti ogni settimana',
    'DM aperti per richieste speciali'
  ]

  const bio = bioList[Math.floor(Math.random() * bioList.length)]

  let avatarUrl
  try {
    avatarUrl = await conn.profilePictureUrl(target, 'image')
  } catch {
    avatarUrl = 'https://i.imgur.com/8Km9tLL.png'
  }

  const avatar = await loadImage(avatarUrl)

  let ofLogo = null
  try {
    ofLogo = await loadImage('./media/onlyfans-logo.png')
  } catch {}

  const canvas = createCanvas(900, 1200)
  const ctx = canvas.getContext('2d')

  const roundRect = (x, y, w, h, r) => {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  const removeWhiteBg = (x, y, w, h) => {
    const imgData = ctx.getImageData(x, y, w, h)
    const data = imgData.data

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]

      if (a === 0) continue

      if (r > 240 && g > 240 && b > 240) {
        data[i + 3] = 0
      }
    }

    ctx.putImageData(imgData, x, y)
  }

  const bg = ctx.createLinearGradient(0, 0, 0, canvas.height)
  bg.addColorStop(0, '#0d0f14')
  bg.addColorStop(1, '#171a22')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.save()
  ctx.filter = 'blur(18px) brightness(0.45)'
  ctx.drawImage(avatar, 0, 0, canvas.width, 330)
  ctx.restore()

  const topOverlay = ctx.createLinearGradient(0, 0, canvas.width, 0)
  topOverlay.addColorStop(0, 'rgba(0,175,240,0.90)')
  topOverlay.addColorStop(1, 'rgba(0,123,181,0.95)')
  ctx.fillStyle = topOverlay
  ctx.fillRect(0, 0, canvas.width, 150)

  if (ofLogo) {
    const logoW = 520
    const logoH = 120
    const logoX = (canvas.width - logoW) / 2
    const logoY = 18

    ctx.drawImage(ofLogo, logoX, logoY, logoW, logoH)
    removeWhiteBg(logoX, logoY, logoW, logoH)
  } else {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 54px Sans'
    ctx.fillText('OnlyFans', 450, 92)
  }

  ctx.fillStyle = '#11141b'
  roundRect(75, 165, 750, 885, 34)
  ctx.fill()

  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 2
  roundRect(75, 165, 750, 885, 34)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(450, 325, 150, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,0.35)'
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.arc(450, 315, 135, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(avatar, 315, 180, 270, 270)
  ctx.restore()

  const borderGrad = ctx.createLinearGradient(315, 180, 585, 450)
  borderGrad.addColorStop(0, '#34c7ff')
  borderGrad.addColorStop(1, '#008fd6')
  ctx.beginPath()
  ctx.arc(450, 315, 138, 0, Math.PI * 2)
  ctx.strokeStyle = borderGrad
  ctx.lineWidth = 6
  ctx.stroke()

  ctx.fillStyle = '#30d158'
  ctx.beginPath()
  ctx.arc(560, 405, 14, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 40px Sans'
  ctx.textAlign = 'center'
  ctx.fillText(nome, 450, 505)

  if (verified) {
    ctx.fillStyle = '#00aff0'
    ctx.beginPath()
    ctx.arc(645, 490, 17, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 20px Sans'
    ctx.fillText('✓', 645, 497)
  }

  ctx.font = '24px Sans'
  ctx.fillStyle = '#9ca3af'
  ctx.fillText(`ID: OF${id}`, 450, 545)

  ctx.font = '22px Sans'
  ctx.fillStyle = '#d5d7dd'
  ctx.fillText(`${formatNum(onlineNow)} online ora`, 450, 585)

  ctx.fillStyle = '#171b24'
  roundRect(145, 620, 610, 82, 22)
  ctx.fill()

  ctx.font = '22px Sans'
  ctx.fillStyle = '#e6e7eb'
  ctx.fillText(bio, 450, 670)

  const statBoxes = [
    { x: 125, label: 'Followers', value: formatNum(followers) },
    { x: 355, label: 'Post', value: formatNum(post) },
    { x: 585, label: 'Like', value: formatNum(likes) }
  ]

  for (const box of statBoxes) {
    ctx.fillStyle = '#171b24'
    roundRect(box.x, 735, 190, 120, 24)
    ctx.fill()

    ctx.font = 'bold 28px Sans'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(box.value, box.x + 95, 792)

    ctx.font = '20px Sans'
    ctx.fillStyle = '#9ca3af'
    ctx.fillText(box.label, box.x + 95, 830)
  }

  const priceGrad = ctx.createLinearGradient(255, 885, 645, 885)
  priceGrad.addColorStop(0, '#00aff0')
  priceGrad.addColorStop(1, '#008fd6')
  ctx.fillStyle = priceGrad
  roundRect(255, 885, 390, 72, 36)
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 30px Sans'
  ctx.fillText(`${prezzo}€ / mese`, 450, 932)

  const btnGrad = ctx.createLinearGradient(205, 985, 695, 985)
  btnGrad.addColorStop(0, '#ffffff')
  btnGrad.addColorStop(1, '#e9eef2')
  ctx.fillStyle = btnGrad
  roundRect(205, 985, 490, 92, 28)
  ctx.fill()

  ctx.fillStyle = '#00aff0'
  ctx.font = 'bold 30px Sans'
  ctx.fillText('ABBONATI ORA', 450, 1042)

  ctx.globalAlpha = 0.7
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px Sans'
  ctx.fillText('AXION BOT', 450, 1152)
  ctx.globalAlpha = 1

  const buffer = canvas.toBuffer('image/png')

  await conn.sendMessage(m.chat, {
    image: buffer,
    caption: `🔞 *Profilo onlyfans di* ${nome}`,
    mentions: [target]
  }, { quoted: m })
}

handler.help = ['onlyfans <@tag/numero>']
handler.tags = ['fun']
handler.command = /^onlyfans$/i

export default handler