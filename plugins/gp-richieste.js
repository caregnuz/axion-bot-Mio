// by 𝕯𝖊ⱥ𝖉𝖑𝐲 × Bonzino

import prefissi from '../media/database/prefissi.js'

let richiestaInAttesa={}

function getPendingKey(sender,chat){
return `${sender}|${chat}`
}

function getRequestJid(p={}){
return p.jid||p.id||p.lid||p.phoneNumber||p.participant||''
}

function getRequestNumber(p={}){
return String(getRequestJid(p))
.split('@')[0]
.replace(/[^0-9]/g,'')
}

function getPrefixLabel(p={}){

const number=getRequestNumber(p)

const sorted=Object.entries(prefissi)
.sort((a,b)=>b[0].length-a[0].length)

for(const [code,label] of sorted){
if(number.startsWith(code)) return label
}

return '❓ Altri'
}

function getPrefixStats(pending=[]){

const stats={}

for(const p of pending){

const prefix=getPrefixLabel(p)

stats[prefix]=(stats[prefix]||0)+1
}

return stats
}

function formatPrefixDetails(pending=[]){

const stats=getPrefixStats(pending)

return Object.entries(stats)
.sort((a,b)=>b[1]-a[1])
.map(([prefix,count])=>`${prefix} ➜ *${count}*`)
.join('\n')
}

function getJidList(list=[]){
return list.map(p=>getRequestJid(p)).filter(Boolean)
}

let handler=async(m,{conn,isAdmin,isBotAdmin,args,usedPrefix,command})=>{

if(!m.isGroup) return

const groupId=m.chat
const pendingKey=getPendingKey(m.sender,groupId)

if(!isBotAdmin){
return m.reply('*⚠️ 𝐃𝐞𝐯𝐨 𝐞𝐬𝐬𝐞𝐫𝐞 𝐚𝐝𝐦𝐢𝐧 𝐩𝐞𝐫 𝐠𝐞𝐬𝐭𝐢𝐫𝐞 𝐥𝐞 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞.*')
}

if(!isAdmin){
return m.reply('*⚠️ 𝐒𝐨𝐥𝐨 𝐠𝐥𝐢 𝐚𝐝𝐦𝐢𝐧 𝐩𝐨𝐬𝐬𝐨𝐧𝐨 𝐮𝐬𝐚𝐫𝐞 𝐪𝐮𝐞𝐬𝐭𝐨 𝐜𝐨𝐦𝐚𝐧𝐝𝐨.*')
}

const pending=await conn.groupRequestParticipantsList(groupId)

if(richiestaInAttesa[pendingKey]){

const input=String(m.text||'').trim()

delete richiestaInAttesa[pendingKey]

if(!/^\d+$/.test(input)){
return m.reply('*⚠️ 𝐈𝐧𝐯𝐢𝐚 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐯𝐚𝐥𝐢𝐝𝐨.*')
}

const numero=parseInt(input)

const jidList=getJidList(pending.slice(0,numero))

if(!jidList.length){
return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐝𝐚 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞.*')
}

await conn.groupRequestParticipantsUpdate(groupId,jidList,'approve')

return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞.*`)
}

if(!pending.length){
return m.reply('*✅ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐢𝐧 𝐬𝐨𝐬𝐩𝐞𝐬𝐨.*')
}

if(!args[0]){

const stats=getPrefixStats(pending)

const italiani=stats['🇮🇹 +39']||0
const esteri=pending.length-italiani

return conn.sendMessage(groupId,{
text:
`╭━━━━━━━📨━━━━━━━╮
✦ 𝐑𝐈𝐂𝐇𝐈𝐄𝐒𝐓𝐄 𝐈𝐍 𝐒𝐎𝐒𝐏𝐄𝐒𝐎 ✦
╰━━━━━━━📨━━━━━━━╯

📊 𝐓𝐨𝐭𝐚𝐥𝐞: *${pending.length}*

🇮🇹 𝐏𝐫𝐞𝐟𝐢𝐬𝐬𝐨 +39: *${italiani}*
🌍 𝐏𝐫𝐞𝐟𝐢𝐬𝐬𝐢 𝐞𝐬𝐭𝐞𝐫𝐢: *${esteri}*

━━━━━━━━━━━━━━
*𝐒𝐜𝐞𝐠𝐥𝐢 𝐜𝐨𝐬𝐚 𝐟𝐚𝐫𝐞:*`,

footer:'𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',

buttons:[{buttonId:`${usedPrefix}${command} accetta`,buttonText:{displayText:'✅ Accetta tutte'},type:1},{buttonId:`${usedPrefix}${command} rifiuta`,buttonText:{displayText:'❌ Rifiuta tutte'},type:1},{buttonId:`${usedPrefix}${command} accetta39`,buttonText:{displayText:'🇮🇹 Accetta +39'},type:1},{buttonId:`${usedPrefix}${command} prefissi`,buttonText:{displayText:'🌍 Vedi prefissi'},type:1},{buttonId:`${usedPrefix}${command} gestisci`,buttonText:{displayText:'📥 Gestisci numero'},type:1}],

headerType:1

},{quoted:m})
}

if(args[0]==='prefissi'){

const details=formatPrefixDetails(pending)

return conn.sendMessage(groupId,{
text:
`╭━━━━━━━🌍━━━━━━━╮
✦ 𝐃𝐄𝐓𝐓𝐀𝐆𝐋𝐈𝐎 𝐏𝐑𝐄𝐅𝐈𝐒𝐒𝐈 ✦
╰━━━━━━━🌍━━━━━━━╯

📊 𝐓𝐨𝐭𝐚𝐥𝐞: *${pending.length}*

${details}

> *𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓*`,

footer:'𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',

buttons:[{buttonId:`${usedPrefix}${command}`,buttonText:{displayText:'⬅️ Torna al menu'},type:1},{buttonId:`${usedPrefix}${command} accetta39`,buttonText:{displayText:'🇮🇹 Accetta +39'},type:1},{buttonId:`${usedPrefix}${command} rifiuta`,buttonText:{displayText:'❌ Rifiuta tutte'},type:1}],

headerType:1

},{quoted:m})
}

if(args[0]==='accetta'){

const jidList=getJidList(pending)

if(!jidList.length){
return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐝𝐚 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞.*')
}

await conn.groupRequestParticipantsUpdate(groupId,jidList,'approve')

return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞.*`)
}

