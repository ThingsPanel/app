import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// Run against a local uni-app H5 dev server. Playwright is an optional test tool,
// supplied by the caller rather than bundled with the mobile application.
const playwright = await import(process.env.PLAYWRIGHT_MODULE_PATH
  ? pathToFileURL(path.resolve(process.env.PLAYWRIGHT_MODULE_PATH)).href : 'playwright')
const base = process.env.H5_REVIEW_URL || 'http://127.0.0.1:5198/'
const output = path.resolve('tmp/history-layout-results')
await fs.mkdir(output, { recursive: true })

async function assertControls(page, insets) {
  const geometry = await page.locator('.app-choice').evaluate((dialog, inset) => {
    const controls = [...dialog.querySelectorAll('.app-choice__action')].map(button => {
      const r = button.getBoundingClientRect()
      return { text: button.textContent.trim(), left:r.left, right:r.right, top:r.top, bottom:r.bottom, height:r.height,
        hit: [r.left + 2, r.right - 2].every(x => button.contains(document.elementFromPoint(x, r.top + r.height/2))) }
    })
    const last = dialog.querySelector('.app-choice__option:last-child')
    const r = last.getBoundingClientRect()
    const cover = document.elementFromPoint(innerWidth/2, innerHeight - Math.max(inset.bottom, 1) - 1)
    return { controls, viewport: { width:innerWidth, height:innerHeight },
      last: { top:r.top, bottom:r.bottom, hit:last.contains(document.elementFromPoint(r.left+r.width/2, r.top+r.height/2)) },
      hasScrollAncestor: !!dialog.closest('.body, .page-scroll, .detail-panel'),
      tabbarObscures: !!cover?.closest('.app-tabbar') }
  }, insets)
  for (const control of geometry.controls) {
    assert.ok(control.left >= insets.left && control.right <= geometry.viewport.width - insets.right + 1, JSON.stringify(geometry))
    assert.ok(control.top >= 0 && control.bottom <= geometry.viewport.height && control.height >= 44 && control.hit, JSON.stringify(geometry))
  }
  assert.equal(geometry.hasScrollAncestor, false, 'selector must escape both scroll and clipped device panel')
  assert.equal(geometry.tabbarObscures, false, 'selection sheet must cover the bottom tab bar')
  assert.ok(geometry.last.top >= 0 && geometry.last.bottom <= geometry.viewport.height - insets.bottom + 1 && geometry.last.hit, JSON.stringify(geometry))
  return geometry
}

