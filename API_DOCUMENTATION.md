# 📡 API Документация

## Основной API

### URL
```
https://belarusborder.by/info/monitoring-new?token=test&checkpointId={checkpointId}
```

### Параметры
- `token`: всегда `test`
- `checkpointId`: UUID КПП

### Ответ (JSON)

```json
{
  "info": {
    "id": "53d94097-2b34-11ec-8467-ac1f6bf889c0",
    "name": "Бенякони",
    "nameEn": "Benyakoni",
    "address": "Гродненская область, Вороновский район, деревня Бенякони",
    "phone": "+375 (33) 654-22-04, +375 (15) 944-60-30",
    "isBts": 1
  },
  "carLiveQueue": [
    {
      "regnum": "AB1234",
      "status": 2,
      "order_id": 1,
      "type_queue": 3,
      "registration_date": "10:30:00 27.06.2026",
      "changed_date": "10:30:00 27.06.2026"
    }
  ],
  "truckLiveQueue": [
    {
      "regnum": "KTS291",
      "status": 2,
      "order_id": 1,
      "type_queue": 3,
      "registration_date": "05:09:01 27.06.2026",
      "changed_date": "05:09:01 27.06.2026"
    }
  ]
}
```

## Поля

### info
- `id`: UUID КПП
- `name`: Название на русском
- `nameEn`: Название на английском
- `address`: Полный адрес КПП
- `phone`: Контактные телефоны
- `isBts`: Флаг (1 = есть, 0 = нет)

### carLiveQueue (Легковые авто)
- `regnum`: Номер регистрации
- `status`: Статус (2 = в очереди)
- `order_id`: Место в очереди (номер)
- `type_queue`: Тип очереди (3 обычно)
- `registration_date`: Дата/время добавления
- `changed_date`: Дата/время последнего изменения

### truckLiveQueue (Грузовики)
- Аналогично carLiveQueue

## КПП и их IDs

| Название | ID |
|----------|-----|
| Бенякони | `53d94097-2b34-11ec-8467-ac1f6bf889c0` |
| Каменный Лог | `b60677d4-8a00-4f93-a781-e129e1692a03` |
| Берестовица | `7e46a2d1-ab2f-11ec-bafb-ac1f6bf889c1` |
| Брест | `a9173a85-3fc0-424c-84f0-defa632481e4` |
| Брузги | `3b797d4d-706a-440f-a1a4-826c191e1e36` |
| Григоровщина | `ffe81c11-00d6-11e8-a967-b0dd44bde851` |

## Примеры запросов

### Получить очередь Бенякони
```javascript
fetch('https://belarusborder.by/info/monitoring-new?token=test&checkpointId=53d94097-2b34-11ec-8467-ac1f6bf889c0')
  .then(r => r.json())
  .then(data => console.log(data.carLiveQueue))
```

### С обработкой ошибок
```javascript
async function getQueueData(checkpointId) {
  try {
    const response = await fetch(
      `https://belarusborder.by/info/monitoring-new?token=test&checkpointId=${checkpointId}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    return null;
  }
}
```

## Расширение функционала

### Добавить новый КПП

Отредактируйте `src/App.jsx`:

```jsx
const checkpoints = [
  { id: '53d94097-2b34-11ec-8467-ac1f6bf889c0', name: 'Бенякони' },
  // Добавьте здесь:
  { id: 'new-uuid-here', name: 'Новый КПП' },
];
```

### Показать грузовики вместо легковых

Измените в `src/App.jsx`:

```jsx
// С этого:
const queue = data?.carLiveQueue || [];

// На это:
const queue = data?.truckLiveQueue || [];
```

### Автоматическое обновление данных

Добавьте в `src/App.jsx` после `useEffect`:

```jsx
// Автообновление каждые 30 секунд
useEffect(() => {
  const interval = setInterval(() => {
    fetchQueueData(selectedCheckpoint);
  }, 30000);
  
  return () => clearInterval(interval);
}, [selectedCheckpoint]);
```

### Отправка уведомлений (опционально)

Для интеграции с Telegram (требует backend):

```javascript
async function notifyUser(message) {
  await fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
}
```

### Кэширование данных (улучшение производительности)

```javascript
const [cache, setCache] = useState({});
const [cacheTime, setCacheTime] = useState(0);

