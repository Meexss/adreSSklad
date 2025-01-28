import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

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
                <h1>Операции</h1>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
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
                                key={shipment.id}
                                style={{
                                    border: '1px solid #ddd',
                                    backgroundColor: '#fff',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{shipment.shipment_number}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{shipment.shipment_date}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{shipment.counterparty}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{shipment.warehouse}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default Operations;