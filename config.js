import { watchFile, unwatchFile } from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import chalk from 'chalk'
import fs from 'fs'
import * as cheerio from 'cheerio'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'
import NodeCache from 'node-cache'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
const moduleCache = new NodeCache({ stdTTL: 300 });

/*
⚠️ Attenzione, questo file è solo un esempio, sostituisci:
- numeri owner
- API keys
- repo
- canele
con i tuoi valori 
*/

global.owner = [
  ['393780306700', '𝕯𝖊ⱥ𝖉𝖑𝐲', true],
  ['393780560229', 'Luxifer', true],
  ['639350468907', 'bonzino', true],
  ['393780087063', 'bonzino²', true],
]
global.mods = ['xxxxxxxxxx', 'xxxxxxxxxx']
global.prems = ['xxxxxxxxxx', 'xxxxxxxxxx']

global.nomebot   = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
global.nomepack  = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
global.wm        = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
global.autore    = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
global.dev       = '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓'
global.versione  = pkg.version
global.testobot  = `AXION-BOT-V${pkg.version}`
global.errore    = '⚠️ *[SYSTEM ERROR]*'

global.repobot = 'https://github.com/axion-bot/axion-bot'
global.canale  = 'https://whatsapp.com/channel/0029Vb8MQ3U1CYoMEtU1832d'

global.cheerio = cheerio
global.fs      = fs
global.fetch   = fetch
global.axios   = axios
global.moment  = moment

global.APIKeys = {
    spotifyclientid: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    spotifysecret:   '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    browserless:     '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    screenshotone:   '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    tmdb:            '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    gemini:          '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    ocrspace:        '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    assemblyai:      '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    google:          '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    googlex:         '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    googleCX:        '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    genius:          '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    unsplash:        '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    removebg:        '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    openrouter:      '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    lastfm:          '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    sightengine_user: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
    sightengine_secret: '𝛥𝐗𝐈𝚶𝐍 𝚩𝚯𝐓',
}

let filePath = fileURLToPath(import.meta.url)
let fileUrl = pathToFileURL(filePath).href

const reloadConfig = async () => {
  const cached = moduleCache.get(fileUrl);
  if (cached) return cached;
  
  unwatchFile(filePath)
  console.log(chalk.bgCyan.black(" SYSTEM ") + chalk.cyan(` File 'config.js' aggiornato con successo.`))
  
  const module = await import(`${fileUrl}?update=${Date.now()}`)
  moduleCache.set(fileUrl, module, { ttl: 300 });
  return module;
}

watchFile(filePath, reloadConfig)
