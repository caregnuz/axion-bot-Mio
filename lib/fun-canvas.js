/* Libreria canvas per effetti immagini e generatori grafici dei plugin fun
by Bonzino*/

import fetch from 'node-fetch'
import { createCanvas, loadImage } from 'canvas'

export function getTargetJid(m) {
  return m.mentionedJid?.[0] || m.quoted?.sender || m.sender
}

export async function getTargetName(conn, jid) {
  try {
    return conn.getName(jid) || jid.split('@')[0]
  } catch {
    return jid.split('@')[0]
  }
}

export async function getProfileBuffer(conn, jid) {
  const pp = await conn.profilePictureUrl(jid, 'image').catch(() => null)

  if (!pp) {
    throw new Error('*⚠️ 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 𝐧𝐨𝐧 𝐡𝐚 𝐮𝐧𝐚 𝐟𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨.*')
  }

  const res = await fetch(pp)

  if (!res.ok) {
    throw new Error('*⚠️ 𝐍𝐨𝐧 𝐬𝐨𝐧𝐨 𝐫𝐢𝐮𝐬𝐜𝐢𝐭𝐨 𝐚 𝐫𝐞𝐜𝐮𝐩𝐞𝐫𝐚𝐫𝐞 𝐥𝐚 𝐟𝐨𝐭𝐨 𝐩𝐫𝐨𝐟𝐢𝐥𝐨.*')
  }

  return Buffer.from(await res.arrayBuffer())
}

export function drawHeart(ctx, x, y, width, height) {
  const topCurveHeight = height * 0.3

  ctx.beginPath()
  ctx.moveTo(x, y + topCurveHeight)
  ctx.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight)
  ctx.bezierCurveTo(x - width / 2, y + (height + topCurveHeight) / 2, x, y + (height + topCurveHeight) / 2, x, y + height)
  ctx.bezierCurveTo(x, y + (height + topCurveHeight) / 2, x + width / 2, y + (height + topCurveHeight) / 2, x + width / 2, y + topCurveHeight)
  ctx.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight)
  ctx.closePath()
}

export async function createILoveImage(name) {
  const width = 1080
  const height = 1080
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, width, height)

  const fontFace = '"Arial Rounded MT Bold", "Helvetica Neue", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  const firstLineY = height * 0.35
  const heartSize = 350

  ctx.fillStyle = 'black'
  ctx.font = `bold 300px ${fontFace}`

  const iWidth = ctx.measureText('I').width
  const iX = width / 2 - iWidth / 2 - heartSize / 1.5

  ctx.fillText('I', iX, firstLineY)

  const heartX = iX + iWidth + heartSize / 1.5
  const heartY = firstLineY - heartSize / 2

  drawHeart(ctx, heartX, heartY, heartSize, heartSize)

  ctx.fillStyle = '#FF0000'
  ctx.fill()

  ctx.fillStyle = 'black'

  let fontSize = 280
  ctx.font = `bold ${fontSize}px ${fontFace}`

  const maxTextWidth = width * 0.9
  const finalName = String(name || '').toUpperCase()

  while (ctx.measureText(finalName).width > maxTextWidth && fontSize > 40) {
    fontSize -= 10
    ctx.font = `bold ${fontSize}px ${fontFace}`
  }

  ctx.fillText(finalName, width / 2, height * 0.75)

  return canvas.toBuffer('image/jpeg')
}

export async function applyPrideEffect(bufferImmagine, tipoEffetto) {
  let img = await loadImage(bufferImmagine)

  const maxSize = 800

  if (img.width > maxSize || img.height > maxSize) {
    const scala = Math.min(maxSize / img.width, maxSize / img.height)
    const canvasTemp = createCanvas(img.width * scala, img.height * scala)
    const ctxTemp = canvasTemp.getContext('2d')

    ctxTemp.drawImage(img, 0, 0, img.width * scala, img.height * scala)
    img = await loadImage(canvasTemp.toBuffer())
  }

  const canvas = createCanvas(img.width, img.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(img, 0, 0)

  const coloriPride = {
    gay: ['#E40303', '#FF8C00', '#FFED00', '#008563', '#409CFF', '#955ABE'],
    trans: ['#5BCEFA', '#F5A9B8', '#FFFFFF', '#F5A9B8', '#5BCEFA']
  }

  const colori = coloriPride[tipoEffetto]

  ctx.globalAlpha = 0.45

  const gradient = ctx.createLinearGradient(0, 0, 0, img.height)

  colori.forEach((colore, index) => {
    gradient.addColorStop(index / colori.length, colore)
    gradient.addColorStop((index + 1) / colori.length, colore)
  })

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, img.width, img.height)

  ctx.globalCompositeOperation = 'overlay'
  ctx.drawImage(img, 0, 0)

  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'

  return canvas.toBuffer('image/jpeg')
}

