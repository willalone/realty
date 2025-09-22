# 🚀 Настройка и запуск Victory Realty

## 📁 Структура проекта

```
victory-realty/
├── .github/workflows/     # GitHub Actions для автодеплоя
├── api/                   # Serverless функции
├── public/                # Статические файлы
│   ├── img/              # Изображения проектов
│   ├── 404.html          # Страница ошибки 404
│   ├── policy.html       # Политика конфиденциальности
│   ├── robots.txt        # SEO
│   ├── sitemap.xml       # Карта сайта
│   └── styles.css        # Стили для статических страниц
├── src/                   # Исходный код React
│   ├── App.tsx           # Главный компонент
│   ├── main.tsx          # Точка входа
│   └── styles.css        # Стили приложения
├── .gitignore            # Игнорируемые файлы
├── DEPLOY.md             # Инструкции по деплою
├── package.json          # Зависимости и скрипты
├── README.md             # Документация
├── SETUP.md              # Этот файл
├── tsconfig.json         # Конфигурация TypeScript
└── vite.config.ts        # Конфигурация Vite
```

## ⚡ Быстрый старт

```bash
# 1. Установка зависимостей
npm install

# 2. Запуск в режиме разработки
npm run dev

# 3. Открыть в браузере
# http://localhost:5173
```

## 🛠 Команды

```bash
npm run dev      # Запуск сервера разработки
npm run build    # Сборка для продакшена
npm run preview  # Предварительный просмотр сборки
npm run deploy   # Деплой на GitHub Pages
```

## 🌐 Деплой на GitHub Pages

### Автоматический деплой (рекомендуется)

1. **Настройте репозиторий:**
   - Перейдите в Settings → Pages
   - Source: "GitHub Actions"

2. **Загрузите код на GitHub:**
   ```bash
   git remote add origin https://github.com/willalone/victory-realty.git
   git push -u origin main
   ```

3. **Деплой запустится автоматически!**

### Ручной деплой

```bash
npm run deploy
```

## 📧 Настройка email

Для работы форм создайте файл `.env.local`:

```env
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-password
EMAIL_TO=linaplsn22@gmail.com
```

## ✅ Что готово

- ✅ Чистая структура проекта
- ✅ Настроен для GitHub Pages
- ✅ Автоматический деплой через GitHub Actions
- ✅ SEO оптимизация (meta tags, robots.txt, sitemap)
- ✅ Адаптивный дизайн
- ✅ Система записи на просмотр
- ✅ Валидация форм
- ✅ Отправка email
- ✅ Удалена вкладка "Карта"

## 🎯 Результат

После деплоя сайт будет доступен по адресу:
**https://willalone.github.io/victory-realty/**

## 📱 Контакты

- **Телефон:** +7(988)-470-78-93
- **Email:** info@victory-realty.ru
