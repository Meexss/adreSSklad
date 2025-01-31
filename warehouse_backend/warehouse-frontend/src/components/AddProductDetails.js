import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
// import ReactToPrint from 'react-to-print';
import Layout from './Layout';

const AddProductDetails = () => {
    const location = useLocation();
    const { addproducts } = location.state || {};

    if (!addproducts) {
        return <h2>Данные об отгрузке отсутствуют</h2>;
    }

    return (
        <Layout>
            <div style={{ padding: '20px' }} >
                <h1>Детали прихода</h1>
                <p><strong>Номер прихода:</strong> {addproducts.add_number}</p>
                <p><strong>Дата:</strong> {addproducts.add_date}</p>
                <p><strong>Контрагент:</strong> {addproducts.counterparty}</p>
                <p><strong>Склад:</strong> {addproducts.warehouse}</p>
                <p><strong>Статус:</strong> {addproducts.progress}</p>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Артикул</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Наименование</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Количество</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Место товара</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Зона</th>
                        </tr>
                    </thead>
                    <tbody>
                        {addproducts.stocks.map((stock, index) => (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.article}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

            </div>
        </Layout>
    );
};

export default AddProductDetails;
