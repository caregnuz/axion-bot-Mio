import { createCanvas, loadImage } from 'canvas'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fallbackAvatar = path.join(__dirname, '../../media/default-avatar.png')

export async function createMuteCard(usernameOrOptions = 'Utente', avatarArg, isMuteArg) {
  let username = 'Utente'
  let avatar = fallbackAvatar
  let isMute = false

  if (typeof usernameOrOptions === 'object') {
    username = usernameOrOptions.username || 'Utente'
    avatar = usernameOrOptions.avatar || fallbackAvatar
    isMute = usernameOrOptions.isMute === true
  } else {
    username = usernameOrOptions || 'Utente'
    avatar = avatarArg || fallbackAvatar
    isMute = isMuteArg === true
  }

  const width = 1200
  const height = 628

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  const mainColor = isMute ? '#ff2e63' : '#00ff9d'
  const title = isMute ? 'MUTE ATTIVATO' : 'MUTE RIMOSSO'
  const status = isMute ? 'SILENZIATO' : 'ATTIVO'

  const bg = ctx.createLinearGradient(0, 0, width, height)
  bg.addColorStop(0, '#050505')
  bg.addColorStop(1, '#111111')

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = mainColor
  ctx.fillRect(0, 0, 38, height)

  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.035)'
    ctx.fillRect(0, i * 42, width, 2)
  }

  ctx.fillStyle = 'rgba(255,255,255,0.055)'
  roundRect(ctx, 95, 72, 1010, 484, 38, true)

  let avatarImg

  try {
    avatarImg = await loadImage(avatar)
  } catch {
    avatarImg = await loadImage(fallbackAvatar)
  }

  ctx.save()
  ctx.beginPath()
  ctx.arc(295, 314, 118, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(avatarImg, 177, 196, 236, 236)
  ctx.restore()

  ctx.beginPath()
  ctx.arc(295, 314, 132, 0, Math.PI * 2)
  ctx.strokeStyle = mainColor
  ctx.lineWidth = 9
  ctx.stroke()

  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 62px Sans'
  ctx.fillText(title, 500, 245)

  ctx.fillStyle = '#d6d6d6'
  ctx.font = '36px Sans'

  const safeName = String(username).length > 24
    ? String(username).slice(0, 24) + '...'
    : String(username)

  ctx.fillText(safeName, 503, 313)

  ctx.fillStyle = isMute ? 'rgba(255,46,99,0.18)' : 'rgba(0,255,157,0.18)'
  roundRect(ctx, 500, 365, 360, 92, 24, true)

  ctx.strokeStyle = mainColor
  ctx.lineWidth = 4
  roundRect(ctx, 500, 365, 360, 92, 24, false, true)

  ctx.fillStyle = mainColor
  ctx.font = 'bold 38px Sans'
  ctx.fillText(status, 590, 424)

  ctx.fillStyle = 'rgba(255,255,255,0.32)'
  ctx.font = 'bold 28px Sans'
  ctx.fillText('ΔXION BOT', 865, 505)

  return canvas.toBuffer('image/jpeg')
}

export const generateMuteCard = createMuteCard

function roundRect(ctx, x, y, width, height, radius, fill = false, stroke = false) {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()

  if (fill) ctx.fill()
  if (stroke) ctx.stroke()
}