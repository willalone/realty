# 🚀 Инструкции по деплою на GitHub Pages

## Автоматический деплой (рекомендуется)

1. **Настройте GitHub Pages:**
   - Перейдите в Settings → Pages
   - Source: "GitHub Actions"

2. **Деплой через GitHub Actions:**
   - При каждом push в ветку `main` автоматически запускается деплой
   - Проверьте статус в разделе "Actions"

## Ручной деплой

```bash
# Сборка проекта
npm run build

# Деплой на GitHub Pages
npm run deploy
```

## Проверка деплоя

После деплоя ваш сайт будет доступен по адресу:
**https://willalone.github.io/victory-realty/**

## Настройка домена (опционально)

1. Создайте файл `public/CNAME` с вашим доменом:
   ```
   yourdomain.com
   ```

2. Обновите `vite.config.ts`:
   ```typescript
   base: '/',
   ```

## Устранение проблем

- **404 ошибки:** Убедитесь, что `base: '/victory-realty/'` в vite.config.ts
- **Стили не загружаются:** Проверьте пути к assets в dist/
- **Email не работает:** Настройте SMTP переменные в GitHub Secrets
