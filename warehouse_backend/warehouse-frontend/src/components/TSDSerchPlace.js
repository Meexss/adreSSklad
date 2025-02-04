import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';

// Компонент для поиска товара
const TSDSerchPlace = () => {
    const [curretStep, setCurrentStep] = useState(1);
    const [place, setPlace] = useState("");
    const [products, setProducts] = useState([]); // Храним товары из API
    const [error, setError] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);


    const api = useMemo(() => axios.create({
        // baseURL: 'https://adressklad.onrender.com',
        baseURL: 'http://127.0.0.1:8000',
    }), []);


    const handlePlaceScan = (place) => {
        setPlace(place);
        console.log(place);
    
        api.get(`/api/products/`)
            .then((response) => {
                setProducts(response.data);
    
                // Фильтруем товары по ячейке
                const foundProducts = response.data.filter((item) => item.place === place);
                setFilteredProducts(foundProducts);
                setCurrentStep(2);
            })
            .catch((error) => setError(error));
    
        console.log("Сканированное место:", place);
    };
    


    return (
        <TSDLayout>
            <div className="containerr">
                <Link to="/TSDmenu"><button class='buttonBack'>В меню</button></Link>
               
               {/* Шаг первый установка ячейки товара  */}
               {curretStep === 1 && (
                    <div className="scan-section">
                        <h2>Сканируйте ячейку товара</h2>
                        <input 
                        className="scan-input"
                        onChange={(e) => handlePlaceScan(e.target.value)} // передаем только значение
                                autoFocus
                                inputMode="none" />
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}

                {/* Шаг второй отображение найденных позиций  */}
                {filteredProducts.length > 0 && (
                    <div>
                        <h3>Список позиций соответствующих Ячейке:</h3>
                        <div className="serch-info-place">
                                <div className='blockInfoSerch'>
                                    <p className='supText'>Место: </p>
                                    <p className='mainText'>{place}</p>
                                </div>
                        </div>        
                        
                        {filteredProducts.map((item, index) => (
                            <div className="serch-info">
                            <p className='mainText'>{item.name}</p>
                            <div className='blockInfo'>
                                <p className='supText'>Артикул: </p>
                                <p className='mainText'>{item.article}</p>
                            </div>
                            <div className='blockInfo'>
                                <p className='supText'>Баркод: </p>
                                <p className='mainText'>{item.barcode}</p>
                            </div>
                            <div className='blockInfo'>
                                <p className='supText'>Количество: </p>
                                <p className='mainText'>{item.quantity} шт.</p>
                            </div>

                        </div>
                        ))}
                    </div>
                )}
            </div>    
        </TSDLayout>
    );
};

export default TSDSerchPlace;
