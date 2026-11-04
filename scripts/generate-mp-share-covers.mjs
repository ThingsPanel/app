import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createHash } from 'node:crypto'

// Render the existing brand mark and typography precisely; never redraw the logo.
// PLAYWRIGHT_MODULE_PATH may point to an external Playwright installation.
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE_PATH
  ? pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href : 'playwright')
const root = fileURLToPath(new URL('../', import.meta.url))
const output = path.join(root, 'static/mp-weixin/share')
const logo = (await fs.readFile(path.join(root, 'static/icon/app-mark.png'))).toString('base64')
await fs.mkdir(output, { recursive:true })
const browser = await chromium.launch({ channel:'chrome', headless:true })
try {
  for (const [name, height] of [['home-card', 400], ['home-timeline', 500]]) {
    const page = await browser.newPage({ viewport:{width:500, height}, deviceScaleFactor:2 })
    try {
      await page.setContent(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
        <style>
          * { box-sizing:border-box; }
          html,body { margin:0; width:500px; height:${height}px; overflow:hidden; }
          body { position:relative; background:#164be4; color:white; font-family:"Segoe UI","Microsoft YaHei",sans-serif; }
          body::before { content:""; position:absolute; inset:0; background:linear-gradient(135deg,#2462f2 0%,#164be4 55%,#1032a1 100%); }
          .brand { position:absolute; left:34px; top:30px; display:flex; align-items:center; gap:10px; }
          .brand img { width:32px; height:31px; display:block; }
          .brand span { font-size:25px; line-height:32px; font-weight:600; letter-spacing:-.5px; }
          h1 { position:absolute; left:34px; top:${height === 400 ? 116 : 155}px; margin:0; font-family:"Microsoft YaHei",sans-serif; font-size:58px; line-height:1.24; font-weight:700; letter-spacing:-2px; z-index:2; }
          h1 span { color:#9feaff; }
          p { position:absolute; left:36px; bottom:35px; margin:0; color:#c5d8ff; font-family:"Microsoft YaHei",sans-serif; font-size:22px; line-height:30px; letter-spacing:.8px; }
          .network { position:absolute; width:220px; height:300px; right:-2px; top:${height === 400 ? 88 : 132}px; }
        </style></head><body>
          <div class="brand"><img src="data:image/png;base64,${logo}" alt=""><span>ThingsPanel</span></div>
          <h1>连接设备<br><span>看见数据</span></h1>
          <svg class="network" viewBox="0 0 220 300" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="face" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff"/><stop offset="1" stop-color="#c6dfff"/></linearGradient>
              <linearGradient id="side" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#a7c9ff"/><stop offset="1" stop-color="#5488ec"/></linearGradient>
              <radialGradient id="glow"><stop stop-color="#4cdff2" stop-opacity=".38"/><stop offset="1" stop-color="#4cdff2" stop-opacity="0"/></radialGradient>
            </defs>
            <circle cx="143" cy="158" r="105" fill="none" stroke="#76b4ff" stroke-opacity=".18"/>
            <circle cx="143" cy="158" r="80" fill="none" stroke="#76b4ff" stroke-opacity=".12"/>
            <ellipse cx="139" cy="245" rx="94" ry="27" fill="url(#glow)"/>
            <g fill="none" stroke="#73e5f4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M58 72v44h41"/><path d="M187 98v30h-28"/><path d="M172 249v-31h-20"/>
              <circle cx="58" cy="94" r="3" fill="#b9ffff" stroke="none"/>
              <circle cx="187" cy="115" r="3" fill="#b9ffff" stroke="none"/>
            </g>
            <path d="M89 111l90 14v94l-90-16z" fill="#092a85" opacity=".28" transform="translate(4 10)"/>
            <path d="M169 116l18 12v91l-18 10z" fill="url(#side)"/>
            <path d="M83 109l86 7 18 12-88-9z" fill="#edf8ff"/>
            <path d="M82 120q0-13 13-12l65 6q12 1 12 14v86q0 12-13 11l-65-7q-12-1-12-14z" fill="url(#face)"/>
            <rect x="96" y="135" width="61" height="42" rx="6" fill="#1c53d4"/>
            <path d="M102 165l11-10 10 4 13-14 14 4" fill="none" stroke="#79f0ef" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="103" cy="193" r="3" fill="#1689d4"/>
            <path d="M114 193h32M98 205h48" stroke="#769ed9" stroke-width="3" stroke-linecap="round"/>
            <g transform="translate(58 46)">
              <circle r="26" fill="#1c59d7" stroke="#81cfff" stroke-width="1.5"/>
              <path d="M-4-12v16a8 8 0 1 0 8 0v-16a4 4 0 0 0-8 0zM0-5v14" fill="none" stroke="#e8fcff" stroke-width="3" stroke-linecap="round"/>
              <circle cy="10" r="3.5" fill="#6ce6ee"/>
            </g>
            <g transform="translate(187 72)">
              <circle r="24" fill="#1c59d7" stroke="#81cfff" stroke-width="1.5"/>
              <path d="M-13-4q13-13 26 0M-8 2q8-8 16 0" fill="none" stroke="#e8fcff" stroke-width="3" stroke-linecap="round"/>
              <circle cy="9" r="3" fill="#72f0ee"/>
            </g>
            <g transform="translate(172 269)">
              <rect x="-25" y="-24" width="50" height="48" rx="13" fill="#eaf6ff"/>
              <g fill="#1e58d5"><rect x="-13" y="-12" width="10" height="10" rx="2"/><rect x="3" y="-12" width="10" height="10" rx="2"/><rect x="-13" y="4" width="10" height="10" rx="2"/><rect x="3" y="4" width="10" height="10" rx="2"/></g>
            </g>
          </svg>
          <p>设备 · 看板 · 自动化</p>
        </body></html>`)
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(image => image.decode())) })
      await page.screenshot({path:path.join(output, `${name}.jpg`), type:'jpeg', quality:94})
      console.log(`${name}.jpg: ${1000} × ${height*2}`)
    } finally { await page.close() }
  }
} finally { await browser.close() }
// A new asset revision changes the cached local filename used by WeChat.
const hash = createHash('sha256')
for (const name of ['home-card.jpg', 'home-timeline.jpg']) hash.update(await fs.readFile(path.join(output, name)))
await fs.writeFile(path.join(output, 'cover-manifest.json'), JSON.stringify({revision:hash.digest('hex').slice(0,10)}) + '\n')
