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
                setShipments(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Ошибка запроса:", error);
                setErrorMessage(`Ошибка: ${error.response?.data?.error || error.message}`);
                setLoading(false);
            });
    }, [api]);

    return (
        <Layout>
            <div>
                <h2>Расходные операции</h2>

                {loading ? (
                    <p>Загрузка...</p>
                ) : errorMessage ? (
                    <p style={{ color: 'red' }}>{errorMessage}</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Тип операции</th>
                                <th>Номер отгрузки</th>
                                <th>Дата</th>
                                <th>Контрагент</th>
                                <th>Склад</th>
                                <th>Кол-во позиций</th>
                                <th>Кол-во единиц товара</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shipments.map(shipment => (
                                <tr
                                    key={shipment.shipment_number}
                                    onClick={() => navigate(`/shipment/${shipment.shipment_number}`, { state: { shipment } })}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>Добавить в API</td>
                                    <td>{shipment.shipment_number}</td>
                                    <td>{shipment.shipment_date}</td>
                                    <td>{shipment.counterparty}</td>
                                    <td>{shipment.warehouse}</td>
                                    <td>{shipment.stocks.length}</td>
                                    <td>{shipment.stocks.reduce((total, stock) => total + stock.quantity, 0)}</td>
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
