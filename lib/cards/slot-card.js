import fs from 'fs'
import path from 'path'
import { createCanvas, loadImage } from 'canvas'
import GIFEncoder from 'gifencoder'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

const fruits=['🍒','🍋','🍉','🍇','🍎','🍓']

const emojiMap={
'🍒':'1f352',
'🍋':'1f34b',
'🍉':'1f349',
'🍇':'1f347',
'🍎':'1f34e',
'🍓':'1f353',
'🥳':'1f973',
'🤡':'1f921'
}

const imageCache={}

export async function generateSlotMp4(finalResult,resultInfo){

const tmpDir=path.resolve('./tmp')
fs.mkdirSync(tmpDir,{recursive:true})

const id=Date.now()
const gifPath=path.join(tmpDir,`slot-${id}.gif`)
const mp4Path=path.join(tmpDir,`slot-${id}.mp4`)

const gifBuffer=await generateSlotGif(finalResult,resultInfo)

fs.writeFileSync(gifPath,gifBuffer)

await execFileAsync('ffmpeg',[
'-y',
'-i',gifPath,
'-movflags','faststart',
'-pix_fmt','yuv420p',
'-vf','scale=720:560',
mp4Path
])

try{fs.unlinkSync(gifPath)}catch{}

return mp4Path
}

async function generateSlotGif(finalResult,resultInfo){

const width=720
const height=560

const canvas=createCanvas(width,height)
const ctx=canvas.getContext('2d')

const encoder=new GIFEncoder(width,height)
const chunks=[]
const stream=encoder.createReadStream()

stream.on('data',chunk=>chunks.push(chunk))

encoder.start()
encoder.setRepeat(0)
encoder.setDelay(85)
encoder.setQuality(10)

for(let i=0;i<42;i++){

await drawSlotFrame(
ctx,
width,
height,
[pick(fruits),pick(fruits),pick(fruits),pick(fruits),pick(fruits)],
true,
null
)

encoder.addFrame(ctx)
}

encoder.setDelay(4000)

for(let i=0;i<10;i++){

await drawSlotFrame(
ctx,
width,
height,
finalResult,
false,
resultInfo
)

encoder.addFrame(ctx)
}

encoder.finish()

return await new Promise(resolve=>{
stream.on('end',()=>resolve(Buffer.concat(chunks)))
})
}

async function drawSlotFrame(ctx,width,height,result,spinning,resultInfo){

const reels=5
const rows=3

const bg=ctx.createLinearGradient(0,0,width,height)
bg.addColorStop(0,'#050505')
bg.addColorStop(1,'#151515')

ctx.fillStyle=bg
ctx.fillRect(0,0,width,height)

ctx.fillStyle='#00ff9d'
ctx.fillRect(0,0,width,7)
ctx.fillRect(0,height-7,width,7)

ctx.textAlign='center'

ctx.fillStyle='#ffffff'
ctx.font='bold 32px Sans'
ctx.fillText('✦ SLOT MACHINE ✦',width/2,44)

ctx.font='bold 40px Sans'
ctx.fillText('AXION BOT',width/2,88)

ctx.fillStyle='rgba(255,255,255,0.05)'
roundRect(ctx,42,112,636,248,28,true)

const startX=74
const startY=134
const cellW=108
const cellH=62
const gapX=12
const gapY=10

for(let row=0;row<rows;row++){

const isCenterRow=row===1

if(isCenterRow){

ctx.fillStyle=spinning
?'rgba(255,204,0,0.13)'
:'rgba(0,255,157,0.16)'

roundRect(ctx,56,startY+row*(cellH+gapY)-7,608,cellH+14,20,true)
}

for(let col=0;col<reels;col++){

const x=startX+col*(cellW+gapX)
const y=startY+row*(cellH+gapY)

ctx.fillStyle='#0d0d0d'
roundRect(ctx,x,y,cellW,cellH,17,true)

ctx.strokeStyle=isCenterRow
?(spinning?'#ffcc00':'#00ff9d')
:'rgba(255,255,255,0.12)'

ctx.lineWidth=isCenterRow?4:1
roundRect(ctx,x,y,cellW,cellH,17,false,true)

let symbol=spinning?pick(fruits):(isCenterRow?result[col]:pick(fruits))
const img=await getEmojiImage(symbol)

ctx.drawImage(img,x+30,y+8,46,46)
}
}

if(spinning){

ctx.font='bold 26px Sans'
ctx.fillStyle='#ffcc00'
ctx.fillText('SPINNING...',width/2,415)

}else{

const emoji=resultInfo?.win?'🥳':'🤡'
const emojiImg=await getEmojiImage(emoji)

ctx.drawImage(emojiImg,width/2-118,372,42,42)

ctx.font='bold 34px Sans'
ctx.fillStyle=resultInfo?.win?'#00ff9d':'#ff4d4d'
ctx.fillText(resultInfo?.esitoText||'RISULTATO',width/2+20,404)

ctx.font='bold 24px Sans'
ctx.fillStyle='#ffffff'
ctx.fillText(`${resultInfo?.denaroText||''}   ${resultInfo?.expText||''} EXP`,width/2,438)

ctx.strokeStyle='rgba(255,255,255,0.65)'
ctx.lineWidth=2
ctx.beginPath()
ctx.moveTo(170,460)
ctx.lineTo(550,460)
ctx.stroke()

ctx.font='bold 22px Sans'
ctx.fillStyle='#ffffff'
ctx.fillText('SALDO ATTUALE',width/2,490)

ctx.font='bold 21px Sans'
ctx.fillStyle='#d7d7d7'
ctx.fillText(`DENARO: ${resultInfo?.saldoEuro||'0'}€     EXP: ${resultInfo?.saldoExp||'0'}`,width/2,522)
}
}

async function getEmojiImage(symbol){

if(!imageCache[symbol]){

const code=emojiMap[symbol]
const url=`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${code}.png`

imageCache[symbol]=await loadImage(url)
}

return imageCache[symbol]
}

function roundRect(ctx,x,y,width,height,radius,fill=false,stroke=false){

ctx.beginPath()
ctx.moveTo(x+radius,y)
ctx.lineTo(x+width-radius,y)
ctx.quadraticCurveTo(x+width,y,x+width,y+radius)
ctx.lineTo(x+width,y+height-radius)
ctx.quadraticCurveTo(x+width,y+height,x+width-radius,y+height)
ctx.lineTo(x+radius,y+height)
ctx.quadraticCurveTo(x,y+height,x,y+height-radius)
ctx.lineTo(x,y+radius)
ctx.quadraticCurveTo(x,y,x+radius,y)
ctx.closePath()

if(fill)ctx.fill()
if(stroke)ctx.stroke()
}

function pick(arr){
return arr[Math.floor(Math.random()*arr.length)]
}