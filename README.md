# Мониторинг очереди на границе Беларусь-ЕС 🚗

Простое веб-приложение для отслеживания очереди легковых автомобилей на КПП Беларусь-ЕС в реальном времени.

**Сайт работает из любой страны** — идеально для мониторинга очереди издалека!

## Функции

- ✅ Мониторинг 6 КПП (Бенякони, Каменный Лог, Берестовица, Брест, Брузги, Григоровщина)
- ✅ Живое обновление данных очереди
- ✅ Информация о КПП (адрес, телефоны)
- ✅ Таблица очереди с номерами машин
- ✅ Кнопка ручного обновления
- ✅ Мобильный дизайн
- ✅ Доступ из-за границы

## Быстрый старт (локально)

```bash
# 1. Клонируйте репозиторий
git clone <your-repo-url>
cd border-queue-monitor

# 2. Установите зависимости
npm install

# 3. Запустите dev сервер
npm run dev

# 4. Откройте http://localhost:5173
```

---

## 🚀 Развертывание на Vercel (рекомендуется)

### Вариант 1: Через GitHub

1. **Загрузите код на GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/border-queue-monitor.git
   git push -u origin main
   ```

2. **Подключитесь к Vercel**
   - Перейдите на https://vercel.com
   - Нажмите "Sign in with GitHub"
   - Нажмите "New Project"
   - Выберите ваш репозиторий `border-queue-monitor`
   - Нажмите "Deploy"

**Готово!** Ваше приложение работает на `https://your-project.vercel.app`

### Вариант 2: Прямое развертывание из папки

1. **Установите Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Разверните
   ```bash
   vercel
   ```

3. **Следуйте подсказкам**
   - Выберите организацию
   - Подтвердите имя проекта
   - Нажмите "Deploy"

---

## 🚀 Развертывание на Netlify

### Вариант 1: Через GitHub

1. **Загрузите на GitHub** (как выше)

2. **Подключитесь к Netlify**
   - Перейдите на https://netlify.com
   - Нажмите "Add new site"
   - Выберите "Import an existing project"
   - Выберите GitHub, авторизуйтесь
   - Выберите репозиторий
   - Настройки:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - Нажмите "Deploy site"

**Готово!** Ваше приложение работает на `https://your-site.netlify.app`

### Вариант 2: Через Netlify CLI

```bash
# Установите Netlify CLI
npm i -g netlify-cli

# Логинитесь
netlify login

# Разверните
netlify deploy --prod --dir=dist
```

---

## 🚀 Развертывание на GitHub Pages

1. **Установите параметры сборки**
   
   Отредактируйте `vite.config.js`:
   ```js
   export default defineConfig({
     base: '/border-queue-monitor/', // Замените на имя вашего репо
     // ... остальное
   })
   ```

2. **Создайте GitHub Actions workflow**
   
   Создайте файл `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
       - uses: actions/checkout@v3
       - uses: actions/setup-node@v3
         with:
           node-version: 18
       - run: npm install
       - run: npm run build
       - uses: peaceiris/actions-gh-pages@v3
         with:
           github_token: ${{ secrets.GITHUB_TOKEN }}
           publish_dir: ./dist
   ```

3. **Загрузите на GitHub и дождитесь развертывания**

---

## 📝 Настройка

### Добавить новый КПП

Отредактируйте `src/App.jsx`, найдите массив `checkpoints`:

```jsx
const checkpoints = [
  { id: 'checkpoint-id', name: 'Имя КПП' },
  // Добавьте новый КПП сюда
];
```

---

## 🔧 Технический стек

- **React 18** — UI компоненты
- **Vite** — быстрая сборка
- **Tailwind CSS** — стили
- **Lucide React** — иконки

---

## 📡 API

Данные берутся из https://belarusborder.by/info/monitoring-new

Формат ответа:
```json
{
  "info": {
    "name": "Имя КПП",
    "address": "Адрес",
    "phone": "Телефон"
  },
  "carLiveQueue": [
    {
      "order_id": 1,
      "regnum": "AB1234",
      "status": 2,
      "registration_date": "10:30:00 27.06.2026",
      "changed_date": "10:30:00 27.06.2026"
    }
  ]
}
```

---

## ⚠️ Дисклеймер

Это неофициальное приложение. Информация предоставляется в информационных целях. Для официальной информации посещайте https://belarusborder.by

---

## 📄 Лицензия

MIT

---

## 💬 Поддержка

Если возникают проблемы:

1. Проверьте, что у вас установлены Node.js 16+ и npm
2. Удалите `node_modules` и запустите `npm install` заново
3. Очистите браузер кеш (Ctrl+Shift+Delete)
4. Проверьте консоль браузера (F12) на ошибки

---

**Made with ❤️ for travellers**
