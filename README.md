# MAMAY — сайт-презентация торгового терминала

Статический сайт (HTML/CSS/JS, без сборки). Публикуемая папка — `site/`.

## Структура
- `site/` — сам сайт (`index.html`, `css/`, `js/`, `assets/`).
- `site/assets/shots/` — снимки и записи экрана настоящего терминала MAMAY.
- `tools/` — скрипты съёмки терминала (`shoot.mjs`, `record.mjs`, `cdp.mjs`), нужен Node 22+ и Chrome.
- `.github/workflows/pages.yml` — автодеплой на GitHub Pages.

## Локальный просмотр
```bash
cd site
python -m http.server 5173
```

## Перед запуском
1. `site/js/config.js` — укажите `formEndpoint` (например, Formspree) или `contactEmail`, иначе форма заявок не отправляется.
2. `site/index.html` — после появления домена замените `og:image` на абсолютный URL.
3. Юридический блок в футере согласуйте с юристом.

## Обновление снимков терминала
```bash
node tools/shoot.mjs moex_flags "MOEX Флаги" --click "Скан" --wait 60
node tools/record.mjs terminal-live "Терминал" 9
```
Скрипты прячут баннер с IP и номер версии в сайдбаре.
