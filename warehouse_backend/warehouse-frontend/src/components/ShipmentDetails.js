import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Layout from './Layout';
import { Link } from 'react-router-dom';

const ShipmentDetails = () => {
    const location = useLocation();
    const { shipment: initialShipment } = location.state || {};

    const [shipment, setShipment] = useState(initialShipment);
    const [message, setMessage] = useState("");
    const [reservedData, setReservedData] = useState([]);
    const [showReservedData, setShowReservedData] = useState(false);

    const storageKey = `reservedData_${shipment?.shipment_number}`;

    const api = useMemo(() => axios.create({
        baseURL: 'http://127.0.0.1:8000',
    }), []);

    const updateShipmentStatus = (newStatus) => {
        setShipment(prev => ({
            ...prev,
            progress: newStatus
        }));
    };

    //функция резервирования
    const handleReserveAll = useCallback(async () => {
        console.log("Начало handleReserveAll");
        try {
            if (!shipment) return;

            setMessage(""); // Сбрасываем предыдущие сообщения

            const reserveRequest = {
                shipment_number: shipment.shipment_number,
                stocks: shipment.stocks.map((stock) => ({
                    article: stock.article,
                    quantity: stock.quantity,
                })),
            };
            console.log(reserveRequest);

            const reserveResponse = await api.post('/api/reserve/', reserveRequest);
            console.log(reserveResponse)

            if (reserveResponse.status === 200) {
                setMessage("Резервирование успешно завершено.");
                
                // Обновляем данные после резервирования
                const shipmentNumber = shipment.shipment_number;
                const getResponse = await api.get(`/api/reserve/?shipment_number=${shipmentNumber}`);

                await api.post('/api/shipments/', {
                    shipment_number: shipment.shipment_number,
                    progress: "В работе"
                });
                
                updateShipmentStatus("В работе"); // Локальное обновление
                
                if (getResponse.status === 200) {
                    setReservedData(getResponse.data);
                    setShowReservedData(true);
                    localStorage.setItem(storageKey, JSON.stringify(getResponse.data));
                }

                

            }
        } catch (error) {
            setMessage(`Ошибка: ${error.response?.data?.error || "Неизвестная ошибка"}`);
            console.error("Ошибка:", error);
        }
        console.log("Конец handleReserveAll");
    }, [api, shipment, storageKey]);

    //отмена резервирования
    const handleCancelReservation = useCallback(async () => {
        console.log("Начало отмены резервирования");
        try {
            if (!reservedData.length) return;
    
            setMessage(""); // Сбрасываем сообщения
            
            // Отправляем все unique_id на сервер
            const cancelResponse = await api.post('/api/reserve/cancel/', {
                reserve_ids: reservedData.map(item => item.unique_id)
            });
    
            if (cancelResponse.status === 200) {
                // Очищаем состояние и localStorage
                setReservedData([]);
                setShowReservedData(false);
                localStorage.removeItem(storageKey);
                setMessage("Резервирование успешно отменено");
    
                await api.post('/api/shipments/', {
                    shipment_number: shipment.shipment_number,
                    progress: "Черновик"
                });
    
                // Локальное обновление
                updateShipmentStatus("Черновик");
            }
        } catch (error) {
            setMessage(`Ошибка отмены: ${error.response?.data?.error || "Неизвестная ошибка"}`);
            console.error("Ошибка отмены:", error);
        }
    }, [api, reservedData, storageKey, shipment?.shipment_number]);


    useEffect(() => {
        if (!shipment) return;
    
        const fetchReservationData = async () => {
            try {
                const shipmentNumber = shipment.shipment_number;
                const response = await api.get(`/api/reserve/?shipment_number=${shipmentNumber}`);
    
                if (response.status === 200 && response.data.length > 0) {
                    // Проверяем, что данные действительно существуют
                    setReservedData(response.data);
                    setShowReservedData(true);
                    localStorage.setItem(storageKey, JSON.stringify(response.data));
                }
            } catch (error) {
                if (error.response?.status !== 404) {
                    setMessage(`Ошибка: ${error.response?.data?.error || error.message}`);
                }
            }
        };

    
        fetchReservationData();
    }, [shipment, storageKey, api]);

    if (!shipment) {
        return <Layout><h2>Данные об отгрузке отсутствуют</h2></Layout>;
    }

    // Определяем данные для таблицы
    const tableData = showReservedData ? reservedData : shipment.stocks;

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1>Детали отгрузки</h1>
                <p><strong>Номер отгрузки:</strong> {shipment.shipment_number}</p>
                <p><strong>Дата отгрузки:</strong> {shipment.shipment_date}</p>
                <p><strong>Контрагент:</strong> {shipment.counterparty}</p>
                <p><strong>Склад:</strong> {shipment.warehouse}</p>
                <p><strong>Статус:</strong> {shipment.progress}</p>
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
                {showReservedData && (
                    <Link to="/operations"><button
                        // onClick={handleReserveAll}
                        style={{
                            marginTop: '20px',
                            backgroundColor: 'yellow',
                            color: 'black',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Завершить отгрузку
                    </button></Link>
                )}
                {showReservedData && (
                    <Link to="/operations"><button
                        onClick={handleCancelReservation}
                        style={{
                            marginTop: '20px',
                            backgroundColor: 'blue',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                        }}
                    >
                        Отменить резервирование
                    </button></Link>
                )}
                


                {message && <p style={{ marginTop: '10px', color: message.includes("Ошибка") ? 'red' : 'green' }}>{message}</p>}

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
                        {tableData.map((item, index) => ( // Исправлено: используем tableData
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