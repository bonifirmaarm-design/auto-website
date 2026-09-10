const { chromium } = require('/opt/node22/lib/node_modules/playwright/node_modules/playwright-core');
const fs = require('fs');
const REPO = '/home/user/auto-website/';
const OUT = '/tmp/claude-0/-home-user-auto-website/16d1e8ad-1c45-53ab-ad9f-9567d11aab9b/scratchpad/';

const A = 'cinematic_automotive_photography_premium_silver_japanese_minivan_toyota_alphard_style_three-quarter_upipzsc3d2piata1c21o_3.png';
const V = 'cinematic_automotive_photography_premium_white_japanese_minivan_side_three-quarter_view_vertical_co_yikdxy9m8i0ikh0q7z1r_1.png';
const L = 'cinematic_automotive_photography_premium_white_japanese_minivan_side_three-quarter_view_vertical_co_pncezim40s6q6cra5thg_0.png';
const G = 'cinematic_wide_shot_of_a_dark_premium_japanese_car_on_an_empty_mountain_road_at_sunset_golden_hour__069vcbgb3v2j7c988ydz_2.png';
const M = 'omni-4d735913-3ba6-479f-a676-5f641a7fca8c.png';

const jobs = [
  { key:'hero',     file:A, w:1376, q:0.80 }, // Alphard + baked-in GRAND AVTO wall
  { key:'hits',     file:V, w:900,  q:0.80 }, // vertical white Alphard
  { key:'steps',    file:G, w:1376, q:0.78 }, // GR86 on mountain road, dark left
  { key:'auction',  file:L, w:1376, q:0.78 }, // white minivan, landscape
  { key:'mountain', file:M, w:1376, q:0.80 }, // desert road to mountain, pale sky -> dark road
  { key:'footer',   file:A, w:1200, q:0.76 }, // bookend with the hero image
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
