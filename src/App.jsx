import React, { useState, useEffect } from 'react';
import { RefreshCw, Phone, MapPin, AlertCircle } from 'lucide-react';

export default function BorderQueueMonitor() {
  const [selectedCheckpoint, setSelectedCheckpoint] = useState('53d94097-2b34-11ec-8467-ac1f6bf889c0');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const checkpoints = [
    { id: '53d94097-2b34-11ec-8467-ac1f6bf889c0', name: 'Бенякони' },
    { id: 'b60677d4-8a00-4f93-a781-e129e1692a03', name: 'Каменный Лог' },
    { id: '7e46a2d1-ab2f-11ec-bafb-ac1f6bf889c1', name: 'Берестовица' },
    { id: 'a9173a85-3fc0-424c-84f0-defa632481e4', name: 'Брест' },
    { id: '3b797d4d-706a-440f-a1a4-826c191e1e36', name: 'Брузги' },
    { id: 'ffe81c11-00d6-11e8-a967-b0dd44bde851', name: 'Григоровщина' }
  ];

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

        {/* Checkpoint Info */}
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
                  <p className="text-sm text-gray-500 mb-2">Последнее обновление:</p>
                  <p className="text-lg font-semibold text-indigo-600">
                    {lastUpdate?.toLocaleTimeString('ru-RU')}
                  </p>
                </div>
                <button
                  onClick={() => fetchQueueData(selectedCheckpoint)}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Очередь легковых авто
            </h2>
            <div className="bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-bold">
              {queue.length} машин
            </div>
          </div>

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
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b-2 border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Номер</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Статус</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Время регистрации</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.slice(0, 50).map((car, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 font-bold text-indigo-600">{car.order_id}</td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800">
                        {car.regnum}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {car.status === 2 ? 'В ожидании' : `Статус ${car.status}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {car.registration_date}
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
