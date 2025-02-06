import React, { useState, useEffect, useMemo, useRef} from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from './Layout';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
import { useReactToPrint } from 'react-to-print';
import Barcode from "react-barcode";

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
                    api.get(`/api/addproducts/?uid_add=${addproducts.uid_add}`),
                    api.get(`/api/placeship/?uid_add=${addproducts.uid_add}`)
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

    const contentRef = useRef(null);

    const handlePrint = useReactToPrint({
        // documentTitle: 'Title',
        contentRef: contentRef,
     })

     console.log(placeProducts)
 

    //плохо работает
     const handleCloseAdd = async () => {

        //СМОТРЕТЬ ПЕРЕД ИСПОЛЬЗОАНИЕМ
        try {
            const request = placeProducts.map((item) => ({
                type: item.type,
                uid_add: item.uid_add,
                add_number: item.add_number,
                progress: 'Завершен',
                unique_id: item.unique_id,
                article: item.article,
                name: item.name,
                quantity: item.quantity,
                place: item.place,
                goods_status: 'Хранение',
                barcode: item.barcode
            }));
    
            // Отправка данных через API
            const reserveResponse = await api.post('/api/archiveAdd/', request);
    
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

    return (
        <Layout >
            <div className='print-container' ref={contentRef} >
                <Link to="/add-product-list" className='no-print' style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
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

                <button className='no-print' onClick={handlePrint} style={{ cursor: 'pointer', padding: '5px 10px', fontSize: '14px' }}>
                        <FontAwesomeIcon icon={faPrint} /> Печать
                    </button>
                <h2>Детали прихода</h2>
                <Barcode className="print-only" value={addproducts.uid_add} format="CODE128"/>
                                    <Link to="/add-product-list"><button
                                        onClick={handleCloseAdd}
                                        className='no-print'
                                        style={{
                                            backgroundColor: 'grey',
                                        }}
                                    >
                                        Завершить отгрузку
                                    </button></Link>
                <div  className="data_wraper" >
                    
                    <div className="data_info"><p><strong>Номер прихода:</strong> {addproducts.add_number}</p></div>
                    <div className="data_info"><p><strong>Дата:</strong> {addproducts.add_date}</p></div>
                    <div className="data_info"><p><strong>Контрагент:</strong> {addproducts.counterparty}</p></div>
                    <div className="data_info"><p><strong>Склад:</strong> {addproducts.warehouse}</p></div>
                    <div className="no-print data_info"><p className="no-print"><strong>Статус:</strong> {addproducts.progress}</p></div>
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
                                <th>Штрихкод товара по 1С</th>
                                <th>Штрихкод товара при приемке</th>
                                <th>Количество по 1С</th>
                                <th>Фактически принято</th>
                                <th>Размещено товара</th>
                                <th>Места товара</th>
                                <th>Количество на месте</th>
                                {/* <th>Статус товара</th> */}
                                

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
                                <td >
                                    {stock.barcode}
                                </td>
                                <td style={{ color: stock.error_barcode === true ? 'red' : 'inherit' }}>
                                    {filteredProducts.length > 0 ? stock.error_barcode === true ? 
                                        stock.newbarcode : stock.barcode : '—'}
                                </td>
                                <td>{stock.quantity}</td>
                                <td>{finalQuantity}</td>
                                <td>{filteredProducts.reduce((acc, item) => acc + item.quantity, 0)}</td>
                                <td>
                                {filteredProducts.length > 0
                                    ? filteredProducts.map((p, i) => <div className='miniTable' key={i}>{p.place || '—'}</div>)
                                    : '—'}
                                </td>
                                <td>
                                {filteredProducts.length > 0
                                    ? filteredProducts.map((p, i) => <div className='miniTable'  key={i}>{p.quantity || '—'}</div>)
                                    : '—'}
                                </td>
                                {/* <td>
                                {filteredProducts.length > 0
                                    ? filteredProducts.map((p, i) => <div key={i}>{p.goods_status || '—'}</div>)
                                    : '—'}
                                </td> */}
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