const scenarios = [
  { name:'small', width:320, height:568 },
  { name:'phone', width:375, height:812, bottom:34 },
  { name:'screenshot', width:402, height:874, bottom:34 },
  { name:'landscape', width:844, height:390, left:47, right:47, bottom:21 },
  { name:'large-text', width:375, height:812, bottom:34, largeText:true },
  { name:'dark', width:375, height:812, bottom:34, dark:true },
  { name:'tablet', width:768, height:1024 }
]
const results = []
for (const engine of ['webkit', 'chromium']) {
  const browser = await playwright[engine].launch({ headless:true, ...(engine === 'chromium' ? { channel:'chrome' } : {}) })
  try {
    for (const scenario of scenarios) {
      const insets = { left:scenario.left || 0, right:scenario.right || 0, bottom:scenario.bottom || 0 }
      const page = await browser.newPage({ viewport:{width:scenario.width,height:scenario.height}, isMobile:true, hasTouch:true, reducedMotion:'reduce', colorScheme:scenario.dark ? 'dark' : 'light' })
      try {
        await page.goto(base)
        await page.waitForFunction(() => !!document.querySelector('#app')?.__vue_app__)
        await page.evaluate(async () => { const fixture = await import('/scripts/fixtures/history-layout-review.js'); fixture.mount() })
        // Model WKWebView scroll compositing, including ancestors that clip fixed descendants.
        await page.addStyleTag({ content:`.page-scroll,.detail-panel { transform:translateZ(0); isolation:isolate; overflow:hidden; }
          .telemetry-history-host .app-choice { padding-bottom:calc(12px + ${insets.bottom}px) !important; }
          .telemetry-history-host .app-choice .app-choice__header { padding-left:${12+insets.left}px !important; padding-right:${12+insets.right}px !important; }
          ${scenario.largeText ? '.telemetry-history-host .app-choice .app-choice__action,.telemetry-history-host .app-choice .app-choice__title,.telemetry-history-host .app-choice .app-choice__label { font-size:24px !important; }' : ''}` })
        await page.locator('.field-actions').getByText('趋势', {exact:true}).click()
        await page.locator('.sheet').waitFor()
        assert.equal(await page.locator('.telemetry-history-host').evaluate(e => !!e.closest('.page-scroll,.detail-panel')), false)
        await page.locator('.filters .filter').first().click()
        const last = page.locator('.app-choice__option').filter({hasText:'最近30天'})
        // Poll beyond popup animation; an intermediate transform must not masquerade as clipping.
        await page.waitForFunction(() => {
          const e = document.querySelector('.app-choice')
          return e && Math.abs(e.getBoundingClientRect().bottom - innerHeight) <= 1
        })
        await last.scrollIntoViewIfNeeded()
        const geometry = await assertControls(page, insets)
        await page.screenshot({ path:path.join(output, `${engine}-${scenario.name}.png`) })
        if (scenario.name === 'screenshot') {
          for (const viewport of [{width:874,height:402}, {width:402,height:874}]) {
            await page.setViewportSize(viewport)
            await page.waitForFunction(() => Math.abs(document.querySelector('.app-choice').getBoundingClientRect().bottom - innerHeight) <= 1)
            await last.scrollIntoViewIfNeeded()
            await assertControls(page, insets)
          }
        }
        await last.click()
        await page.locator('.app-choice__action').filter({hasText:'取消'}).click()
        await page.locator('.app-choice').waitFor({state:'detached'})
        assert.match(await page.locator('.filters .filter').first().innerText(), /最近1小时/)
        assert.equal(await page.evaluate(() => window.historyLayoutReview.loads), 1)
        await page.locator('.filters .filter').first().click()
        await last.scrollIntoViewIfNeeded()
        await last.click()
        await page.locator('.app-choice__confirm').click()
        await page.locator('.app-choice').waitFor({state:'detached'})
        assert.match(await page.locator('.filters .filter').first().innerText(), /最近30天/)
        assert.equal(await page.evaluate(() => window.historyLayoutReview.loads), 2)
        await page.locator('.filters .filter').last().click()
        await page.locator('.app-choice__option').filter({hasText:'柱状图'}).click()
        await page.locator('.app-choice__confirm').click()
        await page.locator('.app-choice').waitFor({state:'detached'})
        assert.equal(await page.evaluate(() => window.historyLayoutReview.sheet.chartData.type), 'bar')
        assert.equal(await page.evaluate(() => window.historyLayoutReview.loads), 2)
        if (scenario.name === 'phone') {
          await page.locator('.filters .filter').nth(1).click()
          await page.locator('.app-choice__option').filter({hasText:'每分钟'}).click()
          await page.locator('.app-choice__confirm').click()
          await page.locator('.app-choice').waitFor({state:'detached'})
          await page.locator('.filters .filter').nth(2).click()
          await page.locator('.app-choice__option').filter({hasText:'最大值'}).click()
          await page.locator('.app-choice__confirm').click()
          await page.locator('.app-choice').waitFor({state:'detached'})
          assert.equal(await page.evaluate(() => window.historyLayoutReview.loads), 4)
          await page.locator('.heading').getByText('关闭', {exact:true}).click()
          await page.locator('.telemetry-history-host').waitFor({state:'detached'})
          await page.locator('.field-actions').getByText('历史列表', {exact:true}).click()
          await page.locator('.sheet').waitFor()
          assert.equal(await page.evaluate(() => window.historyLayoutReview.sheet.mode), 'history')
          await page.locator('.filters .filter').first().click()
          await page.locator('.app-choice__option').filter({hasText:'最近7天'}).click()
          await page.locator('.app-choice__confirm').click()
          await page.locator('.app-choice').waitFor({state:'detached'})
          assert.match(await page.locator('.filters .filter').first().innerText(), /最近7天/)
        }
        await page.locator('.filters .filter').first().click()
        await page.evaluate(() => window.historyLayoutReview.leave())
        await page.locator('.telemetry-history-host').waitFor({state:'detached'})
        assert.equal(await page.locator('.app-choice').count(), 0, 'leaving page cleans up both overlays')
        results.push({ engine, scenario:scenario.name, geometry })
        console.log(`${engine}/${scenario.name}: buttons, last option, tabbar coverage, cancel/confirm, chart switching and cleanup passed`)
      } finally { await page.close() }
    }
  } finally { await browser.close() }
}
await fs.writeFile(path.join(output, 'results.json'), JSON.stringify(results, null, 2))
