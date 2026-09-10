const fs = require('fs');
const dir = '/tmp/claude-0/-home-user-auto-website/16d1e8ad-1c45-53ab-ad9f-9567d11aab9b/scratchpad/';
const data = JSON.parse(fs.readFileSync(dir + 'images.json', 'utf8'));
let tpl = fs.readFileSync(dir + 'veluxe-template.html', 'utf8');

const typeLabel = { sedan:'Седан', hatchback:'Хэтчбек', suv:'Кроссовер', minivan:'Минивэн', van:'Универсал' };
const fmt = n => n.toLocaleString('ru-RU');

// per-car spec derivation
function specs(c){
  const hybrid = /Prius|Aqua|SAI/.test(c.name);
  const awd = /X-Trail|Vezel/.test(c.name);
  const seats = (c.type==='minivan')?7:(c.type==='van'?5:5);
  const year = c.name.match(/\d{4}/)[0];
  return {
    'Год': year,
    'Коробка': 'Автомат',
    'Двигатель': hybrid ? 'Гибрид' : 'Бензин',
    'Привод': awd ? 'Полный 4WD' : 'Передний',
    'Мест': String(seats),
    'Руль': 'Правый'
  };
}
function badgeType(c){ return typeLabel[c.type] || 'Авто'; }

// popularity order (featured first)
const popOrder = ['Toyota SAI 2013','Nissan X-Trail 2016','Toyota Noah 2015','Honda Vezel 2016','Honda Accord 2014','Toyota Wish 2013','Toyota Probox 2017','Toyota Corolla Axio 2016','Toyota Prius 2014','Toyota Aqua 2015','Nissan Note 2015','Honda Fit 2013'];
const cars = data.cars.slice().map(c=>({...c, pop: popOrder.indexOf(c.name)===-1?99:popOrder.indexOf(c.name)}));
cars.sort((a,b)=>a.pop-b.pop);

// ---- HITS (top 3) ----
const hits = cars.slice(0,3).map(c=>{
  const nm = c.name.replace(/\s\d{4}$/,'');
  const yr = c.name.match(/\d{4}/)[0];
  return `
    <article class="carcard">
      <div class="carcard__media">
        <span class="chip chip--glass badge-tl">${badgeType(c)}</span>
        <span class="chip chip--steel badge-tr">Хит</span>
        <span class="chip chip--glass badge-bl">${fmt(c.price)} ₽/сутки</span>
        <img src="${c.dataUri}" alt="${c.name} — прокат во Владивостоке">
      </div>
      <div class="carcard__body">
        <div class="carcard__row"><div class="carcard__name">${nm}</div><div class="carcard__year">${yr}</div></div>
        <div class="carcard__price"><b>${fmt(c.price)}</b> ₽ <span>/ сутки</span></div>
        <div class="carcard__foot">
          <button class="btn btn--steel" onclick="openModal('${nm} ${yr}')">Забронировать</button>
          <button class="btn btn--lineDk" onclick="document.getElementById('catalog').scrollIntoView()">Подробнее</button>
        </div>
      </div>
    </article>`;
}).join('');

// ---- CATALOG (all) ----
const catalog = cars.map(c=>{
  const nm = c.name.replace(/\s\d{4}$/,'');
  const yr = c.name.match(/\d{4}/)[0];
  const sp = specs(c);
  const specHtml = Object.entries(sp).map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
  return `
    <article class="carcard" data-name="${c.name.toLowerCase()}" data-type="${c.type}" data-price="${c.price}" data-pop="${c.pop}">
      <div class="carcard__media">
        <span class="chip chip--glass badge-tl">${badgeType(c)}</span>
        <span class="chip chip--glass badge-bl">${fmt(c.price)} ₽/сутки</span>
        <img src="${c.dataUri}" alt="${c.name} — аренда авто GRAND AVTO">
      </div>
      <div class="carcard__body">
        <div class="carcard__row"><div class="carcard__name">${nm}</div><div class="carcard__year">${yr}</div></div>
        <div class="carcard__price"><b>${fmt(c.price)}</b> ₽ <span>/ сутки</span></div>
        <div class="carcard__foot">
          <button class="btn btn--steel" style="flex:1;padding:12px 16px;font-size:.82rem" onclick="openModal('${nm} ${yr}')">Забронировать</button>
        </div>
        <button class="carcard__more" onclick="toggleCar(this)">Характеристики <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 9l6 6 6-6"/></svg></button>
        <div class="carcard__det"><div>
          <dl class="specs">${specHtml}</dl>
        </div></div>
      </div>
    </article>`;
}).join('');

