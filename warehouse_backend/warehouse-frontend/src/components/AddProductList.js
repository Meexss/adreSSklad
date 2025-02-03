import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import { Link, useNavigate } from 'react-router-dom';


const AddProductList = () => {
    const [addproducts, setAddproducts] = useState([]);
    const navigate = useNavigate()

    useEffect(() => {
        axios.get('https://adressklad.onrender.com/api/addproducts/')
            .then(response => setAddproducts(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <Layout>
            <div>
                <h2>Список приходов с 1С (перемещение/ приход товара)</h2>
                <table >
                    <thead>
                        <tr >
                        <th ></th>
                            {/* <th >Тип операции</th> */}
                            <th >Номер прихода 1С</th>
                            <th >Дата</th>
                            <th >Поставшик</th>
                            <th >Склад</th>
                            <th >Кол-во позиций по 1С</th>
                            <th >Кол-во едениц товара по 1С</th>
                            <th >Кол-во принятого товара</th>
                            <th >Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {addproducts.map(addproducts => (
                            <tr
                                key={addproducts.add_number}
                                onClick={() => navigate(`/add-product/${addproducts.add_number}`, { state: { addproducts } })}
                                style={{ cursor: 'pointer' }} 
                            >
                                <td >Добавить в API</td>
                                <td >{addproducts.add_number}</td>
                                <td >{addproducts.add_date}</td>
                                <td >{addproducts.counterparty}</td>
                                <td >{addproducts.warehouse}</td>
                                <td >{addproducts.positionData.length}</td>
                                <td >
                                    {addproducts.positionData.reduce((total, stock) => total + stock.quantity, 0)}
                                </td>
                                <td >
                                    {addproducts.positionData.reduce((total, stock) => total + stock.final_quantity, 0)}
                                </td>
                                <td >{addproducts.progress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default AddProductList;