const fetchQueueData = async (checkpointId) => {
  const now = Date.now();
  
  // Используем кеш если данные свежие (менее 60 сек)
  if (cache[checkpointId] && now - cacheTime < 60000) {
    setData(cache[checkpointId]);
    return;
  }
  
  // Иначе загружаем
  const response = await fetch(...);
  const data = await response.json();
  
  setCache({ ...cache, [checkpointId]: data });
  setCacheTime(now);
  setData(data);
};
```

## CORS и прокси

Если при развертывании появляются CORS ошибки, используйте прокси-сервис:

### Вариант 1: cors-anywhere

```javascript
const apiUrl = `https://cors-anywhere.herokuapp.com/https://belarusborder.by/info/monitoring-new?token=test&checkpointId=${checkpointId}`;
```

### Вариант 2: Создать собственный backend (Node.js)

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());

app.get('/api/queue/:checkpointId', async (req, res) => {
  try {
    const response = await fetch(
      `https://belarusborder.by/info/monitoring-new?token=test&checkpointId=${req.params.checkpointId}`
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

## Обработка ошибок

### Возможные ошибки

| Ошибка | Причина | Решение |
|--------|---------|---------|
| CORS error | API блокирует запросы | Используйте прокси |
| 404 | Неправильный checkpointId | Проверьте ID |
| Timeout | Сервер недоступен | Попробуйте позже |
| Empty queue | Нет очереди | Это нормально! |

### Логирование ошибок

```javascript
const fetchQueueData = async (checkpointId) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    setData(data);
    
    // Логирование
    console.log(`[${new Date().toISOString()}] Успешно загружены данные для ${checkpointId}`);
    
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Ошибка:`, err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

## Примеры интеграций

### Интеграция с Telegram Bot

```javascript
// Отправить в Telegram при изменении очереди
if (queue.length > 10) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `⚠️ Очередь на ${info.name} выросла до ${queue.length} машин!`
    })
  });
}
```

### Сохранение истории в базу данных

```javascript
// Сохранить статистику в Firebase
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push } from 'firebase/database';

const db = getDatabase();

async function saveQueueStats(checkpointId, queueLength) {
  await push(ref(db, 'queue_history'), {
    checkpoint: checkpointId,
    queue_length: queueLength,
    timestamp: new Date().toISOString()
  });
}
```

## Тестирование API

### Через curl

```bash
curl "https://belarusborder.by/info/monitoring-new?token=test&checkpointId=53d94097-2b34-11ec-8467-ac1f6bf889c0"
```

### Через Python

```python
import requests

url = "https://belarusborder.by/info/monitoring-new?token=test&checkpointId=53d94097-2b34-11ec-8467-ac1f6bf889c0"
response = requests.get(url)
data = response.json()

print(f"Очередь на {data['info']['name']}: {len(data['carLiveQueue'])} машин")

for car in data['carLiveQueue'][:5]:  # Первые 5
    print(f"#{car['order_id']}: {car['regnum']}")
```

### Через JavaScript в браузере

```javascript
// Откройте консоль браузера (F12) и выполните:

fetch('https://belarusborder.by/info/monitoring-new?token=test&checkpointId=53d94097-2b34-11ec-8467-ac1f6bf889c0')
  .then(r => r.json())
  .then(data => {
    console.log(`КПП: ${data.info.name}`);
    console.log(`Очередь легковых: ${data.carLiveQueue.length}`);
    console.log(`Очередь грузовиков: ${data.truckLiveQueue.length}`);
  });
```

## Лимиты

- Нет известных рейт-лимитов на API
- Рекомендуется обновлять данные не чаще 1 раза в 10 секунд
- API работает без аутентификации

## Лицензия

Данные из https://belarusborder.by предоставляются в информационных целях.
Используйте ответственно.
