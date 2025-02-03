// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';  // Подключаем стили
import App from './App';
import { HashRouter } from "react-router-dom"; // Изменено на HashRouter

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
            <HashRouter> {/* Используется HashRouter */}
                <App />
            </HashRouter>,
            );
