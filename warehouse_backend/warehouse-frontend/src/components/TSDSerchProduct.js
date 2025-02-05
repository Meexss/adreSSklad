import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';

// Компонент для поиска товара
const TSDSerchProduct = () => {
    const [curretStep, setCurrentStep] = useState(1);
    const [barcode, setBarcode] = useState("");
    const [products, setProducts] = useState([]); // Храним товары из API
    const [error, setError] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);


    const api = useMemo(() => axios.create({
        // baseURL: 'https://adressklad.onrender.com',
        baseURL: 'http://127.0.0.1:8000',
    }), []);


    const handleBarcodeScan = async (e) => {
        setCurrentStep(0)
        const code = e.target.value;
        setBarcode(code);
        console.log(code)


        try{
            const res = await api.get(`/api/products/`)
        
                setProducts(res.data);
                // Фильтруем товары по ячейке
                const foundProducts = res.data.filter((item) => item.barcode === code);
                setFilteredProducts(foundProducts);
                setCurrentStep(2);
        } catch (err) {
            setCurrentStep(-1)
            setError(err.message)
        }

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
               
               {/* Шаг первый установка баркода товара  */}
               {curretStep === 1 && (
                    <div className="scan-section">
                        <h2>Сканируйте баркод товара</h2>
                        <input 
                        className="scan-input"
                        onInput= {handleBarcodeScan} 
                                autoFocus
                                inputMode="none" />
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}

                {/* Шаг второй отображение найденных позиций  */}
                {filteredProducts.length > 0 && (
                    <div>
                        <h3>Список позиций соответствующих баркоду:</h3>
                        <div className="serch-info">
                            <p className='mainText'>{filteredProducts[0].name}</p>
                            <div className='blockInfo'>
                                <p className='supText'>Артикул: </p>
                                <p className='mainText'>{filteredProducts[0].article}</p>
                            </div>
                            <div className='blockInfo'>
                                <p className='supText'>Баркод: </p>
                                <p className='mainText'>{filteredProducts[0].barcode}</p>
                            </div>
                        </div>
                        {filteredProducts.map((item, index) => (
                            <div key={index} className="serch-info-place">
                                <div className='blockInfoSerch'>
                                    <p className='supText'>Место: </p>
                                    <p className='mainText'>{item.place}</p>
                                </div>
                                <div className='blockInfoSerch'>
                                    <p className='supText'>Кол-во: </p>
                                    <p className='mainText'>{item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>    
        </TSDLayout>
    );
};

export default TSDSerchProduct;
