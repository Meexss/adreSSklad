import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';
import { Link, useNavigate } from 'react-router-dom';


const Operations = () => {
    const [shipments, setShipments] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('https://adressklad.onrender.com/api/shipments/')
            .then(response => setShipments(response.data))
            .catch(error => console.error(error));
    }, []);
    console.log("я молодец")
    console.log(shipments)
    return (
        <Layout>
            <div>
                <h2>Расходные операции</h2>
                <div>
                <table >
                    <thead>
                        <tr>
                            <th >Тип операции</th>
                            <th >Номер отгрузки</th>
                            <th >Дата</th>
                            <th >Контрагент</th>
                            <th >Склад</th>
                            <th >Кол-во позиций</th>
                            <th>Кол-во едениц товара</th>
                            <th >Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shipments.map(shipment => (
                            <tr
                                key={shipment.shipment_number}
                                onClick={() => navigate(`/shipment/${shipment.shipment_number}`, { state: { shipment } })}
                                style={{ cursor: 'pointer' }} 
                            >
                                <td >Добавить в API</td>
                                <td >{shipment.shipment_number}</td>
                                <td >{shipment.shipment_date}</td>
                                <td >{shipment.counterparty}</td>
                                <td >{shipment.warehouse}</td>
                                <td >{shipment.stocks.length}</td>
                                <td >{shipment.stocks.reduce((total, stock) => total + stock.quantity, 0)}</td>
                                <td >{shipment.progress}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>
        </Layout>
    );
};

export default Operations;