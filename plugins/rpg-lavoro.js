global.workSession = global.workSession || {}

const jobs = [
{nome:'🍔 Cameriere', min:50, max:100},
{nome:'💻 Freelance', min:100, max:200},
{nome:'🧹 Pulizie', min:30, max:60},
{nome:'🚗 Corriere', min:80, max:160},
{nome:'🛠️ Manovale', min:60, max:120}
]

const events = [
{txt:`Il cliente ti chiede qualcosa di speciale.\n\n1️⃣ Accetti\n2️⃣ Ignori`, bonus:[10,0]},
{txt:`C'è traffico durante la consegna.\n\n1️⃣ Forza il passo\n2️⃣ Aspetti`, bonus:[20,5]},
{txt:`Trovi un oggetto smarrito.\n\n1️⃣ Lo restituisci\n2️⃣ Lo tieni`, bonus:[15,0]},
{txt:`Un collega ti chiede aiuto.\n\n1️⃣ Aiuti\n2️⃣ Rifiuti`, bonus:[10,0]}
]

let handler = async (m,{conn})=>{

const user = m.sender

if(!global.db.data.users[user])
global.db.data.users[user] = {euro:0,xp:0,level:1}

const u = global.db.data.users[user]

let job = random(jobs)
let base = randomNum(job.min,job.max)

let chosenEvents = shuffle(events).slice(0,2)

global.workSession[user] = {
step:0,
job:job,
base:base,
events:chosenEvents,
total:base
}

let txt = `💼 *NUOVO LAVORO*\n\n`
txt += `Lavoro: ${job.nome}\n`
txt += `💰 Paga base: ${base}€\n\n`
txt += `📌 Evento 1\n${chosenEvents[0].txt}`

return conn.reply(m.chat,txt,m)

}

handler.before = async (m,{conn})=>{

const user = m.sender
const input = m.text?.trim()

if(!global.workSession[user]) return
if(!/^[12]$/.test(input)) return

const session = global.workSession[user]
const u = global.db.data.users[user]

let ev = session.events[session.step]
let choice = input-1
let bonus = ev.bonus[choice] || 0

session.total += bonus

await conn.reply(m.chat,
`Hai scelto: *${choice===0?"1":"2"}*\n💰 Bonus: ${bonus}€`,
m)

session.step++

if(session.step < session.events.length){

let next = session.events[session.step]

let txt = `📌 Evento ${session.step+1}\n${next.txt}`

return conn.reply(m.chat,txt,m)

}

/* ===== FINE LAVORO ===== */

let total = session.total

u.euro += total

let xpGain = randomNum(5,15)
u.xp += xpGain

let lvlUp=false
if(u.xp >= u.level*100){
u.level++
u.xp=0
lvlUp=true
}

delete global.workSession[user]

let msg = `✅ Turno completato come *${session.job.nome}*\n\n`
msg += `💰 Guadagno totale: ${total}€\n`
msg += `💶 Saldo: ${u.euro}€\n`
msg += `🏅 Livello: ${u.level}\n`
msg += `⭐ XP: ${u.xp}/${u.level*100}`

if(lvlUp) msg += `\n\n🎉 *LEVEL UP!*`

return conn.reply(m.chat,msg,m)

}

handler.command = /^(work|lavora)$/i
export default handler


function random(arr){
return arr[Math.floor(Math.random()*arr.length)]
}

function randomNum(min,max){
return Math.floor(Math.random()*(max-min+1))+min
}

function shuffle(arr){
return arr.sort(()=>0.5-Math.random())
}