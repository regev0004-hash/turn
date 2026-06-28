# ⚡ Быстрый старт

## За 5 минут на Vercel (самый простой способ)

### Шаг 1: Подготовка
1. Убедитесь, что у вас есть аккаунт GitHub
2. Загрузите этот код на GitHub:
   - Создайте новый репозиторий на GitHub (https://github.com/new)
   - Назовите его `border-queue-monitor`
   - Скопируйте все файлы туда

### Шаг 2: Развертывание на Vercel
1. Откройте https://vercel.com
2. Нажмите **"Sign up"** и выберите GitHub
3. Авторизуйтесь через GitHub
4. Нажмите **"Add New..." → "Project"**
5. Выберите ваш репозиторий `border-queue-monitor`
6. Нажмите **"Deploy"**

✅ **Готово!** Через 1-2 минуты приложение работает на `https://border-queue-monitor.vercel.app`

---

## Локальный запуск (для разработки)

```bash
# Установите Node.js с https://nodejs.org

# Откройте терминал/PowerShell в папке проекта и выполните:
npm install
npm run dev

# Откройте http://localhost:5173
```

---

## Настройка автообновления (опционально)

В файле `src/App.jsx` найдите строку:
```jsx
const [lastUpdate, setLastUpdate] = useState(null);
```

Добавьте ниже (для автообновления каждые 30 секунд):
```jsx
useEffect(() => {
  const interval = setInterval(() => {
    fetchQueueData(selectedCheckpoint);
  }, 30000); // 30 секунд
  
  return () => clearInterval(interval);
}, [selectedCheckpoint]);
```

---

## Проблемы?

**"Cannot find module 'react'"**
- Решение: `npm install`

**Приложение не обновляет данные**
- Решение: Нажмите кнопку "Обновить" или обновите страницу (F5)

**Ошибка CORS**
- Это может быть проблема. Проверьте консоль браузера (F12)

---

## Готово! 🎉

Поделитесь ссылкой с друзьями!
