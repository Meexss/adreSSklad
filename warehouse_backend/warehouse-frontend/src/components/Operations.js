import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';

const Operations = () => {
    const [shipments, setShipments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const api = useMemo(() => axios.create({
        baseURL: 'http://127.0.0.1:8000',
    }), []);

    useEffect(() => {
        api.get('/api/shipments/')
            .then(response => {
                setShipments(groupShipmentsByUniqueId(response.data));  
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка запроса:", error);
                setErrorMessage(`Ошибка: ${error.response?.data?.error || error.message}`);
                setLoading(false);
            });
    }, [api]);

    const groupShipmentsByUniqueId = (data) => {
        return data.reduce((acc, shipment) => {
            const { unique_id_ship } = shipment;
            if (!acc[unique_id_ship]) {
                acc[unique_id_ship] = {
                    unique_id_ship,
                    type: shipment.type,
                    ship_number: shipment.ship_number,
                    ship_date: shipment.ship_date,
                    counterparty: shipment.counterparty,
                    warehouse: shipment.warehouse,
                    progress: shipment.progress,
                    items: [],
                };
            }
            acc[unique_id_ship].items.push(shipment);
            return acc;
        }, {});
    };

    return (
        <Layout>
            <div>
                <h2>Расходные операции</h2>

                {loading ? (
                    <div className='loaderWrap'>
                        <span className="loader"></span>
                    </div>
                ) : errorMessage ? (
                    <div className='loaderWrap'>
                        <p style={{ color: 'red' }}>{errorMessage}</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Тип операции</th>
                                <th>Номер отгрузки</th>
                                <th>Дата</th>
                                <th>Контрагент</th>
                                <th>Склад отгрузки</th>
                                <th>Кол-во позиций</th>
                                <th>Кол-во единиц товара</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(shipments).map(shipment => (
                                <tr
                                    key={shipment.unique_id_ship}
                                    onClick={() => navigate(`/shipment/${shipment.unique_id_ship}`, { state: { shipment } })}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>{shipment.type}</td>
                                    <td>{shipment.ship_number}</td>
                                    <td>{shipment.ship_date}</td>
                                    <td>{shipment.counterparty}</td>
                                    <td>{shipment.warehouse}</td>
                                    <td>{shipment.items.length}</td>
                                    <td>{shipment.items.reduce((total, item) => total + (item.quantity || 0), 0)}</td>
                                    <td>{shipment.progress}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
};

export default Operations;
