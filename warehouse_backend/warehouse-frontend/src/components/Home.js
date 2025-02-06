// src/components/Home.js
import React from 'react';
import { Link,useNavigate  } from 'react-router-dom';
import Layout from './Layout';
import { logout } from "./auth"; // импортируем сервис

const Home = () => {

    const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // выполняем логаут (удаляем токены и т.д.)
    navigate("/login"); // редирект на страницу логина
  };
    return (
        <Layout>
            <div style={{ textAlign: 'center' }}>
                <h2>Добро пожаловать в систему управления складом</h2>
                <div>
                    <Link to="/TSDmenu">
                        <button className='buttonTSDHome'>Меню ТСД</button>
                    </Link>
                    <button className='buttonTSDHome' onClick={handleLogout}>
                    Выход
                    </button>


                </div>
            </div>
        </Layout>
    );
};

export default Home;
