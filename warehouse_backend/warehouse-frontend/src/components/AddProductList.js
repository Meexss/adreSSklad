import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';

const AddProductList = () => {
    const [addproducts, setAddproducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const api = useMemo(() => axios.create({
        baseURL: 'http://127.0.0.1:8000',
    }), []);

    useEffect(() => {
        api.get('/api/addproducts/')
            .then(response => {
                setAddproducts(response.data);
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
                <h2>Список приходов с 1С (перемещение/ приход товара)</h2>
                
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
                                <th></th>
                                <th>Номер прихода 1С</th>
                                <th>Дата</th>
                                <th>Поставщик</th>
                                <th>Склад</th>
                                <th>Кол-во позиций по 1С</th>
                                <th>Кол-во единиц товара по 1С</th>
                                <th>Кол-во принятого товара</th>
                                <th>Статус</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addproducts.map(addproduct => (
                                <tr
                                    key={addproduct.add_number}
                                    onClick={() => navigate(`/add-product/${addproduct.add_number}`, { state: { addproducts: addproduct } })}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>Добавить в API</td>
                                    <td>{addproduct.add_number}</td>
                                    <td>{addproduct.add_date}</td>
                                    <td>{addproduct.counterparty}</td>
                                    <td>{addproduct.warehouse}</td>
                                    <td>{addproduct.positionData.length}</td>
                                    <td>
                                        {addproduct.positionData.reduce((total, stock) => total + stock.quantity, 0)}
                                    </td>
                                    <td>
                                        {addproduct.positionData.reduce((total, stock) => total + stock.final_quantity, 0)}
                                    </td>
                                    <td>{addproduct.progress}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
};

export default AddProductList;