export async function applySplashEffect(bufferImmagine) {
  let img = await loadImage(bufferImmagine)

  const maxSize = 800

  if (img.width > maxSize || img.height > maxSize) {
    const scala = Math.min(maxSize / img.width, maxSize / img.height)
    const canvasTemp = createCanvas(img.width * scala, img.height * scala)
    const ctxTemp = canvasTemp.getContext('2d')

    ctxTemp.drawImage(img, 0, 0, img.width * scala, img.height * scala)
    img = await loadImage(canvasTemp.toBuffer())
  }

  const canvas = createCanvas(img.width, img.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(img, 0, 0)

  const colori = ['#FFFFFF', '#E6F3FF', '#F0F8FF']

  ctx.shadowColor = '#FFFFFF'
  ctx.shadowBlur = 15

  const numeroGocce = Math.min(25, Math.floor((img.width * img.height) / 15000) + 12)

  for (let i = 0; i < numeroGocce; i++) {
    const x = gaussianRandom(img.width / 2, img.width / 3.5)
    const y = gaussianRandom(img.height / 2, img.height / 3.5)
    const dimensione = Math.random() * 40 + 20

    disegnaGoccia(ctx, x, y, dimensione, colori)
  }

  ctx.shadowBlur = 0

  return canvas.toBuffer('image/jpeg')
}

export function gaussianRandom(mean, sigma) {
  const u = Math.random()
  const v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)

  return z * sigma + mean
}

export function disegnaGoccia(ctx, x, y, dimensione, colori) {
  ctx.save()
  ctx.translate(x, y)

  const rotazione = (Math.random() - 0.5) * Math.PI / 3
  const scalaX = 1 + (Math.random() - 0.5) * 0.4
  const scalaY = 1 + (Math.random() - 0.5) * 0.4

  ctx.rotate(rotazione)
  ctx.scale(scalaX, scalaY)

  const raggioHalo = dimensione * 1.8
  const gradienteHalo = ctx.createRadialGradient(0, 0, dimensione * 0.3, 0, 0, raggioHalo)

  gradienteHalo.addColorStop(0, colori[0] + '99')
  gradienteHalo.addColorStop(0.5, colori[1] + '55')
  gradienteHalo.addColorStop(1, colori[0] + '00')

  ctx.globalAlpha = 0.4
  ctx.beginPath()
  ctx.arc(0, 0, raggioHalo, 0, Math.PI * 2)
  ctx.fillStyle = gradienteHalo
  ctx.fill()

  ctx.globalAlpha = 0.6
  ctx.beginPath()
  ctx.moveTo(0, -dimensione * 0.9)
  ctx.bezierCurveTo(dimensione * 0.7, -dimensione * 0.5, dimensione * 0.8, dimensione * 0.6, 0, dimensione * 0.9)
  ctx.bezierCurveTo(-dimensione * 0.8, dimensione * 0.6, -dimensione * 0.7, -dimensione * 0.5, 0, -dimensione * 0.9)
  ctx.closePath()

  const gradienteGoccia = ctx.createLinearGradient(0, -dimensione * 0.9, dimensione * 0.4, dimensione * 0.9)

  gradienteGoccia.addColorStop(0, colori[0] + 'FF')
  gradienteGoccia.addColorStop(0.5, colori[1] + 'DD')
  gradienteGoccia.addColorStop(1, colori[2] + 'BB')

  ctx.fillStyle = gradienteGoccia
  ctx.fill()

  ctx.globalAlpha = 0.5
  ctx.shadowBlur = 8

  const numeroGocceSecondarie = Math.floor(Math.random() * 8) + 10

  for (let i = 0; i < numeroGocceSecondarie; i++) {
    const angolo = Math.random() * Math.PI * 2
    const distanza = Math.random() * dimensione + dimensione * 0.7
    const dx = Math.cos(angolo) * distanza
    const dy = Math.sin(angolo) * distanza
    const raggio = Math.random() * 8 + 4
    const scalaEllisse = 1 + (Math.random() - 0.5) * 0.7

    ctx.save()
    ctx.translate(dx, dy)
    ctx.scale(scalaEllisse, 1 / scalaEllisse)
    ctx.beginPath()
    ctx.arc(0, 0, raggio, 0, Math.PI * 2)
    ctx.fillStyle = colori[1] + 'DD'
    ctx.fill()
    ctx.restore()
  }

  ctx.restore()
}