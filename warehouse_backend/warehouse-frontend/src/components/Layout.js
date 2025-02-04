import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './Layout.css';

const Layout = ({ children }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div >
            <header>
                <div className="mainWrapper">
                    <h1>Акватехнологии.Склад</h1>
                </div>
                <nav>
                    <button className="burger-menu" onClick={toggleMenu}>
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                        <span className="burger-line"></span>
                    </button>
                    <div className="nav-container">
                        <ul className={`nav-links ${isMenuOpen ? "open" : ""}`}>
                            <li><NavLink to="/operations" className={({ isActive }) => isActive ? "active" : ""}>Расходные операции</NavLink></li>
                            <li><NavLink to="/products" className={({ isActive }) => isActive ? "active" : ""}>Список товаров</NavLink></li>
                            <li><NavLink to="/add-product-list" className={({ isActive }) => isActive ? "active" : ""}>Список приходов</NavLink></li>
                            <li><NavLink to="/TSDmenu" className={({ isActive }) => isActive ? "active" : ""}>Меню ТСД</NavLink></li>
                            <li><NavLink to="/search" className={({ isActive }) => isActive ? "active" : ""}>Поиск</NavLink></li>
                        </ul>
                    </div>
                </nav>
            </header>
            <main>
                {children}
            </main>
        </div>
    );
};

export default Layout;


