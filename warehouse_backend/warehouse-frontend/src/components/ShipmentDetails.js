import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import Layout from './Layout';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const ShipmentDetails = () => {
    const location = useLocation();
    const { shipment: initialShipment } = location.state || {};

    const [shipment, setShipment] = useState(initialShipment);
    const [message, setMessage] = useState("");
    const [reservedData, setReservedData] = useState([]);
    const [showReservedData, setShowReservedData] = useState(false);
    const [summarizedData, setSummarizedData] = useState([]);

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
    console.log(reservedData)

    const handleCloseModal = () => {
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

    useEffect(() => {
        if (reservedData.length > 0) {
            const groupedData = reservedData.reduce((acc, item) => {
                if (acc[item.article]) {
                    acc[item.article] += item.quantity;
                } else {
                    acc[item.article] = item.quantity;
                }
                return acc;
            }, {});
    
            // Преобразуем объект в массив
            const result = Object.entries(groupedData).map(([article, quantity]) => ({
                article,
                quantity,
            }));
    
            setSummarizedData(result);
        }
    }, [reservedData]);


    if (!shipment) {
        return <Layout><h2>Данные об отгрузке отсутствуют</h2></Layout>;
    }


    return (
        <Layout>
            <div style={{ padding: '20px' }}>
            <Link to="/operations" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                <FontAwesomeIcon
                    icon={faArrowLeft}
                    style={{
                        cursor: 'pointer',
                        fontSize: '15px',
                        padding: '10px',
                        borderRadius: '50%',
                    }}
                />
                <span style={{ fontSize: '12px' }}>Назад</span>
            </Link>
                <h1>Детали отгрузки</h1>
                {!showReservedData && (
                    <button
                        onClick={handleReserveAll}
                        style={{
                            backgroundColor: 'green',
                        }}
                    >
                        Зарезервировать все товары
                    </button>
                )}
                {showReservedData && (
                    <Link to="/operations"><button
                        style={{
                            backgroundColor: 'grey',
                        }}
                    >
                        Завершить отгрузку
                    </button></Link>
                )}
                {showReservedData && (
                    <Link to="/operations"><button
                        onClick={handleMassCancelReservation}
                        style={{
                            backgroundColor: 'red',
                        }}
                    >
                        Отменить резервирование
                    </button></Link>
                )}
                <div class="data_wraper">
                    <div class="data_info"><p><strong>Номер отгрузки:</strong> {shipment.shipment_number}</p></div>
                    <div class="data_info"><p><strong>Дата отгрузки:</strong> {shipment.shipment_date}</p></div>
                    <div class="data_info"><p><strong>Контрагент:</strong> {shipment.counterparty}</p></div>
                    <div class="data_info"><p><strong>Склад:</strong> {shipment.warehouse}</p></div>
                    <div class="data_info"><p><strong>Статус:</strong> {shipment.progress}</p></div>
                </div>


                {message && <p style={{ marginTop: '10px', color: message.includes("Ошибка") ? 'red' : 'green' }}>{message}</p>}
                <h3>{showReservedData ? "Зарезервированные товары:" : "Товары для отгрузки:"}</h3>
                <table >
                    <thead>
                        <tr >
                            <th >Артикул</th>
                            <th >Наименование</th>
                            <th >Количество общее</th>
                            {showReservedData && (
                                <>
                                    <th >Сумма резерва</th>
                                    <th >Место Хранение</th>
                                    <th >Кол-во к отбору</th>
                                    <th >Статус</th>
                                    <th ></th>
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
                                                <td rowSpan={reservedItems.length} >{stock.article}</td>
                                                <td rowSpan={reservedItems.length} style={{ textAlign: 'left'}}>{stock.name}</td>
                                                <td rowSpan={reservedItems.length} >{stock.quantity}</td>
                                                <td rowSpan={reservedItems.length} >
                                                    {summarizedData.find(item => item.article === reservedItem.article)?.quantity ?? 0}
                                                </td>
                                            </>
                                        )}
                                        <td >{reservedItem.place}</td>
                                        <td >{reservedItem.quantity}</td>
                                        <td >{reservedItem.goods_status}</td>
                                        <FontAwesomeIcon
                                            icon={faEdit}
                                            onClick={() => handleOpenModal(reservedItem)}
                                            style={{
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                                padding: '5px',
                                                borderRadius: '50%',
                                                backgroundColor: '#fff',
                                            }}
                                        />
                                    </tr>
                                ))
                            ) : (
                                // Если зарезервированных данных нет, создаем одну строку
                                <tr key={index}>
                                    <td >{stock.article}</td>
                                    <td >{stock.name}</td>
                                    <td >{stock.quantity}</td>
                                    <td >—</td>
                                    <td >—</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {showModal && selectedItem && (
                    <div style={{
                        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '2'
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