if(args[0]==='rifiuta'){

const jidList=getJidList(pending)

if(!jidList.length){
return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐝𝐚 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐫𝐞.*')
}

await conn.groupRequestParticipantsUpdate(groupId,jidList,'reject')

return m.reply(`*❌ 𝐇𝐨 𝐫𝐢𝐟𝐢𝐮𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞.*`)
}

if(args[0]==='accetta39'){

const italiani=pending.filter(p=>getRequestNumber(p).startsWith('39'))

const jidList=getJidList(italiani)

if(!jidList.length){
return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐜𝐨𝐧 𝐩𝐫𝐞𝐟𝐢𝐬𝐬𝐨 +39.*')
}

await conn.groupRequestParticipantsUpdate(groupId,jidList,'approve')

return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐜𝐨𝐧 𝐩𝐫𝐞𝐟𝐢𝐬𝐬𝐨 +39.*`)
}

if(args[0]==='gestisci'){

richiestaInAttesa[pendingKey]=true

return conn.sendMessage(groupId,{
text:'*❓ 𝐐𝐮𝐚𝐧𝐭𝐞 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐯𝐮𝐨𝐢 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞?*\n\n*🔢 𝐒𝐜𝐫𝐢𝐯𝐢 𝐮𝐧 𝐧𝐮𝐦𝐞𝐫𝐨 𝐢𝐧 𝐜𝐡𝐚𝐭.*',

footer:'𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',

buttons:[{buttonId:`${usedPrefix}${command} accettane 10`,buttonText:{displayText:'10'},type:1},{buttonId:`${usedPrefix}${command} accettane 20`,buttonText:{displayText:'20'},type:1},{buttonId:`${usedPrefix}${command} accettane 50`,buttonText:{displayText:'50'},type:1},{buttonId:`${usedPrefix}${command} accettane 100`,buttonText:{displayText:'100'},type:1}],

headerType:1

},{quoted:m})
}

if(args[0]==='accettane'){

const numero=parseInt(args[1])

if(isNaN(numero)||numero<=0){
return m.reply('*⚠️ 𝐍𝐮𝐦𝐞𝐫𝐨 𝐧𝐨𝐧 𝐯𝐚𝐥𝐢𝐝𝐨.*')
}

const jidList=getJidList(pending.slice(0,numero))

if(!jidList.length){
return m.reply('*⚠️ 𝐍𝐨𝐧 𝐜𝐢 𝐬𝐨𝐧𝐨 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞 𝐝𝐚 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐫𝐞.*')
}

await conn.groupRequestParticipantsUpdate(groupId,jidList,'approve')

return m.reply(`*✅ 𝐇𝐨 𝐚𝐜𝐜𝐞𝐭𝐭𝐚𝐭𝐨 ${jidList.length} 𝐫𝐢𝐜𝐡𝐢𝐞𝐬𝐭𝐞.*`)
}

return m.reply(`*⚠️ 𝐔𝐬𝐚:* *${usedPrefix}${command}*`)
}

handler.command=['richieste']
handler.tags=['gruppo']
handler.help=['richieste']
handler.group=true
handler.admin=true
handler.botAdmin=true

export default handler