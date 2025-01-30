import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Layout from './Layout';

const ShipmentDetails = () => {
    const location = useLocation();
    const { shipment } = location.state || {};

    const [message, setMessage] = useState("");
    const [reservedData, setReservedData] = useState([]); // Состояние для данных резервирования
    const [showReservedData, setShowReservedData] = useState(false); // Флаг для отображения данных из reserv

    // Ключ для localStorage, уникальный для каждой отгрузки
    const storageKey = `reservedData_${shipment?.shipment_number}`;

    // Загрузка данных из localStorage при монтировании компонента
    useEffect(() => {
        if (shipment) {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                setReservedData(JSON.parse(savedData));
                setShowReservedData(true); // Показываем данные из reserv, если они есть
            }
        }
    }, [shipment, storageKey]);

    if (!shipment) {
        return <Layout><h2>Данные об отгрузке отсутствуют</h2></Layout>;
    }

    const api = axios.create({
        baseURL: 'http://127.0.0.1:8000', // Базовый URL Django-сервера
    });

    const handleReserveAll = async () => {
        try {
            const reserveRequest = {
                shipment_number: shipment.shipment_number,
                stocks: shipment.stocks.map((stock) => ({
                    article: stock.article,
                    quantity: stock.quantity,
                })),
            };

            // Отправляем запрос на резервирование
            const reserveResponse = await api.post('/api/reserve/', reserveRequest);

            if (reserveResponse.status === 200) {
                setMessage("Резервирование успешно завершено.");

                // После успешного резервирования делаем GET-запрос для получения данных
                const shipmentNumber = shipment.shipment_number;
                const getResponse = await api.get(`/api/reserve/?shipment_number=${shipmentNumber}`);

                if (getResponse.status === 200) {
                    // Обновляем состояние с новыми данными
                    setReservedData(getResponse.data);
                    setShowReservedData(true); // Переключаем флаг для отображения данных из reserv

                    // Сохраняем данные в localStorage с привязкой к shipment_number
                    localStorage.setItem(storageKey, JSON.stringify(getResponse.data));
                }
            }
        } catch (error) {
            setMessage(`Ошибка: ${error.response?.data?.error || "Неизвестная ошибка"}`);
        }
    };

    // Данные для отображения в таблице
    const tableData = showReservedData ? reservedData : shipment.stocks;

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1>Детали отгрузки</h1>
                <p><strong>Номер отгрузки:</strong> {shipment.shipment_number}</p>
                {!showReservedData && (
                <button
                    onClick={handleReserveAll}
                    style={{
                        marginTop: '20px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        padding: '10px 20px',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Зарезервировать все товары
                </button>
            )}
                

                {message && <p style={{ marginTop: '10px', color: 'green' }}>{message}</p>}

                <h3>{showReservedData ? "Зарезервированные товары:" : "Товары для отгрузки:"}</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Артикул</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Наименование</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Количество</th>
                            {showReservedData && (
                                <>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Место</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Статус</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {tableData.map((item, index) => (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.article}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.quantity}</td>
                                {showReservedData && (
                                    <>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.place}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.goods_status}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default ShipmentDetails;