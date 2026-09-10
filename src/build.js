const fs = require('fs');
const dir = '/tmp/claude-0/-home-user-auto-website/16d1e8ad-1c45-53ab-ad9f-9567d11aab9b/scratchpad/';
const data = JSON.parse(fs.readFileSync(dir + 'images.json', 'utf8'));
const big  = JSON.parse(fs.readFileSync(dir + 'big-images.json', 'utf8'));
let tpl = fs.readFileSync(dir + 'gv2-template.html', 'utf8');

const TYPE = { sedan:'Седан', hatchback:'Хэтчбек', suv:'Кроссовер', minivan:'Минивэн', van:'Универсал' };
const fmt = n => n.toLocaleString('ru-RU');
const split = n => ({ brand: n.split(' ')[0], model: n.replace(/^\S+\s/,'').replace(/\s\d{4}$/,''), year: n.match(/\d{4}/)[0] });

function specsOf(c){
  const hyb = /Prius|Aqua|SAI/.test(c.name);
  const awd = /X-Trail|Vezel/.test(c.name);
  return {
    'Год выпуска': c.name.match(/\d{4}/)[0],
    'Коробка': 'Автомат',
    'Двигатель': hyb ? 'Гибрид' : 'Бензин',
    'Привод': awd ? 'Полный 4WD' : 'Передний',
    'Мест': c.type === 'minivan' ? '7' : '5',
    'Кузов': TYPE[c.type]
  };
}
function descOf(c){
  const t = TYPE[c.type].toLowerCase();
  const hyb = /Prius|Aqua|SAI/.test(c.name);
  const awd = /X-Trail|Vezel/.test(c.name);
  const bits = [`Японский ${t} ${c.name.match(/\d{4}/)[0]} года в отличном состоянии.`];
  if (hyb) bits.push('Гибридная установка — минимальный расход топлива в городе.');
  if (awd) bits.push('Полный привод уверенно держит трассу и зимнюю дорогу Приморья.');
  if (c.type === 'minivan') bits.push('Семь мест и просторный багажник — подходит для семьи и поездок компанией.');
  if (c.type === 'van') bits.push('Вместительный отсек — удобен для работы и перевозки груза.');
  bits.push('Доступна аренда с последующим выкупом без банка и первоначального взноса.');
  return bits.join(' ');
}

const POP = ['Toyota Noah 2015','Nissan X-Trail 2016','Toyota SAI 2013','Honda Vezel 2016','Honda Accord 2014','Toyota Wish 2013','Toyota Probox 2017','Toyota Corolla Axio 2016','Toyota Prius 2014','Toyota Aqua 2015','Nissan Note 2015','Honda Fit 2013'];
const cars = data.cars.map(c => ({ ...c, pop: POP.indexOf(c.name) === -1 ? 99 : POP.indexOf(c.name) }))
                      .sort((a,b) => a.pop - b.pop);

const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17L17 7M9 7h8v8"/></svg>';

// ---- ХИТЫ: 3 cards (brand top black, model grey, photo, specs, price + black square arrow) ----
const hits = cars.slice(0,3).map(c => {
  const s = split(c.name), sp = specsOf(c);
  return `
        <article class="cc">
          <div class="cc__nm">${s.brand}</div>
          <div class="cc__md">${s.model} ${s.year}</div>
          <div class="cc__ph"><img src="${c.dataUri}" alt="${c.name} в прокат"></div>
          <div class="cc__sp"><span>${sp['Коробка']}</span><span>${sp['Двигатель']}</span><span>${sp['Мест']} мест</span></div>
          <div class="cc__ft">
            <div class="cc__pr">${fmt(c.price)} ₽<small>в сутки</small></div>
            <button class="sq sq--k" aria-label="Забронировать ${c.name}" onclick="openModal('${c.name}','Аренда: ${c.name}','Перезвоним и подтвердим наличие','${fmt(c.price)}')">${ARROW}</button>
          </div>
        </article>`;
}).join('');

