# Koubou

Холст для генерации и правки картинок через CloseRouter. React, Vite, Konva, Tailwind, shadcn

## Запуск

- Зависимости: `npm install`
- Dev-сервер: `npm run dev` или двойной щелчок по `start.cmd` → http://127.0.0.1:5173/
- `start.cmd` ждёт ответ сервера, открывает страницу в браузере и держит Vite в том же окне. Закрытие окна останавливает сервер
- Ключ CloseRouter: `CLOSEROUTER_API_KEY` в `.env` или поле в настройках (`localStorage`, ключ `closerouterApiKey`). Пустое поле в настройках не затирает ключ из `.env`: его подставляет прокси
- Выбранная модель хранится в `localStorage` как `modelId`. По умолчанию GPT Image 2.5 Flare
- На этой Windows `bun.exe` не запускать: процесс не отвечает и поднимает CPU до 100%. Скрипты `dev` и `start` переведены на Vite

## Модели

Каталог: `src/lib/models.ts`. Имена совпадают с каталогом CloseRouter `GET /v1/media/models`. Запрос: `src/lib/generateImage.ts` на `/api/closerouter/images/generations` или `/images/edits`. Холст подставляет результат в `src/hooks/useGeneration.ts`

- `openai/gpt-image-2.5-flare` — GPT Image 2.5 Flare, быстрая, как Flash
- `openai/gpt-image-2.5-sunburst` — GPT Image 2.5 Sunburst, как Pro
- `google/gemini-3.1-flash-image-preview` — Nano Banana 2
- `google/gemini-3-pro-image` — Nano Banana Pro
- `qwen/qwen-image-3.0` и `qwen/qwen-image-3.0-pro`

Браузер не ходит на CloseRouter сам: CORS. `vite.imageProxy.ts` принимает `/api/closerouter/images/*` и в dev, и в preview, пересылает на `https://api.closerouter.dev/v1`. Ответ картинки — `b64_json`. Референсов не больше 4

## Грабли окружения

- Vite по умолчанию слушал только `[::1]`. Браузер и `curl` на `127.0.0.1` до него не доходили. В `vite.config.ts` у `server` и `preview` задан `host: "127.0.0.1"`
