import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';

// Компонент для поиска товара
const TSDTest = () => {
    const [curretStep, setCurrentStep] = useState(1);
    const [barcode, setBarcode] = useState("");
    const [products, setProducts] = useState([]); // Храним товары из API
    const [error, setError] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);


    // const api = useMemo(() => axios.create({
    //     // baseURL: 'https://adressklad.onrender.com',
    //     baseURL: 'http://127.0.0.1:8000',
    // }), []);


    const handleBarcodeScan = (e) => {
        const code = e.target.value;
        setBarcode(code);
        console.log(code)
        console.log(barcode)

        // api.get(`/api/products/`)
        //     .then((response) => {
        //         setProducts(response.data);

        // // Фильтруем нужные товары
        // const foundProducts = response.data.filter((item) => item.barcode === code);
        //     setFilteredProducts(foundProducts);
        //     setCurrentStep(2)
        // })
        //     .catch((error) => setError(error));
        //     console.log(error)
        //     console.log(products)
        //     console.log(filteredProducts)
        //     console.log("Сканированный баркод:", code);
};


    return (
        <TSDLayout>
            <div className="containerr">
                <Link to="/TSDmenu"><button class='buttonBack'>В меню</button></Link>
               
               {/* Шаг первый установка баркода товара  */}
               {curretStep === 1 && (
                    <div className="scan-section">
                        <h2>Сканируйте баркод товара</h2>
                        <input 
                        className="scan-input"
                            onChange ={(e) =>{
                                if (e.target.value.length >= 5) {{handleBarcodeScan(e); }}}} 
                                autoFocus />
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}

                {/* Шаг второй отображение найденных позиций  */}
                {filteredProducts.length > 0 && (
                    <div>
                        <h3>Сканированный баркод:</h3>
                        <div className="serch-info">
                            <p className='mainText'>{barcode}</p>
                        </div>
                        {/* {filteredProducts.map((item, index) => (
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
                        ))} */}
                    </div>
                )}]
            </div>    
        </TSDLayout>
    );
};

export default TSDTest;
