import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from './Layout';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const AddProductDetails = () => {
    const location = useLocation();
    const { addproducts } = location.state;
    const [dataProducts, setDataProducts] = useState(null);
    const [placeProducts, setPlaceProducts] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    const api = useMemo(() => axios.create({
        baseURL: 'http://127.0.0.1:8000',
    }), []);

    useEffect(() => {
        if (!addproducts?.add_number) return;

        const fetchData = async () => {
            try {
                const [addResponse, placeResponse] = await Promise.all([
                    api.get(`/api/addproducts/?add_number=${addproducts.add_number}`),
                    api.get(`/api/placeship/?add_number=${addproducts.add_number}`)
                ]);

                setDataProducts(addResponse.data.length ? addResponse.data[0] : null);
                setPlaceProducts(placeResponse.data);
                setLoading(false);
            } catch (error) {
                console.error("Ошибка запроса:", error);
                setErrorMessage(`Ошибка: ${error.response?.data?.error || error.message}`);
                setLoading(false);
            }
        };

        fetchData();
    }, [addproducts, api]);

    return (
        <Layout>
            <div>
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
                <h2>Детали прихода</h2>
                <div className="data_wraper">
                    <div className="data_info"><p><strong>Номер прихода:</strong> {addproducts.add_number}</p></div>
                    <div className="data_info"><p><strong>Дата:</strong> {addproducts.add_date}</p></div>
                    <div className="data_info"><p><strong>Контрагент:</strong> {addproducts.counterparty}</p></div>
                    <div className="data_info"><p><strong>Склад:</strong> {addproducts.warehouse}</p></div>
                    <div className="data_info"><p><strong>Статус:</strong> {addproducts.progress}</p></div>
                </div>

                {loading ? (
                        <div className='loaderWrap'>
                            <span className="loader"></span>
                        </div>
                ) : errorMessage ? (
                    <div className='loaderWrap'>
                    <   p style={{ color: 'red' }}>{errorMessage}</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Артикул</th>
                                <th>Наименование</th>
                                <th>Количество по 1С</th>
                                <th>Фактически принято</th>
                                <th>Размещено товара</th>
                                <th>Места товара</th>
                                <th>Количество на месте</th>
                                <th>Статус товара</th>
                            </tr>
                        </thead>
                        <tbody>
                        {addproducts?.positionData?.map((stock, index) => {
                            const finalQuantity =
                            dataProducts?.positionData?.find(item => item.article === stock.article)?.final_quantity || '—';

                            const filteredProducts = placeProducts?.filter(item => item.article === stock.article) || [];

                            return (
                            <tr key={index}>
                                <td>{stock.article}</td>
                                <td style={{ textAlign: 'left' }}>{stock.name}</td>
                                <td>{stock.quantity}</td>
                                <td>{finalQuantity}</td>
                                <td>{filteredProducts.reduce((acc, item) => acc + item.quantity, 0)}</td>
                                <td>
                                {filteredProducts.length > 0
                                    ? filteredProducts.map((p, i) => <div key={i}>{p.place || '—'}</div>)
                                    : '—'}
                                </td>
                                <td>
                                {filteredProducts.length > 0
                                    ? filteredProducts.map((p, i) => <div key={i}>{p.quantity || '—'}</div>)
                                    : '—'}
                                </td>
                                <td>
                                {filteredProducts.length > 0
                                    ? filteredProducts.map((p, i) => <div key={i}>{p.goods_status || '—'}</div>)
                                    : '—'}
                                </td>
                            </tr>
                            );
                        })}
                        </tbody>
                    </table>
                )}
            </div>
        </Layout>
    );
};

export default AddProductDetails;
