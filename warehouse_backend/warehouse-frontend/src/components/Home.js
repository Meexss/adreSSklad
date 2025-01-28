// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from './Layout';

const Home = () => {
    return (
        <Layout>
            <div style={{ textAlign: 'center' }}>
                <h2>Добро пожаловать в систему управления складом</h2>
                <div>
                    <Link to="/products">
                        <button style={{ margin: '10px', padding: '10px 20px' }}>Список товаров</button>
                    </Link>
                    <Link to="/operations">
                        <button style={{ margin: '10px', padding: '10px 20px' }}>Операции</button>
                    </Link>
                    <Link to="/add-product">
                        <button style={{ margin: '10px', padding: '10px 20px' }}>Оприходование</button>
                    </Link>
                    <Link to="/search">
                        <button style={{ margin: '10px', padding: '10px 20px' }}>Поиск товара</button>
                    </Link>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
