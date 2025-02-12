import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import TSDLayout from "./TSDLayout";

const TSDTest = () => {
    const [scannedBarcodes, setScannedBarcodes] = useState([]); // Список отсканированных штрихкодов
    const [broadcastMessages, setBroadcastMessages] = useState([]); // Список Broadcast-сообщений
    const inputRef = useRef(null); // Для автофокуса

    // Функция добавления штрихкода в список
    const addBarcode = (code) => {
        if (code && code.length === 13) {
            setScannedBarcodes((prev) => [...prev, code]);
        }
    };

    // 1️⃣ ОБРАБОТКА ВВОДА В INPUT
    const handleInput = (e) => {
        const code = e.target.value.trim();
        if (code.length === 13) {
            addBarcode(code);
            e.target.value = "";
        }
        else {
            
        }
    };

    // 2️⃣ ОБРАБОТКА BROADCAST-СООБЩЕНИЙ
    useEffect(() => {
        const handleBroadcast = (event) => {
            const message = `Broadcast message: ${event.data}`;
            setBroadcastMessages((prev) => [...prev, message]); // Добавляем сообщение на экран
            addBarcode(event.data); // Добавляем штрихкод в список
        };

        window.addEventListener("message", handleBroadcast);
        return () => window.removeEventListener("message", handleBroadcast);
    }, []);

    return (
        <TSDLayout>
            <div className="containerr">
                <Link to="/TSDmenu">
                    <button className="buttonBack">В меню</button>
                </Link>

                <div className="scan-section">
                    <h2>Сканируйте баркод товара</h2>
                    <input
                        className="scan-input"
                        // ref={inputRef}
                        onInput={handleInput} // Ввод с клавиатуры
                        autoFocus
                        inputMode="none"
                    />
                </div>

                {/* Отображение списка отсканированных штрихкодов */}
                {scannedBarcodes.length > 0 && (
                    <div>
                        <h3>Отсканированные штрихкоды:</h3>
                        <ul>
                            {scannedBarcodes.map((code, index) => (
                                <li key={index} className="scanned-code">{code}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Отображение Broadcast-сообщений */}
                {broadcastMessages.length > 0 && (
                    <div>
                        <h3>Полученные Broadcast-сообщения:</h3>
                        <ul>
                            {broadcastMessages.map((msg, index) => (
                                <li key={index}>{msg}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </TSDLayout>
    );
};

export default TSDTest;
