import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import api from './api'; // Импортируешь созданный файл

const AddProductList = () => {
    const [addproducts, setAddproducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // const api = useMemo(() => axios.create({
    //     baseURL: 'http://127.0.0.1:8000',
    // }), []);

    useEffect(() => {
        api.get('/api/addproducts/')
            .then(response => {
                setAddproducts(groupShipmentsByUniqueId(response.data));
                console.log(groupShipmentsByUniqueId(response.data))
                setLoading(false);
                console.log(response.data)
            })
            .catch(error => {
                console.error("Ошибка запроса:", error);
                setErrorMessage(`Ошибка: ${error.response?.data?.error || error.message}`);
                setLoading(false);
            });
    }, [api]);


    const groupShipmentsByUniqueId = (data) => {
        return data.reduce((acc, add) => {
            const { unique_id_add } = add;
            if (!acc[unique_id_add]) {
                acc[unique_id_add] = {
                    unique_id_add,
                    type: add.type,
                    add_number: add.add_number,
                    add_date: add.add_date,
                    counterparty: add.counterparty,
                    warehouse: add.warehouse,
                    progress: add.progress,
                    items: [],
                };
            }
            acc[unique_id_add].items.push(add);
            return acc;
        }, {});
    };

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
                                <th>Тип</th>
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
                        {Object.values(addproducts).map(addproduct => (
                                <tr
                                    key={addproduct.items.unique_id_add}
                                    onClick={() => navigate(`/add-product/${addproduct.unique_id_add}`, { state: { addproducts: addproduct } })}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>{addproduct.type}</td>
                                    <td>{addproduct.add_number}</td>
                                    <td>{addproduct.add_date}</td>
                                    <td className='text-left'>{addproduct.counterparty}</td>
                                    <td>{addproduct.warehouse}</td>
                                    <td>{addproduct.items.length}</td>
                                    <td>
                                        {addproduct.items.reduce((total, stock) => total + stock.quantity, 0)}
                                    </td>
                                    <td>
                                        {addproduct.items.reduce((total, stock) => total + stock.final_quantity, 0)}
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
