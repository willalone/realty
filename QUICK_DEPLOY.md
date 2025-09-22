# ⚡ Быстрое развертывание на GitHub Pages

## 🎯 За 5 минут ваш сайт будет в интернете!

### 1️⃣ Создайте репозиторий на GitHub
1. Идите на https://github.com/new
2. Название: `realty-website`
3. Публичный репозиторий ✅
4. Нажмите "Create repository"

### 2️⃣ Загрузите код
```bash
cd /Users/user/Desktop/realty
git remote add origin https://github.com/ВАШ_USERNAME/realty-website.git
git branch -M main
git push -u origin main
```

### 3️⃣ Включите GitHub Pages
1. В репозитории: **Settings** → **Pages**
2. Source: **GitHub Actions**
3. Сохраните

### 4️⃣ Готово! 🎉
Ваш сайт: `https://ВАШ_USERNAME.github.io/realty-website/`

## 🔧 Если что-то пошло не так

### Проверьте:
- ✅ Репозиторий публичный
- ✅ Включены GitHub Pages
- ✅ Workflow файл создан
- ✅ Коммит отправлен

### Логи:
- **Actions** → **Deploy to GitHub Pages** → проверьте статус

## 📞 Настройка Telegram бота
1. **Создайте файл `.env`** на основе `env.example`
2. **Заполните данные бота** (токен и Chat ID)
3. **Перезапустите сервер** после настройки

Подробная инструкция в файле `ENV_SETUP.md`

---
**Время развертывания: ~5 минут** ⏱️
