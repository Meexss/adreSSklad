import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import { Link } from 'react-router-dom';


const AddProductList = () => {
    const [addproducts, setAddproducts] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/addproducts/')
            .then(response => setAddproducts(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <Layout>
            <div>
                <h1>Список приходов с 1С (перемещение/ приход товара)</h1>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}></th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Тип операции</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Номер прихода 1С</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Дата</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Поставшик</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Склад</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Кол-во позиций</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Кол-во едениц товара</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {addproducts.map(addproducts => (
                            <tr
                                key={addproducts.add_number}
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
                                    {/* <Link
                                        to={`/shipment/${shipment.id}`}
                                        state={{ shipment }}
                                        style={{ textDecoration: 'none', color: '#000' }}
                                    >
                                        Подробнее
                                    </Link> */}
                                    </td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>Добавить в API</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{addproducts.add_number}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{addproducts.add_date}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{addproducts.counterparty}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{addproducts.warehouse}</td>
                                    {/* Кол-во позиций: длина массива stocks */}
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{addproducts.stocks.length}</td>
                                {/* Кол-во единиц товара: сумма quantity из stocks */}
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {addproducts.stocks.reduce((total, stock) => total + stock.quantity, 0)}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{addproducts.progress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AddProductList;