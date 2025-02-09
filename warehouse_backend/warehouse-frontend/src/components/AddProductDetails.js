import React, { useState, useEffect, useRef} from 'react';
import { useLocation, Link } from 'react-router-dom';
import Layout from './Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons';
import { useReactToPrint } from 'react-to-print';
import Barcode from "react-barcode";
import api from './api'; // Импортируешь созданный файл

const AddProductDetails = () => {
    const location = useLocation();
    const { addproducts } = location.state;
    const [dataProducts, setDataProducts] = useState([]);
    const [placeProducts, setPlaceProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    // const api = useMemo(() => axios.create({
    //     baseURL: 'http://127.0.0.1:8000',
    // }), []);

    useEffect(() => {
        if (!addproducts?.unique_id_add) return;
    
        console.log("Fetching data for:", addproducts);
    
        const fetchData = async () => {
            try { 
                const [addResponse, placeResponse] = await Promise.all([
                    api.get(`/api/addproducts/?uid_add=${addproducts.add_number}`),
                    api.get(`/api/placeship/?uid_add=${addproducts.unique_id_add}`)
                ]);
    
                console.log("addResponse:", addResponse.data);
                console.log("placeResponse:", placeResponse.data);
    
                // Проверяем, есть ли данные перед записью
                if (addResponse.data && addResponse.data.length > 0) {
                    setDataProducts(addResponse.data); 
                }
    
                if (placeResponse.data && placeResponse.data.length > 0) {
                    setPlaceProducts(placeResponse.data);
                }
    
            } catch (error) {
                console.error("Ошибка запроса:", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchData();

          // Обновление данных каждые 60 секунд (60000 миллисекунд)
    const interval = setInterval(fetchData, 60000);

    // Очистка интервала при размонтировании компонента
    return () => clearInterval(interval);
    }, [addproducts, api]);

    // Печать
    const contentRef = useRef(null);
    
    // Печать
    const handlePrint = useReactToPrint({
        // documentTitle: 'Title',
        contentRef: contentRef,
     })
 

    //плохо работает
     const handleCloseAdd = async () => {
        console.log("Место товара", placeProducts)
        console.log("Товары к приемке", addproducts)
        //СМОТРЕТЬ ПЕРЕД ИСПОЛЬЗОАНИЕМ
        try {
            const request = placeProducts.map((item) => {
                const foundItem = addproducts.items.find(i => i.article === item.article); // Ищем по артикулу или другому ключу
            
                return {
                    unique_id_add: item.unique_id_add,
                    type: item.type,
                    add_number: item.add_number,
                    add_date: item.add_date,
                    counterparty: addproducts.counterparty,
                    warehouse: addproducts.warehouse,
                    progress: 'Завершен',
                    unique_id: item.unique_id,
                    article: item.article,
                    name: item.name,
                    barcode: item.barcode,
                    place: item.place,
                    quantity_start: foundItem ? foundItem.quantity : 0, // Если нашли, берем quantity, иначе 0
                    quanity_place: item.quantity,
                    goods_status: item.goods_status
                };
            });
            console.log("данные на отправку ", request)
    
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
                <Barcode
                    className="print-only"
                    value={addproducts.add_number}
                    format="CODE128"
                    width={2}         // Уменьшаем ширину штрих-кода
                    height={40}       // Уменьшаем высоту штрих-кода
                    />
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
                                <th >Штрихкод товара по 1С</th>
                                <th >Штрихкод товара при приемке</th>
                                <th>Количество по 1С</th>
                                <th>Фактически принято</th>
                                <th>Размещено товара</th>
                                <th>Места товара</th>
                                <th>Количество на месте</th>
                            
                                {/* <th>Статус товара</th> */}
                                

                            </tr>
                        </thead>
                        <tbody>
                        {addproducts.items.map((stock, index) => {
                            const finalQuantity = Array.isArray(dataProducts) 
                            ? dataProducts.find(item => item.article === stock.article)?.final_quantity || '0' 
                            : '0';
                            console.log(dataProducts)
                            const filteredProducts = placeProducts.filter(item => item.article === stock.article) || [];

                            return (
                            <tr key={index}>
                                <td>{stock.article}</td>
                                <td className='text-left'>{stock.name}</td>
                                
                                <td>
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
