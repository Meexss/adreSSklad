import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import { Link } from 'react-router-dom';


const Operations = () => {
    const [shipments, setShipments] = useState([]);


    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/shipments/')
            .then(response => setShipments(response.data))
            .catch(error => console.error(error));
    }, []);

    

    return (
        <Layout>
            <div>
                <h1>Расходные операции</h1>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}></th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Тип операции</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Номер отгрузки</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Дата</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Контрагент</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Склад</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Кол-во позиций</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Кол-во едениц товара</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Статус</th>
                           
                        </tr>
                    </thead>
                    <tbody>
                        {shipments.map(shipment => (
                            <tr
                                key={shipment.shipment_number}
                                style={{
                                    border: '1px solid #ddd',
                                    backgroundColor: '#fff',
                                    transition: 'background-color 0.2s ease',
                                    textAlign: 'center',
                                    
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <Link
                                        to={`/shipment/${shipment.id}`}
                                        state={{ shipment }}
                                        style={{ textDecoration: 'none', color: '#000' }}
                                    >
                                        Подробнее
                                    </Link>
                                    </td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>Добавить в API</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{shipment.shipment_number}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{shipment.shipment_date}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{shipment.counterparty}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{shipment.warehouse}</td>
                                    {/* Кол-во позиций: длина массива stocks */}
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{shipment.stocks.length}</td>
                                {/* Кол-во единиц товара: сумма quantity из stocks */}
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {shipment.stocks.reduce((total, stock) => total + stock.quantity, 0)}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{shipment.progress}</td>
        
                            </tr>
                            
                        )
                        )}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default Operations;