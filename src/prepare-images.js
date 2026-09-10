const { chromium } = require('/opt/node22/lib/node_modules/playwright/node_modules/playwright-core');
const fs = require('fs');
const REPO = '/home/user/auto-website/';
const OUT = '/tmp/claude-0/-home-user-auto-website/16d1e8ad-1c45-53ab-ad9f-9567d11aab9b/scratchpad/';

const jobs = [
  { key:'hero',    file:'2026-09-10_17-14-32.png', w:1400, q:0.74 }, // Toyota Noah minivan
  { key:'hits',    file:'2026-09-10_17-14-32.png', w:900,  q:0.74 },
  { key:'steps',   file:'2026-09-10_17-15-46.png', w:1200, q:0.72 }, // Toyota SAI
  { key:'auction', file:'2026-09-10_17-13-30.png', w:1200, q:0.72 }, // Nissan X-Trail
  { key:'footer',  file:'2026-09-10_17-11-57.png', w:1400, q:0.72 }, // Honda Accord
];

(async () => {
  const br = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await br.newPage();
  const out = {};
  for (const j of jobs) {
    const b64 = fs.readFileSync(REPO + j.file).toString('base64');
    await p.setContent('<img id=i src="data:image/png;base64,'+b64+'">');
    await p.waitForSelector('#i');
    out[j.key] = await p.evaluate(({w,q}) => {
      const i = document.getElementById('i');
      const sc = Math.min(1, w / i.naturalWidth);
      const c = document.createElement('canvas');
      c.width = Math.round(i.naturalWidth*sc); c.height = Math.round(i.naturalHeight*sc);
      const x = c.getContext('2d'); x.imageSmoothingQuality='high';
      x.drawImage(i,0,0,c.width,c.height);
      return c.toDataURL('image/jpeg', q);
    }, { w:j.w, q:j.q });
    console.log(j.key, Math.round(out[j.key].length/1024)+'KB');
  }
  await br.close();
  fs.writeFileSync(OUT+'big-images.json', JSON.stringify(out));
  console.log('total', Math.round(JSON.stringify(out).length/1024)+'KB');
})().catch(e=>{console.error('ERR',e.message);process.exit(1)});