// ---- CAR OPTIONS for selects ----
const carOptions = cars.map(c=>{
  const nm = c.name.replace(/\s\d{4}$/,'');
  const yr = c.name.match(/\d{4}/)[0];
  return `<option>${nm} ${yr}</option>`;
}).join('');

// ---- REVIEWS ----
const reviews = [
  {n:'Артём Ковалёв', i:'АК', m:'Владивосток · август 2026', t:'Брал Toyota SAI на неделю по работе. Машина идеальная, забрал за 15 минут прямо у порта. Цена честная, залог вернули сразу после сдачи.'},
  {n:'Марина Соколова', i:'МС', m:'Аэропорт Кневичи · июль 2026', t:'Прилетала во Владивосток, нужна была машина срочно. X-Trail подали прямо к аэропорту — чистый, полный бак, никаких скрытых платежей.'},
  {n:'Дмитрий Лазарев', i:'ДЛ', m:'Владивосток · июнь 2026', t:'Пятый раз беру у GRAND AVTO. Пригнали Honda Vezel из Японии под меня — состояние как новое. Ребята реально знают аукционный рынок.'},
  {n:'Ольга Ким', i:'ОК', m:'Находка · сентябрь 2026', t:'Арендовала Toyota Aqua на выходные в Находке. Расход копеечный, оформление за 10 минут по паспорту. Однозначно вернусь ещё.'},
  {n:'Сергей Волошин', i:'СВ', m:'Владивосток · май 2026', t:'Заказывал авто с аукциона Японии. Всё прозрачно: ставка, доставка, растаможка. Приятно удивила поддержка на каждом этапе сделки.'}
];
const star = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 18.1 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8L12 2z"/></svg>`;
const revHtml = reviews.map(r=>`
  <article class="rev-card">
    <div class="rev-card__q">
      <div class="rev-stars">${star}${star}${star}${star}${star}</div>
      <p class="rev-text">«${r.t}»</p>
      <div class="rev-who">
        <div class="rev-av">${r.i}</div>
        <div><div class="rev-nm">${r.n}</div><div class="rev-meta">${r.m}</div></div>
      </div>
    </div>
  </article>`).join('');
const dotsHtml = reviews.map((r,i)=>`<button class="rev-dot${i===0?' active':''}" aria-label="Отзыв ${i+1}" onclick="revGo(${i})"></button>`).join('');

tpl = tpl
  .replace(/{{HERO_IMG}}/g, data.hero)
  .replace(/{{WHEEL_IMG}}/g, data.decor.wheel)
  .replace(/{{STEERING_IMG}}/g, data.decor.steering)
  .replace('{{HITS_HTML}}', hits)
  .replace('{{CATALOG_HTML}}', catalog)
  .replace('{{CAR_COUNT}}', String(cars.length))
  .replace('{{CAR_OPTIONS}}', carOptions)
  .replace('{{REVIEWS_HTML}}', revHtml)
  .replace('{{DOTS_HTML}}', dotsHtml)
  .replace('{{REV_N}}', String(reviews.length));

fs.writeFileSync(dir + 'grand-avto-veluxe.html', tpl);
console.log('Done:', Math.round(tpl.length/1024), 'KB · cars', cars.length, '· reviews', reviews.length);