// ---- КАТАЛОГ ----
const catalog = cars.map(c => {
  const s = split(c.name), sp = specsOf(c);
  const specHtml = Object.entries(sp).map(([k,v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  return `
      <article class="pc" data-name="${c.name.toLowerCase()}" data-type="${c.type}" data-price="${c.price}" data-full="${c.name}" data-specs='${specHtml.replace(/'/g,"&#39;")}'>
        <div class="pc__ph"><span class="pc__tag">${TYPE[c.type]}</span><img src="${c.dataUri}" alt="${c.name} — аренда авто GRAND AVTO"></div>
        <div class="pc__nm">${s.brand}</div>
        <div class="pc__md">${s.model} ${s.year}</div>
        <div class="pc__pr">${fmt(c.price)} ₽ <small>/ сутки</small></div>
        <div class="pc__det"><div><div class="pc__inner">
          <p class="pc__desc">${descOf(c)}</p>
          <dl class="specs">${specHtml}</dl>
        </div></div></div>
        <div class="pc__btns">
          <button class="pc__more" onclick="tglCar(this)">Подробнее <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg></button>
          <button class="pc__rent" onclick="rentFrom(this)">Арендовать</button>
        </div>
      </article>`;
}).join('');

const carOptions = cars.map(c => `<option>${c.name}</option>`).join('');

// ---- ОТЗЫВЫ ----
const reviews = [
  { n:'Артём Ковалёв', i:'АК', m:'Владивосток · август 2026', st:5, t:'Брал Toyota SAI на неделю по работе. Машина в идеале, забрал за 15 минут прямо у порта. Цена честная, залог вернули сразу после сдачи.' },
  { n:'Марина Соколова', i:'МС', m:'Аэропорт Кневичи · июль 2026', st:5, t:'Прилетала во Владивосток, машина была нужна срочно. X-Trail подали прямо к аэропорту — чистый, полный бак, никаких скрытых платежей.' },
  { n:'Дмитрий Лазарев', i:'ДЛ', m:'Находка · июнь 2026', st:5, t:'Взял Noah в аренду с выкупом. Без банка, без первоначального взноса, платежи по графику. Через год минивэн будет мой — всё честно и прозрачно.' },
  { n:'Ольга Ким', i:'ОК', m:'Находка · сентябрь 2026', st:5, t:'Арендовала Toyota Aqua на выходные. Расход копеечный, оформление за 10 минут по паспорту. Однозначно вернусь ещё.' },
  { n:'Сергей Волошин', i:'СВ', m:'Владивосток · май 2026', st:5, t:'Заказывал авто с аукциона Японии. Показали аукционный лист, зафиксировали смету — ставка, доставка, растаможка. Приятно удивила поддержка на каждом этапе.' }
];
const STAR = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.9l-6.1 2.7 1.4-6.8L2.2 9.1l6.9-.8L12 2z"/></svg>';
const revHtml = reviews.map(r => `
        <article class="rvc">
          <div class="rvc__top">
            <div class="rvc__av">${r.i}</div>
            <div><div class="rvc__nm">${r.n}</div><div class="rvc__st">${STAR.repeat(r.st)}</div></div>
          </div>
          <p class="rvc__tx">${r.t}</p>
          <div class="rvc__meta">${r.m}</div>
        </article>`).join('');

tpl = tpl
  .replace(/{{HERO_IMG}}/g, big.hero)
  .replace(/{{HITS_IMG}}/g, big.hits)
  .replace(/{{STEPS_IMG}}/g, big.steps)
  .replace(/{{AUCTION_IMG}}/g, big.auction)
  .replace(/{{FOOTER_IMG}}/g, big.footer)
  .replace(/{{WHEEL_IMG}}/g, data.decor.wheel)
  .replace(/{{STEERING_IMG}}/g, data.decor.steering)
  .replace('{{HITS_HTML}}', hits)
  .replace('{{CATALOG_HTML}}', catalog)
  .replace('{{CAR_COUNT}}', String(cars.length))
  .replace('{{CAR_OPTIONS}}', carOptions)
  .replace('{{REVIEWS_HTML}}', revHtml)
  .replace('{{REV_N}}', String(reviews.length));

const left = tpl.match(/{{[A-Z_]+}}/g);
if (left) { console.error('UNRESOLVED:', [...new Set(left)]); process.exit(1); }

fs.writeFileSync(dir + 'grand-avto-v3.html', tpl);
console.log('Built:', Math.round(tpl.length/1024), 'KB · cars', cars.length, '· reviews', reviews.length);
