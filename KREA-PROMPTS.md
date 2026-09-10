# Промпты для генерации изображений (Krea)

Модель: **Flux Schnell** (самая экономная) — качества хватает.
Если нужен максимум детализации на hero — только для него взять Flux Dev / Krea 1.

Все промпты на английском — модели понимают его точно лучше.
Общий стиль всех четырёх: тёмный, кинематографичный, премиальный, закат/сумерки — под референс VELUXE.

---

## 1. Главный экран (hero)

**Формат:** 16:9 · минимум 1920×1080

```
cinematic automotive photography, premium silver Japanese minivan (Toyota Alphard style),
three-quarter front view, parked on empty wet asphalt at dusk, deep black background,
low warm sunset rim light along the body, subtle ground fog, glossy reflections,
dramatic studio-grade lighting, shallow depth of field, moody dark tones,
ultra detailed, photorealistic, 8k, no text, no watermark, no people
```

**Negative:** `text, letters, logo, watermark, people, crowd, bright daylight, cluttered parking lot`

> Надпись «GRAND AVTO» за машиной **не генерируй** — я накладываю её кодом поверх фото,
> она получается идеально ровной и всегда читается. Если всё же хочешь запечь её в картинку,
> добавь в конец промпта: `huge bold sans-serif lettering "GRAND AVTO" on the wall far behind the car`
> — но будь готов, что буквы выйдут кривыми, это слабое место всех моделей.

---

## 2. Хиты проката (вертикальное фото слева)

**Формат:** 3:4 вертикальный · минимум 1200×1600

```
cinematic automotive photography, premium white Japanese minivan, side three-quarter view,
vertical composition, dark moody background, soft warm sunset light from the left,
clean empty asphalt, subtle reflections, luxury car rental aesthetic,
shallow depth of field, photorealistic, ultra detailed, 8k, no text, no people
```

**Negative:** `text, logo, watermark, people, other cars, daylight, clutter`

---

## 3. Арендуй за 3 шага / Аукцион (фон панели)

**Формат:** 16:9 · минимум 1920×1080
Сгенерируй **две штуки** — разные машины, чтобы блоки не повторялись.

```
cinematic wide shot of a dark premium Japanese car on an empty mountain road at sunset,
golden hour rim light, distant hills in soft haze, moody dark grading,
lots of empty dark space on the left side of the frame for text,
photorealistic, ultra detailed, 8k, no text, no people
```

**Negative:** `text, logo, watermark, people, traffic, bright sky, busy background`

> Важно: **слева должно быть пустое тёмное место** — туда ложится заголовок и кнопка.
> Это прямо прописано в промпте, не убирай эту строчку.

---

## 4. Финальный блок — горы

**Формат:** 16:9 широкий · минимум 1920×1080

```
empty desert highway leading straight toward a large dark mountain at sunset,
pale bright hazy sky at the top of the frame fading to deep dark ground at the bottom,
soft warm light, minimal cinematic landscape, wide panoramic composition,
photorealistic, ultra detailed, 8k, no text, no people, no cars
```

**Negative:** `text, logo, watermark, people, cars, buildings, dark sky, heavy clouds`

> Ключевое: **вверху кадра небо светлое и блёклое, внизу земля тёмная.**
> Так фото сверху сольётся со светлым блоком FAQ, а снизу — с чёрным блоком контактов,
> ровно как на референсе. Именно поэтому в промпте стоит `pale bright hazy sky at the top`.

---

## Как загружать

Положи файлы в корень репозитория с понятными именами — я сам их подхвачу:

| Файл | Куда пойдёт |
|---|---|
| `hero.png` | главный экран |
| `hits.png` | хиты проката, фото слева |
| `steps.png` | блок «арендуй за 3 шага» |
| `auction.png` | блок «купи с аукциона» |
| `mountain.png` | финальный блок с горой |

Разрешение — чем больше, тем лучше (от 1920px по ширине).
Текущие фото машин в репозитории всего 302×200, поэтому hero и приходится размывать.
