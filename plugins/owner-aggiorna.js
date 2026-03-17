import { execSync } from 'child_process'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    await conn.reply(m.chat, '🔄 Controllo aggiornamenti...', m)

    // --- status dei file locali ---
    let status = execSync('git status --short', { encoding: 'utf-8' })
    let statusMsg = '✅ Nessuna modifica locale'
    if (status) {
      statusMsg = '📌 Modifiche locali:\n'
      status.split('\n').forEach(line => {
        if (!line) return
        let code = line.slice(0, 2).trim()
        let file = line.slice(3)
        let symbol = ''
        if (code === 'A') symbol = '✅' // aggiunto
        else if (code === 'M') symbol = '✏️' // modificato
        else if (code === 'D') symbol = '❌' // eliminato
        else symbol = '📄' // altro
        statusMsg += `${symbol} ${file}\n`
      })
    }

    // --- commit in arrivo ---
    let commits = execSync('git log HEAD..origin/main --oneline', { encoding: 'utf-8' })
    let commitMsg = commits ? `📝 Commit in arrivo:\n${commits}` : '✅ Nessun commit da applicare'

    await conn.reply(m.chat, `${statusMsg}\n\n${commitMsg}`, m)

    // --- eseguo pull ---
    let update = execSync('git fetch origin && git reset --hard origin/main && git pull', { encoding: 'utf-8' })

    await conn.reply(m.chat, `✅ Aggiornamento completato!\n\n${update}`, m)
    await m.react('✅')

  } catch (err) {
    await conn.reply(m.chat, `❌ Errore durante aggiornamento:\n\n${err.message}`, m)
    await m.react('❌')
  }
}

handler.help = ['aggiorna']
handler.tags = ['owner']
handler.command = ['aggiorna','update','aggiornabot']
handler.owner = true

export default handler