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


    const handlePlaceScan = async (e) => {
        setCurrentStep(0)
        
        const data = e.target.value
        setPlace(data);
        console.log(place);
        try{
            const res = await api.get(`/api/serch_place/?place=${data}`)
        
                console.log(res)
                // Фильтруем товары по ячейке
                setFilteredProducts(res.data);
                setCurrentStep(2);
        } catch (err) {
            setCurrentStep(-1)
            setError(err.message)
        }
    
        console.log("Сканированное место:", data);
    };
    


    return (
        <TSDLayout>
            <div className="containerr">
                <Link to="/TSDmenu"><button class='buttonBack'>В меню</button></Link>

                {/* Шаг для загрузки данных  */}
                {curretStep === 0 && (
                    <div className="scan-section-loader">
                        <span class="loader"></span>
                    </div>
                )}
                {/* Шаг для ошибки данных  */}
                {curretStep === -1 && (
                    <div className="scan-section">
                        <p className='mainText'>{error}</p>
                        <p className='mainText'>Повторите действие повторно</p>
                    </div>
                )}

               {/* Шаг первый установка ячейки товара  */}
               {curretStep === 1 && (
                    <div className="scan-section">
                        <h2>Сканируйте ячейку товара</h2>
                        <input 
                        className="scan-input"
                        onInput= {handlePlaceScan} // передаем только значение
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
