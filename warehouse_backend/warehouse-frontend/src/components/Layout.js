// src/components/Layout.js
import React from 'react';
import { Link } from 'react-router-dom';

const Layout = ({ children }) => {
    return (
        <div className='mainWraper'>
            <header>
                <h1>Акватехнологии.Склад</h1>
                <nav>
                    <ul>
                        {/* <li><Link to="/">Главная</Link></li> */}
                        <li><Link to="/operations">Расходные операции</Link></li>
                        <li><Link to="/products">Список товаров</Link></li>
                        <li><Link to="/add-product-list">Список приходов</Link></li>
                        <li><Link to="/TSDmenu">Меню ТСД</Link></li>
                        <li><Link to="/search">Поиск</Link></li>
                    </ul>
                </nav>
            </header>
            <main>
                {children}
            </main>
            {/* <footer>
                <p>© 2025 by Pavlov</p>
            </footer> */}
        </div>
    );
};

export default Layout;
