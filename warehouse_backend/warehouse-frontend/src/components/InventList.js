import React from 'react';
import { Link,useNavigate  } from 'react-router-dom';
import Layout from './Layout';
import { logout } from "./auth"; // импортируем сервис

const InventList = () => {


    return (
        <Layout>
            <div>
                <h2>Инвентаризация</h2>
                <table>
                    <thead>
                        <th>Статус</th>
                        <th>Инвентаризируемая ячейка</th>
                        <th>Инвентаризирцемый номер</th>
                        <th>Дата создания</th>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        </Layout>
    );
};

export default InventList;