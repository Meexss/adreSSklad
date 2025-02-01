import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from './Layout';
import axios from 'axios';

const AddProductDetails = () => {
    const location = useLocation();
    const { addproducts } = location.state;
    const [dataProducts, setDataProducts] = useState(null);
    const [placeProducts, setPlaceProducts] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!addproducts?.add_number) return;

        const fetchAddData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/addproducts/?add_number=${addproducts.add_number}`);
                setDataProducts(response.data.length ? response.data[0] : null);
            } catch (error) {
                console.error("Ошибка запроса:", error);
                setErrorMessage(`Ошибка: ${error.response?.data?.error || error.message}`);
            }
        };

        const fetchPlacedData = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/api/placeship/?add_number=${addproducts.add_number}`);
                setPlaceProducts(response.data);
            } catch (error) {
                console.error("Ошибка запроса:", error);
                setErrorMessage(`Ошибка: ${error.response?.data?.error || error.message}`);
            }   
        }

        fetchAddData();
        fetchPlacedData();
    }, [addproducts]);

    return (
        <Layout>
            <div style={{ padding: '20px' }}>
                <h1>Детали прихода</h1>
                <p><strong>Номер прихода:</strong> {addproducts.add_number}</p>
                <p><strong>Дата:</strong> {addproducts.add_date}</p>
                <p><strong>Контрагент:</strong> {addproducts.counterparty}</p>
                <p><strong>Склад:</strong> {addproducts.warehouse}</p>
                <p><strong>Статус:</strong> {addproducts.progress}</p>

                {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Артикул</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Наименование</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Количество по 1С</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Фактически принято</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Места товара</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Зона</th>
                        </tr>
                    </thead>
                    <tbody>
                        {addproducts.positionData?.map((stock, index) => (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.article}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.quantity}</td>

                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {dataProducts?.positionData?.find(item => item.article === stock.article)?.final_quantity || '—'}
                                </td>

                                {/* Собираем все места для артикула */}
                                    {placeProducts
                                        ?.filter(item => item.article === stock.article)
                                        .map((item, index) => (
                                            <tr key={index}>  {/* Создаём новую строку для каждого item */}
                                                <td style={{ border: '1px solid #ddd', padding: '8px' }}> место {item.place} кол-во {item.quantity}</td>
                                                <td style={{ border: '1px solid #ddd', padding: '8px' }}></td> {/* Можно добавить количество или другие данные */}
                                            </tr>
                                        )) || '—'}
                                

                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.zone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AddProductDetails;
