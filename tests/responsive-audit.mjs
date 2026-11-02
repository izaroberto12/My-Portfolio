import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const require = createRequire(import.meta.url);
const axe = require.resolve('axe-core/axe.min.js');
const base = 'http://127.0.0.1:8765';
const cases = [
  { name:'Homepage',url:'/' },
  { name:'Graphic Production',url:'/work/graphic-design.html' },
  { name:'Project Row Houses',url:'/work/project-row-houses.html' },
  { name:'Verde',url:'/work/verde.html' }
];
const viewports = [
  [280,653],[320,568],[360,640],[375,667],[390,844],[414,896],
  [430,932],[540,720],[600,960],[700,900],[701,900],[768,1024],
  [820,1180],[912,1368],[1024,768],[1024,1366],[1180,820],
  [1280,720],[1366,768],[1440,900],[1536,864],[1920,1080],
  [2560,1440],[3440,1440]
];
const dir = 'artifacts/responsive-audit';
fs.mkdirSync(dir,{recursive:true});
const browser = await chromium.launch({headless:true});
const context = await browser.newContext({reducedMotion:'reduce',deviceScaleFactor:1});
const all = [];
const summary = [];
for (const item of cases) {
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base+item.url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.evaluate(() => Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,3500))]));
  const rows = [];
  for (const [width,height] of viewports) {
    await page.setViewportSize({width,height});
    await page.waitForTimeout(75);
    const result = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth, doc = document.documentElement;
      const isVisible = el => {
        const cs = getComputedStyle(el);
        if (cs.display==='none'||cs.visibility==='hidden'||Number(cs.opacity)===0) return false;
        const rect=el.getBoundingClientRect();
        return rect.width>0&&rect.height>0;
      };
      const elems=[...document.querySelectorAll('body *')];
      const offenders=elems.filter(el => {
        if (!isVisible(el)) return false;
        const r=el.getBoundingClientRect();
        return r.right>vw+3&&r.width>3&&getComputedStyle(el).position!=='fixed';
      }).slice(0,7).map(el=>({tag:el.tagName.toLowerCase(),className:typeof el.className==='string'?el.className.slice(0,85):'',right:Math.round(el.getBoundingClientRect().right)}));
      return {
        documentWidth:doc.scrollWidth,
        clientWidth:vw,
        overflow: Math.max(0,doc.scrollWidth-vw),
        offenders,
        visibleH1: [...document.querySelectorAll('h1')].filter(isVisible).length,
        menuToggleVisible: !!document.querySelector('[data-menu]')&&isVisible(document.querySelector('[data-menu]')),
        brokenImages:[...document.images].filter(im=>im.hasAttribute('src')&&im.complete&&im.naturalWidth===0).map(im=>im.getAttribute('src')).slice(0,8)
      };
    });
    const entry={page:item.name,width,height,...result};
    all.push(entry); rows.push(entry);
    if ([320,390,768,1440,1920,2560].includes(width)) {
      await page.screenshot({path:path.join(dir,item.name.toLowerCase().replaceAll(' ','-')+'-'+width+'.png'),fullPage:true,animations:'disabled'});
    }
    if ([320,390,768,1440].includes(width)) {
      await page.addScriptTag({path:axe});
      const a11y=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});return r.violations.map(x=>({id:x.id,impact:x.impact,count:x.nodes.length,description:x.help,nodes:x.nodes.slice(0,4).map(n=>({target:n.target,html:n.html.slice(0,180),summary:n.failureSummary?.slice(0,250)}))}))});
      entry.axe=a11y;
      if (width<701) {
        const button=page.locator('[data-menu]');
        if (await button.count()) {
          await button.click();
          entry.mobileMenuOpened=await button.getAttribute('aria-expanded')==='true';
          await page.keyboard.press('Escape');
          entry.mobileMenuClosed=await button.getAttribute('aria-expanded')==='false';
        }
      }
    }
  }
  const maxOverflow=Math.max(...rows.map(x=>x.overflow));
  const bad=rows.filter(x=>x.overflow>2);
  const broken=[...new Set(rows.flatMap(x=>x.brokenImages))];
  summary.push({page:item.name,maxOverflow,badWidths:bad.map(x=>x.width),badDetails:bad.map(x=>({width:x.width,offenders:x.offenders})),brokenImages:broken,jsErrors:[...new Set(errors)],axe:rows.filter(x=>x.axe?.length).map(x=>({width:x.width,issues:x.axe})),mobileMenu:rows.filter(x=>x.mobileMenuOpened!==undefined).map(x=>({width:x.width,opened:x.mobileMenuOpened,closed:x.mobileMenuClosed}))});
  await page.close();
}
await browser.close();
fs.writeFileSync(path.join(dir,'results.json'),JSON.stringify({viewports,cases:all,summary},null,2));
console.log('RESPONSIVE_AUDIT_SUMMARY_START');
console.log(JSON.stringify(summary,null,2));
console.log('RESPONSIVE_AUDIT_SUMMARY_END');
const hardFailure=summary.some(x=>x.maxOverflow>2||x.jsErrors.length||x.mobileMenu.some(m=>!m.opened||!m.closed));
if(hardFailure){console.error('Responsive audit found overflow, JS, or mobile-menu failures.');process.exitCode=1;}
