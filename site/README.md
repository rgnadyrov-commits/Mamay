# Сайт MAMAY

Статический сайт (HTML/CSS/JS), без сборки. Открыть `index.html` или раздать любым хостингом
(Netlify, Cloudflare Pages, GitHub Pages, обычный nginx).

Локальный просмотр: `python -m http.server 5173` в папке `site`.

## Перед запуском в продакшн
1. `js/config.js` — укажите `formEndpoint` (Formspree и т. п.) или `contactEmail`, иначе форма заявок не отправляется.
2. `index.html` — добавьте домен в `og:image` (нужен абсолютный URL) и при желании счётчик аналитики.
3. Юридический блок внизу страницы согласуйте с юристом.

## Реальные экраны терминала
Скриншоты и видео в `assets/shots` сняты с запущенного терминала (http://localhost:8000):
`tools/shoot.mjs` — снимок экрана, `tools/record.mjs` — запись WebM. Нужен Chrome с `--remote-debugging-port=9333`.
Пример: `node tools/shoot.mjs moex_flags "MOEX Флаги" --click "Скан" --wait 60`
Скрипты прячут баннер с IP, блок депозита и версию в сайдбаре.
