const fs = require('fs');
const SCRATCH = '/tmp/claude-0/-home-user-auto-website/16d1e8ad-1c45-53ab-ad9f-9567d11aab9b/scratchpad';
const images = JSON.parse(fs.readFileSync(SCRATCH + '/images.json', 'utf8'));

// Build dots HTML separately
const reviews = [
  { name: 'Александр К.', text: 'Арендовал Honda Fit на 2 месяца. Машина в отличном состоянии, расход бензина минимальный. Оформление заняло 15 минут, всё чётко и прозрачно.', rating: 5 },
  { name: 'Мария С.', text: 'Брала Toyota Prius под выкуп. За полгода ни одной проблемы. Ребята всегда на связи, помогают с любыми вопросами. Рекомендую!', rating: 5 },
  { name: 'Дмитрий В.', text: 'Nissan X-Trail для семейных поездок — идеальный вариант. Чистая, ухоженная машина. Гибкие условия оплаты, без скрытых комиссий.', rating: 5 },
  { name: 'Елена П.', text: 'Второй раз арендую через GRAND AVTO. Выбор машин хороший, цены адекватные. Очень удобно, что есть возможность выкупа.', rating: 4 },
  { name: 'Сергей Н.', text: 'Взял Toyota Wish для работы в такси. Машина надёжная, условия аренды выгодные. Спасибо команде за оперативность!', rating: 5 },
];

const dotsHTML = reviews.map(function(_, i) {
  return '<div class="reviews__dot ' + (i === 1 ? 'reviews__dot--active' : '') + '" onclick="goToReview(' + i + ')"></div>';
}).join('');

const reviewsHTML = reviews.map(function(r, i) {
  return '<div class="review-card ' + (i === 1 ? 'review-card--active' : '') + '">' +
    '<div class="review-card__stars">' + '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating) + '</div>' +
    '<p class="review-card__text">' + r.text + '</p>' +
    '<div class="review-card__author">' + r.name + '</div></div>';
}).join('\n');

function carCard(car, idx) {
  var badges = [];
  if (car.type === 'suv') badges.push('Кроссовер');
  else if (car.type === 'sedan') badges.push('Седан');
  else if (car.type === 'hatchback') badges.push('Хэтчбек');
  else if (car.type === 'minivan') badges.push('Минивэн');
  else if (car.type === 'van') badges.push('Фургон');
  
  var statuses = ['Растаможен', 'Под заказ', 'Аукцион'];
  var status = statuses[idx % 3];
  var parts = car.name.split(' ');
  var makeModel = parts[0] + ' ' + parts[1];
  var year = parts[2];
  
  return '<div class="car-card" data-type="' + car.type + '" data-price="' + car.price + '">' +
    '<div class="car-card__img"><img src="' + car.dataUri + '" alt="' + car.name + '" loading="lazy">' +
    '<span class="car-card__badge">' + badges[0] + '</span></div>' +
    '<div class="car-card__body">' +
    '<div class="car-card__top"><h3 class="car-card__name">' + makeModel + '</h3><span class="car-card__year">' + year + '</span></div>' +
    '<div class="car-card__price">' + car.price.toLocaleString('ru-RU') + ' ₽<span>/сутки</span></div>' +
    '<div class="car-card__status">' + status + '</div>' +
    '<div class="car-card__details" hidden>' +
    '<div class="car-card__specs">' +
    '<div class="spec-item"><span class="spec-label">Привод</span><span class="spec-val">Передний</span></div>' +
    '<div class="spec-item"><span class="spec-label">КПП</span><span class="spec-val">Автомат</span></div>' +
    '<div class="spec-item"><span class="spec-label">Двигатель</span><span class="spec-val">1.5L</span></div>' +
    '<div class="spec-item"><span class="spec-label">Пробег</span><span class="spec-val">' + (40 + idx * 12) + 'т. км</span></div>' +
    '</div>' +
    '<p class="car-card__desc">Аренда с выкупом в Находке. Никаких скрытых платежей, гибкие условия. Лимит пробега 250 км/сут.</p>' +
    '<button class="btn btn--red car-card__rent" onclick="openRentalModal(\'' + car.name.replace(/'/g, "\\'") + '\', ' + car.price + ')">Арендовать</button>' +
    '</div>' +
    '<button class="car-card__more" onclick="toggleDetails(this)">Подробнее</button>' +
    '</div></div>';
}

var carsHTML = images.cars.map(function(c, i) { return carCard(c, i); }).join('\n');

// Now read the template and do replacements
var tmpl = fs.readFileSync(SCRATCH + '/landing-template.html', 'utf8');
tmpl = tmpl.replace('{{HERO_IMG}}', images.hero);
tmpl = tmpl.replace('{{WHEEL_IMG}}', images.decor.wheel);
tmpl = tmpl.replace('{{STEERING_IMG}}', images.decor.steering);
tmpl = tmpl.replace('{{CARS_HTML}}', carsHTML);
tmpl = tmpl.replace('{{REVIEWS_HTML}}', reviewsHTML);
tmpl = tmpl.replace('{{DOTS_HTML}}', dotsHTML);
tmpl = tmpl.replace('{{TOTAL_REVIEWS}}', String(reviews.length));

fs.writeFileSync(SCRATCH + '/grand-avto-landing.html', tmpl, 'utf8');
console.log('Done:', (tmpl.length / 1024).toFixed(0), 'KB');
