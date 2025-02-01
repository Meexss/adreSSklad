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
    const [cancelItem, setCancelItem] = useState(null);

    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState("Хранение");
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = (item) => {
        console.log(item)
        setSelectedItem(item);
        setSelectedQuantity(item.quantity);  // Можно установить начальное количество товара
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };
    
    const handleSubmit = () => {
        // Здесь можно отправить данные на сервер или обновить состояние
        console.log("Данные для отправки:", selectedItem, selectedQuantity, selectedStatus);
        setShowModal(false);
    };

    // Опции для статуса
    const statusOptions = ["Хранение", "Брак", "Недостача"];

    const storageKey = `reservedData_${shipment?.shipment_number}`;

    const api = useMemo(() => axios.create({
        baseURL: 'http://127.0.0.1:8000',
    }), []);

    const updateShipmentStatus = (newStatus) => {
        setShipment(prev => ({ ...prev, progress: newStatus }));
    };
    
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
            console.log(reserveResponse);

            if (reserveResponse.status === 200) {
                setMessage("Резервирование успешно завершено.");
                
                const shipmentNumber = shipment.shipment_number;
                const getResponse = await api.get(`/api/reserve/?shipment_number=${shipmentNumber}`);

                await api.post('/api/shipments/', {
                    shipment_number: shipment.shipment_number,
                    progress: "В работе"
                });
                
                updateShipmentStatus("В работе");

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


    const handleSubmitPartialCancel = async () => {
        try {
            console.log("Данные для отправки:", selectedItem, selectedQuantity, selectedStatus);
            setShowModal(false);

            const cancelRequest = {
                reserve_ids: [selectedItem.unique_id],
                goods_status: selectedStatus,
                cancel_quantities: {
                    [selectedItem.unique_id]: selectedQuantity,
                },
            };
            console.log(cancelRequest)
            const   cancelResponse = await api.post('/api/reserve/cancel/', cancelRequest);

            if (cancelResponse.status === 200) {
                setMessage("Частичная отмена выполнена успешно.");
                await api.get(`/api/reserve/?shipment_number=${shipment.shipment_number}`);
            }
        } catch (error) {
            setMessage(`Ошибка отмены: ${error.response?.data?.error || "Неизвестная ошибка"}`);
            console.error("Ошибка отмены:", error);
        }
    };

    const handleMassCancelReservation = useCallback(async () => {
        console.log("Начало массовой отмены резервирования");
        try {
            if (!reservedData.length) return;

            setMessage(""); // Сбрасываем сообщения

            const cancelResponse = await api.post('/api/reserve/cancel/', {
                reserve_ids: reservedData.map(item => item.unique_id),
            });

            if (cancelResponse.status === 200) {
                setReservedData([]);
                setShowReservedData(false);
                localStorage.removeItem(storageKey);
                setMessage("Массовое резервирование успешно отменено");

                await api.post('/api/shipments/', {
                    shipment_number: shipment.shipment_number,
                    progress: "Черновик"
                });

                updateShipmentStatus("Черновик");
            }
        } catch (error) {
            setMessage(`Ошибка массовой отмены: ${error.response?.data?.error || "Неизвестная ошибка"}`);
            console.error("Ошибка массовой отмены:", error);
        }
    }, [api, reservedData, storageKey, shipment?.shipment_number]);

    useEffect(() => {
        if (!shipment) return;

        const fetchReservationData = async () => {
            try {
                const shipmentNumber = shipment.shipment_number;
                const response = await api.get(`/api/reserve/?shipment_number=${shipmentNumber}`);

                if (response.status === 200 && response.data.length > 0) {
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
                        onClick={handleMassCancelReservation}
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
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Количество общее</th>
                            {showReservedData && (
                                <>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Место</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Кол-во к отбору</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Сумма отбора</th>
                                    <th style={{ border: '1px solid #ddd', padding: '8px' }}>Статус</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {shipment.stocks.map((stock, index) => {
                            // Фильтруем все записи из reservedData, соответствующие данному артикулу
                            const reservedItems = reservedData.filter(item => item.article === stock.article);

                            return reservedItems.length > 0 ? (
                                // Если есть зарезервированные данные, создаем строку для каждого элемента из reservedItems
                                reservedItems.map((reservedItem, subIndex) => (
                                    <tr key={subIndex}>
                                        {/* Первые 3 колонки из shipment.stocks (только для первой строки с этим артикулом) */}
                                        {subIndex === 0 && (
                                            <>
                                                <td rowSpan={reservedItems.length} style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.article}</td>
                                                <td rowSpan={reservedItems.length} style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.name}</td>
                                                <td rowSpan={reservedItems.length} style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.quantity}</td>
                                            </>
                                        )}
                                        {/* Оставшиеся данные из reservedData */}
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reservedItem.place}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reservedItem.quantity}</td>
                                        <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reservedItem.goods_status}</td>
                                        <button
                                            onClick={() => handleOpenModal(reservedItem)}
                                            style={{
                                                backgroundColor: 'orange',
                                                color: 'white',
                                                padding: '10px 20px',
                                                border: 'none',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Изменить статус
                                        </button>
                                    </tr>
                                ))
                            ) : (
                                // Если зарезервированных данных нет, создаем одну строку
                                <tr key={index}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.article}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.name}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.quantity}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>—</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>—</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {showModal && selectedItem && (
                    <div style={{
                        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}>
                        <div style={{
                            backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px',
                            display: 'flex', flexDirection: 'column', gap: '15px'
                        }}>
                            <h3>Изменить статус товара</h3>
                            <p><strong>Артикул:</strong> {selectedItem.article}</p>
                            <p><strong>Наименование:</strong> {selectedItem.name}</p>

                            <label>Количество:</label>
                            <input
                                type="number"
                                value={selectedQuantity}
                                onChange={(e) => {
                                    const value = Number(e.target.value);
                                    if (value <= selectedItem.quantity && value >= 1) {
                                        setSelectedQuantity(value);  // Обновляем состояние, если значение корректное
                                    }
                                }}
                                min="1"
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            />

                            <label>Статус:</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                            >
                                {statusOptions.map((status) => (
                                    <option key={status} value={status}>
                                        {status}
                                    </option>
                                ))}
                            </select>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button
                                    onClick={handleCloseModal}
                                    style={{
                                        backgroundColor: 'gray', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Закрыть
                                </button>
                                <button
                                    onClick={handleSubmitPartialCancel}
                                    style={{
                                        backgroundColor: 'orange', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '5px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Сохранить изменения
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ShipmentDetails;
