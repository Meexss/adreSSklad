import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../Layout';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faArrowLeft, faPrint, faRotate } from '@fortawesome/free-solid-svg-icons';
// import Barcode from "react-barcode";
import { useReactToPrint } from 'react-to-print';

import api from '../api'; // Импортируешь созданный файл


const ShipmentDetails = () => {
    const location = useLocation();
    const { shipment: initialShipment } = location.state || {};

    const [shipment, setShipment] = useState(initialShipment);
    const [message, setMessage] = useState("");
    const [reservedData, setReservedData] = useState([]);
    const [showReservedData, setShowReservedData] = useState(false);
    const [summarizedData, setSummarizedData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(0);
    const [selectedStatus, setSelectedStatus] = useState("Хранение");
    const [showModal, setShowModal] = useState(false);
    const [noReserv, setNoReserv] = useState([])


    //отмена товаров со статусом сборка 
    const moveGoods = async() => {
        const dataMove = reservedData
        .filter(item => item.goods_status === "Собран") // Убираем лишний пробел
        try{
            const request = {
                moveNumber: shipment.ship_number,
                stock: dataMove.map((item) => ({
                    unique_id: item.unique_id,
                    add_date: item.add_date,
                    article: item.article,
                    name: item.name,
                    barcode: item.barcode,
                    place: item.place,
                    quantity: item.quantity,
                    goods_status: item.goods_status,
                })),
            }
            
            console.log(request)

            const resp = await api.post('/api/moveData/', request)

            if(resp.status === 200) {
                reservDataApi('Черновик')
            }

        } catch (error) {
            console.log(error)
        }
    }

    // функция запроса данных о резервах
    const reservDataApi = async(newStatus) => {
        try {
            const uid_ship = shipment.unique_id_ship; // Используем корректное поле
            const getResponse = await api.get(`/api/reserve/?uid_ship=${uid_ship}`);

            if (getResponse.status === 200) {
                console.log(getResponse);
                setReservedData(getResponse.data);
                setShowReservedData(true);
                localStorage.setItem(storageKey, JSON.stringify(getResponse.data));
                await api.post('/api/shipments/', {
                    uid_ship,
                    progress: newStatus
                });
                updateShipmentStatus(newStatus);
            
            }

           

            

    } catch (error) {
        console.log(error)
    }

    }

    //меняем место и статус на Сборка и Собран
    const ChangeStatus = async () => {
        const dataSend = reservedData
            .filter(item => item.goods_status === "В отгрузке") // Убираем лишний пробел
            .map(item => item.unique_id); // Извлекаем только unique_id
            console.log("собранные данные", dataSend);
        try {
            const request = {
                ship_id: reservedData.find(item => item.unique_id_ship)?.unique_id_ship,
                stock: dataSend
            }
            console.log(request)
            const resp = await api.post('/api/changePlaceAndStatus/', request)
            if (resp.status === 200) {

                reservDataApi("Собран")
            }
        }catch (error) {
            setError(error)
        }    
       
    };

    // перерезервирование резерва
    const handleChangeReserve = async (item) => {

        setLoading(true);
            setError(null);
        const totalReservedQuantity = reservedData
            .filter((res) => res.article === item && res.place !== "НЕУДАЛОСЬ ЗАРЕЗЕРВИРОВАТЬ")
            .reduce((sum, res) => sum + res.quantity, 0);

            console.log(`Суммарное зарезервированное количество: ${totalReservedQuantity}`);    
            const finalQuantity = shipment.items
            .filter((res) => res.article === item)
            .reduce((sum, res) => sum + res.quantity, 0);

            console.log(`Стоковое количество: ${finalQuantity}`); 

        const sentQuanity = finalQuantity - totalReservedQuantity 

        if (sentQuanity > 0) {
            setLoading(false)
            setMessage('не нужно резервировать')

            try {

                const reserveRequest = {
                    uid_ship: shipment.unique_id_ship, // Убедитесь, что поле соответствует API
                    type: shipment.type,
                    ship_number: shipment.ship_number,
                    ship_date: shipment.ship_date,
                    counterparty: shipment.counterparty,
                    warehouse: shipment.warehouse,
                    progress: shipment.progress,
                    stocks: [{
                        article: item,
                        quantity: sentQuanity,
                    }],
                };
    
                console.log("общее резервирование", reserveRequest)
        
                const reserveResponse = await api.post('/api/reserve/', reserveRequest);
                if (reserveResponse.status === 200) {
                    console.log(reserveResponse);
                    setMessage("Резервирование успешно завершено.");
        
                    reservDataApi("В работе")
                }
            } catch (error) {
                setError(error.response?.data?.error || "Ошибка при резервировании");
                console.error("Ошибка:", error);
                setLoading(false)
                
            }
        } else {
            setLoading(false)
            setMessage('не требует резевирования')
        }
        console.log("Количество на отправку", sentQuanity)

        

        }

    // частичная отмена работает но подумать над ошибкой 500
    const handleSubmitPartialCancel = async () => {
        handleCloseModal()
        try {
            await api.post("/api/changeReserveStatus/", {
                reserve_id: selectedItem.unique_id,
                new_status: selectedStatus,
                quantity_to_cancel: selectedQuantity,
            });

            console.log(selectedItem.unique_id, selectedStatus, selectedQuantity)

            reservDataApi("В работе")
    
            
        } catch (error) {
            console.error("Ошибка при изменении резервации:", error);
        }

       
    };

    
    // модалка
    const handleOpenModal = (item) => {
        console.log(item)
        setSelectedItem(item);
        setSelectedQuantity(item.quantity);
        setShowModal(true);
    };
    // модалка
    const handleCloseModal = () => {
        setShowModal(false);
    };

    const statusOptions = ["Хранение", "Брак", "Недостача"];
    const storageKey = `reservedData_${shipment?.uid_ship}`;

    const updateShipmentStatus = (newStatus) => {
        setShipment(prev => ({ ...prev, progress: newStatus }));
    };


    // Резервировать все
    const handleReserveAll = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setMessage("");
    
            const reserveRequest = {
                uid_ship: shipment.unique_id_ship, // Убедитесь, что поле соответствует API
                type: shipment.type,
                ship_number: shipment.ship_number,
                ship_date: shipment.ship_date,
                counterparty: shipment.counterparty,
                warehouse: shipment.warehouse,
                progress: shipment.progress,
                stocks: shipment.items.map((stock) => ({
                    article: stock.article,
                    quantity: stock.quantity,
                })),
            };

            console.log("общее резервирование", reserveRequest)
    
            const reserveResponse = await api.post('/api/reserve/', reserveRequest);
            console.log(reserveResponse)
            if (reserveResponse.status === 200) {
                console.log("Резервирование успешно завершено.");
                setMessage("Резервирование успешно завершено.");
    
                reservDataApi("В работе")

            }
        } catch (error) {
            setError(error.response?.data?.error || "Ошибка при резервировании");
            console.error("Ошибка:", error);
        } finally {
            setLoading(false);
        }
    }, [api, shipment, storageKey, updateShipmentStatus]);

    //Закрыть отгрузку
    const handleCloseShip = async () => {
        try {
            const request = reservedData.map((item) => ({
                unique_id_ship: shipment.unique_id_ship, 
                type: shipment.type,
                ship_number: shipment.ship_number,
                ship_date: shipment.ship_date,
                counterparty: shipment.counterparty,    
                warehouse: shipment.warehouse,
                progress: 'Завершен',

                article: item.article,
                name: item.name,
                barcode: item.barcode,
                quantity: item.quantity,
                reserve_data: item.reserve_data,
                unique_id: item.unique_id,
                add_date: item.add_date,
                place: item.place,
                goods_status: 'Отгружен',
                
            }));

            console.log("массив к отправке", request)
            // Отправка данных через API
            const reserveResponse = await api.post('/api/archiveShip/', request);
    
            // Обработка успешного ответа
            if (reserveResponse.status === 200) {
                console.log('Ships archived successfully', reserveResponse.data);
            } else {
                console.log('Error archiving ships', reserveResponse);
            }
        } catch (error) {
            // Обработка ошибки запроса
            console.error('Error in API request:', error);
        }
    };

    // Массовая отмена резервирования
    const handleMassCancelReservation = useCallback(async () => {
        try {
            if (!reservedData.length) return;

            setLoading(true);
            setError(null);
            setMessage("");

            const cancelResponse = await api.post('/api/reserve/cancel/', {
                reserve_ids: reservedData.map(item => item.unique_id),
                goods_status: "Хранение",
            });

            console.log(reservedData.map(item => item.unique_id))

            if (cancelResponse.status === 200) {
                setReservedData([]);
                setShowReservedData(false);
                localStorage.removeItem(storageKey);
                setMessage("Массовое резервирование успешно отменено");

                reservDataApi("Черновик")
            }
        } catch (error) {
            setError(error.response?.data?.error || "Ошибка при массовой отмене");
            console.error("Ошибка массовой отмены:", error);
        } finally {
            setLoading(false);
        }
    }, [api, reservedData, storageKey, shipment?.uid_ship]);


    // получение данных о резерве
    useEffect(() => {
        const fetchReservationData = async () => {
            try {
                if (!shipment) return;
                
                // setLoading(true);
                setError(null);
                
                reservDataApi(shipment.progress)
            } catch (error) {
                if (error.response?.status !== 404) {
                    // setError(error.response?.data?.error || "Ошибка загрузки данных");
                    console.log(error)
                }
            } finally {
                // setLoading(false);
            }

            console.log(reservedData)
        };

        fetchReservationData();
        const interval = setInterval(fetchReservationData, 60000);

        // Очистка интервала при размонтировании компонента
        return () => clearInterval(interval);     


    }, [shipment?.progress]);

    const handleNewData = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/api/newData/?ship_number=${shipment.ship_number}`)
        } catch (error) {
            setError(error)
        } finally {
            setLoading(false)
        }

    }


    
    // Печать
     const contentRef = useRef(null);
    // Печать
        const handlePrint = useReactToPrint({
            // documentTitle: 'Title',
            contentRef: contentRef,
         })
    

    if (!shipment) {
        return <Layout><h2>Данные об отгрузке отсутствуют</h2></Layout>;
    }

    if (loading) return <Layout><div className='loaderWrap'><span className="loader"></span></div></Layout>;
    if (error) return <Layout><div className='loaderWrap'><p style={{ color: 'red' }}>{error}</p></div></Layout>;

    return (
        <Layout>
            <div ref={contentRef} style={{ padding: '20px' }}>

                {/* кнопка назад */}
                <Link className="no-print" to="/operations" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
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
                
               
                <h2>Детали отгрузки</h2>
                {/* <Barcode className="print-only" value={shipment.uid_ship} format="CODE128"/> */}
                {!showReservedData && (
                    <div className='btn-ship-wrap'>
                        <button 
                            className='no-print btn-ship'
                            onClick={handleReserveAll}
                            style={{
                                backgroundColor: 'green',
                            }}
                        >
                            Зарезервировать всё
                        </button>
                        <button 
                            className='no-print btn-ship '
                            onClick={handleNewData}
                            style={{
                                backgroundColor: 'blue',
                            }}
                        >
                            Обновить данные
                        </button>

                        
                    </div>             
                )}

                
                {showReservedData && (
                    <div className='btn-ship-wrap'>

                {reservedData.some(item => item.goods_status !== "Собран") && 
                        <button
                        onClick={handleMassCancelReservation}
                        className='no-print btn-ship '
                        style={{
                            backgroundColor: 'red',
                        }}
                    >
                        Отменить резервирование
                    </button>
                
                }
                {reservedData.some(item => item.goods_status === "Собран") && 
                        <button
                        onClick={moveGoods}
                        className='no-print btn-ship '
                        style={{
                            backgroundColor: 'red',
                            
                        }}
                    >
                        Отменить Сборку
                    </button>
                
                }
                        
                        {reservedData.some(item => item.goods_status === "В отгрузке") &&
                        <button
                            onClick={ChangeStatus}
                            className='no-print btn-ship '
                            style={{
                                backgroundColor: 'black',
                            }}
                        >
                            Собрать товары
                        </button>}

                        {reservedData.some(item => item.goods_status !== "В отгрузке") &&
                                                <Link to="/operations"><button
                                                onClick={handleCloseShip}
                                                className='no-print btn-ship '
                                                style={{
                                                    backgroundColor: 'grey',
                                                }}
                                            >
                                                Завершить отгрузку
                                            </button></Link>
                        
                        }

                        <button className='no-print btn-ship' onClick={handlePrint} style={{ cursor: 'pointer', padding: '5px 10px', fontSize: '14px' }}>
                <FontAwesomeIcon icon={faPrint} /> Печать
                </button>
                    </div>
                    
                )}
                <div className="data_wraper">
                    <div className="data_info"><p><strong>Тип:</strong> {shipment.type}</p></div>
                    <div className="data_info"><p><strong>Номер отгрузки:</strong> {shipment.ship_number}</p></div>
                    <div className="data_info"><p><strong>Дата отгрузки:</strong> {shipment.ship_date}</p></div>
                    <div className="data_info"><p><strong>Контрагент:</strong> {shipment.counterparty}</p></div>
                    <div className="data_info"><p><strong>Склад:</strong> {shipment.warehouse}</p></div>
                    <div className="data_info no-print"><p><strong>Статус:</strong> {shipment.progress}</p></div>
                </div>


                {message && <p style={{ marginTop: '10px', color: message.includes("Ошибка") ? 'red' : 'green' }}>{message}</p>}
                <h3>{showReservedData ? "Зарезервированные товары:" : "Товары для отгрузки:"}</h3>
                <div className="table-container">
                <table >
                    <thead>
                    <tr>
                    <th>Артикул</th>
                    <th>Наименование</th>
                    <th className='no-print'>Количество общее</th>
                    {(showReservedData || shipment.items.some(stock => noReserv.filter(item => item.article === stock.article).length > 0)) && (
                        <>
                        <th>Место Хранение</th>
                        <th>Кол-во к отбору</th>
                        <th className="no-print">Статус</th>
                        <th> </th>
                        <th> </th>
                        </>
                    )}
                    </tr>
                </thead>
                <tbody>
                {shipment.items.map((stock, index) => {
                            // Фильтруем все записи из reservedData, соответствующие данному артикулу
                            const reservedItems = reservedData.filter(item => item.article === stock.article);
                           
                            const totalReservedQuantity = reservedItems.reduce((sum, res) => sum + res.quantity, 0);
            
                            
                            const sentQuanity = stock.quantity - totalReservedQuantity       
                            return reservedItems.length > 0 ? (
                                // Если есть зарезервированные данные, создаем строку для каждого элемента из reservedItems
                                reservedItems.map((reservedItem, subIndex) => (
                                    <tr key={subIndex}>
                                        {/* Первые 3 колонки из shipment.stocks (только для первой строки с этим артикулом) */}
                                        {subIndex === 0 && (
                                            <>
                                                <td rowSpan={reservedItems.length} >{stock.article}</td>
                                                <td className='text-left' rowSpan={reservedItems.length} >{stock.name}</td>
                                                <td  className='no-print'
                                                style={{backgroundColor: sentQuanity === 0 ? "inherit": "red", borderRadius: "10px",}}
                                                rowSpan={reservedItems.length} >{stock.quantity}</td>
                                                
                            
                                            </>
                                        )}
                                        <td>
                                            <div 
                                                style={{
                                                color: reservedItem.place === "НЕУДАЛОСЬ ЗАРЕЗЕРВИРОВАТЬ" ? "white" : "inherit", borderRadius: "10px",
                                                backgroundColor: reservedItem.place === "НЕУДАЛОСЬ ЗАРЕЗЕРВИРОВАТЬ" ? "red" : "inherit",
                                                }}
                                            >
                                                {reservedItem.place}
                                            </div>
                                            </td>
                                        <td >{reservedItem.quantity}</td>
                                        <td className='no-print'>{reservedItem.goods_status}</td>
                                        <td><FontAwesomeIcon
                                            className='no-print'
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
                                        </td>
                                        {reservedItem.goods_status === "Собран" || sentQuanity !== 0  &&
                                        
                                        <td><FontAwesomeIcon 
                                            className='no-print'
                                            icon={faRotate} 
                                            style={{
                                            
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                                padding: '5px',
                                                borderRadius: '50%',
                                                backgroundColor: '#fff',
                                                color: 'green'
                                            }}
                                            onClick={() => handleChangeReserve(reservedItem.article)}

                                        />
                                        
                                        </td>
                                        }
                                    </tr>
                                    
                                ))
                            ) : (
                                // Если зарезервированных данных нет, создаем одну строку
                                <tr className='no-print' key={index}>
                                    <td >{stock.article}</td>
                                    <td className='text-left'>{stock.name}</td>
                                    <td style={{backgroundColor: sentQuanity === 0 ? "inherit": "red", borderRadius: "10px",}}>{stock.quantity}</td>
                                    <td >—</td>
                                    <td >—</td>
                                    <td ></td>
                                    <td ></td>
                                    <td><FontAwesomeIcon 
                                            className='no-print'
                                            icon={faRotate} 
                                            style={{
                                                cursor: 'pointer',
                                                fontSize: '18px',
                                                padding: '5px',
                                                borderRadius: '50%',
                                                backgroundColor: '#fff',
                                                color: 'green'
                                            }}
                                            onClick={() => handleChangeReserve(stock.article)}

                                        />
                                        </td>
                                </tr>
                            );
                        })}



                    </tbody>
                </table>
                </div>
                {showModal && selectedItem && (
                    <div style={{
                        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: '20'
                    }}>
                        <div style={{
                            backgroundColor: 'white', padding: '20px', borderRadius: '8px', width: '400px',
                            display: 'flex', flexDirection: 'column', gap: '15px'
                        }}>
                            <h3>Изменить статус товара</h3>
                            <p><strong>Артикул:</strong> {selectedItem.article}</p>
                            <p ><strong>Наименование:</strong> {selectedItem.name}</p>

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

export default ShipmentDetails