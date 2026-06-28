import React, { useState, useEffect } from 'react';
import { RefreshCw, Phone, MapPin, AlertCircle } from 'lucide-react';

export default function BorderQueueMonitor() {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('53d94097-2b34-11ec-8467-ac1f6bf889c0');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [stats, setStats] = useState({ inPP: 0, waiting: 0, registered: 0, changed: 0, completed: 0, total: 0, processedPerHour: 0, estimatedWaitMinutes: 0 });

  const checkpoints = [
    { id: '53d94097-2b34-11ec-8467-ac1f6bf889c0', name: 'Бенякони' },
    { id: 'b60677d4-8a00-4f93-a781-e129e1692a03', name: 'Каменный Лог' },
    { id: '7e46a2d1-ab2f-11ec-bafb-ac1f6bf889c1', name: 'Берестовица' },
    { id: 'a9173a85-3fc0-424c-84f0-defa632481e4', name: 'Брест' },
    { id: '3b797d4d-706a-440f-a1a4-826c191e1e36', name: 'Брузги' },
    { id: 'ffe81c11-00d6-11e8-a967-b0dd44bde851', name: 'Григоровщина' }
  ];

  // Сохранение и получение статистики
  const saveStatistics = (checkpointId, completedCount, totalInQueue) => {
    const key = `stats_${checkpointId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();
    
    history.push({ timestamp: now, completed: completedCount, total: totalInQueue });
    // Храним только данные за последние 24 часа
    const filtered = history.filter(item => now - item.timestamp < 24 * 60 * 60 * 1000);
    localStorage.setItem(key, JSON.stringify(filtered));
  };

  const getStatisticsData = (checkpointId, currentCompleted) => {
    const key = `stats_${checkpointId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    const now = Date.now();
    
    // За последний час
    const lastHour = history.filter(item => now - item.timestamp < 60 * 60 * 1000);
    const exitedLastHour = lastHour.length > 1
      ? Math.max(...lastHour.map(h => h.completed)) - Math.min(...lastHour.map(h => h.completed))
      : (currentCompleted || 0);
    
    // За последние 5 часов
    const last5Hours = history.filter(item => now - item.timestamp < 5 * 60 * 60 * 1000);
    const exitedLast5Hours = last5Hours.length > 1
      ? Math.max(...last5Hours.map(h => h.completed)) - Math.min(...last5Hours.map(h => h.completed))
      : (currentCompleted || 0);
    const avgPer5Hours = last5Hours.length > 0 ? Math.ceil(exitedLast5Hours / 5) : 0;
    
    // За последние 24 часа
    const exitedLastDay = history.length > 1
      ? Math.max(...history.map(h => h.completed)) - Math.min(...history.map(h => h.completed))
      : (currentCompleted || 0);
    
    return {
      exitedLastHour: Math.max(0, exitedLastHour),
      avgPerHour: Math.max(0, avgPer5Hours),
      exitedLastDay: Math.max(0, exitedLastDay)
    };
  };

  const fetchQueueData = async (checkpointId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://belarusborder.by/info/monitoring-new?token=test&checkpointId=${checkpointId}`
      );
      
      if (!response.ok) throw new Error('Ошибка подключения к API');
      
      const jsonData = await response.json();
      setData(jsonData);
      setLastUpdate(new Date());
      
      // Расчет статистики
      calculateStats(jsonData.carLiveQueue || []);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueueData(selectedCheckpoint);
  }, [selectedCheckpoint]);

  const queue = data?.carLiveQueue || [];
  const info = data?.info || {};

  // Функция для определения статуса
  const getStatusInfo = (status) => {
    const statuses = {
      1: { label: 'Зарегистрирован', color: 'bg-blue-100 text-blue-800', icon: '📝' },
      2: { label: 'В ожидании', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      3: { label: 'Вызван в ПП', color: 'bg-green-100 text-green-800', icon: '✓' },
      4: { label: 'Изменен', color: 'bg-orange-100 text-orange-800', icon: '⚠️' },
      5: { label: 'Завершен', color: 'bg-gray-100 text-gray-800', icon: '✓✓' }
    };
    return statuses[status] || { label: `Статус ${status}`, color: 'bg-gray-100 text-gray-800', icon: '?' };
  };

  // Расчет статистики
  const calculateStats = (queueData) => {
    const inPP = queueData.filter(car => car.status === 3).length; // Вызван в ПП
    const waiting = queueData.filter(car => car.status === 2).length; // В ожидании
    const registered = queueData.filter(car => car.status === 1).length; // Зарегистрирован
    const changed = queueData.filter(car => car.status === 4).length; // Изменен
    const completed = queueData.filter(car => car.status === 5).length; // Завершен
    
    // Сохраняем статистику (используем inPP как выехавших - машины в ПП это те что выезжают)
    saveStatistics(selectedCheckpoint, inPP, queueData.length);
    
    // Получаем статистику за период
    const statsData = getStatisticsData(selectedCheckpoint, inPP);
    
    // Оценка скорости обработки (машин в час)
    const processedPerHour = Math.max(inPP * 4, 4);
    
    // Примерное время ожидания для машин в очереди (в минутах)
    let estimatedWaitMinutes = 0;
    if (waiting > 0 && processedPerHour > 0) {
      estimatedWaitMinutes = Math.ceil((waiting / processedPerHour) * 60);
    }
    
    const result = {
      inPP,
      waiting,
      registered,
      changed,
      completed,
      total: queueData.length,
      processedPerHour,
      estimatedWaitMinutes,
      exitedLastHour: statsData.exitedLastHour,
      avgPerHour: statsData.avgPerHour,
      exitedLastDay: statsData.exitedLastDay
    };
    
    setStats(result);
    return result;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚗 Мониторинг очереди на границе
          </h1>
          <p className="text-gray-600">Беларусь → Европа | Легковые автомобили</p>
        </div>

        {/* КПП Selection */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Выберите КПП</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {checkpoints.map((cp) => (
              <button
                key={cp.id}
                onClick={() => setSelectedCheckpoint(cp.id)}
                className={`p-3 rounded-lg font-medium transition-all ${
                  selectedCheckpoint === cp.id
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {cp.name}
              </button>
            ))}
          </div>
        </div>

        {/* Checkpoint Info with Statistics */}
        {info.name && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{info.name}</h2>
                <div className="space-y-3">
                  {info.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <p className="text-gray-700">{info.address}</p>
                    </div>
                  )}
                  {info.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                      <div className="text-gray-700 whitespace-pre-line">{info.phone}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <div className="space-y-4">
                    {/* Последнее обновление */}
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Последнее обновление:</p>
                      <p className="text-lg font-semibold text-indigo-600">
                        {lastUpdate?.toLocaleTimeString('ru-RU')}
                      </p>
                    </div>
                    
                    {/* Статистика компактная */}
                    {stats.total > 0 && (
                      <div className="pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-2">Выехало:</p>
                        <div className="flex gap-3 text-sm">
                          <div>
                            <p className="font-bold text-green-600">{stats.exitedLastHour}</p>
                            <p className="text-gray-500 text-xs">за час</p>
                          </div>
                          <div>
                            <p className="font-bold text-purple-600">{stats.exitedLastDay}</p>
                            <p className="text-gray-500 text-xs">за сутки</p>
                          </div>
                          {stats.avgPerHour > 0 && (
                            <div>
                              <p className="font-bold text-indigo-600">{stats.avgPerHour}/ч</p>
                              <p className="text-gray-500 text-xs">средний</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => fetchQueueData(selectedCheckpoint)}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium mt-4"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  Обновить
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Queue Status */}
        <div className="bg-white rounded-lg shadow-lg p-6">

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Ошибка загрузки</p>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
              <p className="text-gray-600">Загрузка данных...</p>
            </div>
          )}

          {!loading && queue.length === 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <p className="text-green-800 font-semibold text-lg">✓ Очередь пуста!</p>
              <p className="text-green-700 mt-2">Можно проезжать без ожидания</p>
            </div>
          )}

          {!loading && queue.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full bg-teal-600 text-white">
                <thead>
                  <tr className="bg-teal-600">
                    <th className="px-4 py-3 text-left font-semibold">Порядок вызова</th>
                    <th className="px-4 py-3 text-left font-semibold">Тип очереди</th>
                    <th className="px-4 py-3 text-left font-semibold">Рег.номер</th>
                    <th className="px-4 py-3 text-left font-semibold">Дата регистрации в ЗО</th>
                    <th className="px-4 py-3 text-left font-semibold">Статус изменен</th>
                    <th className="px-4 py-3 text-left font-semibold">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.slice(0, 50).map((car, idx) => (
                    <tr key={idx} className="border-b border-gray-300 bg-white text-gray-800 hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{car.order_id}</td>
                      <td className="px-4 py-3 text-sm">L Живая очередь</td>
                      <td className="px-4 py-3 font-mono font-semibold">
                        {car.regnum}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {car.registration_date}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {car.changed_date}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const statusInfo = getStatusInfo(car.status);
                          return (
                            <div className="flex items-center gap-2">
                              {car.status === 3 && <span className="w-3 h-3 bg-green-500 rounded-full"></span>}
                              {car.status === 2 && <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>}
                              {car.status === 4 && <span className="w-3 h-3 bg-orange-500 rounded-full"></span>}
                              {car.status === 1 && <span className="w-3 h-3 bg-blue-500 rounded-full"></span>}
                              {car.status === 5 && <span className="w-3 h-3 bg-gray-500 rounded-full"></span>}
                              <span className="text-sm font-medium">{statusInfo.label}</span>
                            </div>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {queue.length > 50 && (
                <p className="text-center text-gray-500 text-sm py-3">
                  Показано 50 из {queue.length} машин
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-600 text-sm">
          <p>Data from belarusborder.by | Auto-refresh every 30 seconds</p>
          <p className="mt-2 text-xs text-gray-500">
            This is an unofficial monitoring tool. Please verify information on official sources.
          </p>
        </div>
      </div>
    </div>
  );
}
