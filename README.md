# КЭМП — ЛИЛА

Telegram Mini App: игра самопознания, адаптированная под мужское сообщество Kemp Club.

## Архитектура

- **Фронт**: Next.js 14 (static export) + TypeScript + Tailwind CSS
- **TG SDK**: `@vkruglikov/react-telegram-web-app`
- **Состояние**: Zustand (будет подключено)
- **Хостинг**: Amvera Cloud (Россия)
- **Бэкенд**: Supabase (мультиплеер, авторизация, платежи)

## Локальный запуск

```bash
npm install
npm run dev
```

## Деплой на Amvera

```bash
git remote add amvera https://git.amvera.ru/ваш_юзернейм/kemp-lila-game
git push amvera main
```

## Этапы разработки

1. ✅ MVP: поле 72 клеток, бросок кубика, змеи/стрелы
2. 🔄 Контент: адаптация всех 72 клеток под Kemp
3. ⏳ Мультиплеер: Supabase Realtime
4. ⏳ Монетизация: подписка
5. ⏳ Админка: управление контентом

## Игровое поле

- 72 клетки, 6 уровней (планов сознания)
- Змеи (падения) и Стрелы (взлёты)
- Цель: клетка 72 — «ЛЕГЕНДА"
