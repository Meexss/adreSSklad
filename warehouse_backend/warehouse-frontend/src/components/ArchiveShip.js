import React, { useEffect, useState } from 'react';
import Layout from './Layout';
import { useNavigate } from 'react-router-dom';
import api from './api'; // Импортируешь созданный файл

const ArchiveShip = () => {
    const [addproducts, setAddproducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/api/archiveShip/')
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
            const { unique_id_ship } = add;
            if (!acc[unique_id_ship]) {
                acc[unique_id_ship] = {
                    unique_id_ship,
                    type: add.type,
                    ship_number: add.ship_number,
                    ship_date: add.ship_date,
                    counterparty: add.counterparty,
                    warehouse: add.warehouse,
                    progress: add.progress,
                    final_ship_date: add.final_ship_date,
                    items: [],
                };
            }
            acc[unique_id_ship].items.push(add);
            return acc;
        }, {});
    };

    return (
        <Layout>
            <div>
                <h2>Архив отгрузок с 1С (перемещение/ реализации товара)</h2>
                
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
                                <th>Номер отгрузки 1С</th>
                                <th>Дата отгрузки</th>
                                <th>Дата завершения отгрузки</th>
                                <th>Контрагент</th>
                                <th>Склад отгрузки</th>
                                <th>Кол-во Отгруженных позиций</th>
                                <th>Кол-во Отгруженного товара</th>
                                <th>Статус отгрузки</th>
                            </tr>
                        </thead>
                        <tbody>
                        {Object.values(addproducts).map(addproduct => (
                                <tr
                                    key={addproduct.items.unique_id_ship}
                                    // onClick={() => navigate(`/add-product/${addproduct.unique_id_add}`, { state: { addproducts: addproduct } })}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>{addproduct.type}</td>
                                    <td>{addproduct.ship_number}</td>
                                    <td>{addproduct.ship_date}</td>
                                    <td>{addproduct.final_ship_date}</td>
                                    <td className='text-left'>{addproduct.counterparty}</td>
                                    <td>{addproduct.warehouse}</td>
                                    <td>{addproduct.items.length}</td>
                                    <td>
                                        {addproduct.items.reduce((total, stock) => total + stock.quantity, 0)}
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

export default ArchiveShip;
