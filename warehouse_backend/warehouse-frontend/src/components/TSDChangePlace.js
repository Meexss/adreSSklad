import React, { useState, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';

// Компонент для поиска товара
const TSDChangePlace = () => {
    const [curretStep, setCurrentStep] = useState(1);
    const [place, setPlace] = useState(""); //первое сканированное место
    const [products, setProducts] = useState([]); // Храним товары из API
    const [error, setError] = useState("");
    const [barcode, setBarcode] = useState(""); //сканированный баркод
    const [filteredPlace, setFilteredPlace] = useState([]); // фильтрованный массив по месту
    const [filteredBarcode, setFilteredBarcode] = useState([]); //фильтрованный массив по баркоду
    const [sunPlace, setSumPlace] = useState(0) //сумирование найденых
    const [colChange, setColChange] = useState(0) //количество тавара к изменению
    const [newPlace, setNewPlace] = useState('')

    


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
                setFilteredPlace(foundProducts);
                setCurrentStep(2);
            })
            .catch((error) => setError(error));
    
        console.log("Сканированное место:", place);
    };

    const handleBarcodeScan = (barcode) => {
        const code = barcode;
        setBarcode(code);
        console.log(code)

        // Фильтруем нужные товары
        const foundProducts = filteredPlace.filter((item) => item.barcode === code);
            setFilteredBarcode(foundProducts);

            console.log(error)
            console.log(products)
            console.log(filteredBarcode)
            console.log("Сканированный баркод:", code);

            setSumPlace(foundProducts.reduce((acc, item) => acc + item.quantity, 0));
            setCurrentStep(3);
            setCurrentStep(3)
    };

    const handleFinalQuantityChange = (e) => {
        setColChange(Number(e.target.value));; // Обновляем введенное значение
      };


    const handleSubmit =() => {
        setCurrentStep(4)
    }

    const handlePlaceScanFinal = (place) => {
        setNewPlace(place);
        console.log(place);
        console.log(place, barcode, colChange, newPlace )
    
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

                {/* Шаг второй установка баркода товара  */}
               {curretStep === 2 && (
                    <div className="scan-section">
                        <h2>Сканируйте Штрихкод товара</h2>
                        <input 
                        className="scan-input"
                        onChange={(e) => handleBarcodeScan(e.target.value)} // передаем только значение
                                autoFocus
                                inputMode="none" />
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}

                {/* Шаг третий вывод позиции и установка кол-ва  */}
                {curretStep === 3 && (
                    <div>
                    <h3>Найдена позиция:</h3>
                    <div className="position-info">
                        <p className='mainText'>{filteredBarcode[0].name}</p>
                        <div className='blockInfo'>
                        <p className='supText'>Артикул: </p>
                        <p className='mainText'>{filteredBarcode[0].article}</p>
                        </div>
                        <div className='blockInfo'>
                        <p className='supText'>Кол-во в ячейке:</p>
                        <p className='mainText'>{sunPlace} шт.</p>
                        </div>
                        <div className="quantity-input">   
                        <label className='mainText'>Введите кол-во к перемещению:</label>
                        <input
                            type="number"
                            onChange={handleFinalQuantityChange} // Сохраняем введенное количество
                            autoFocus
                            inputMode="none"
                        />
                        </div>
                        <button className='buttonCompl' onClick={handleSubmit}>Подтвердить</button>
                    </div>
                    </div>
                )}

                {/* Шаг четвертый установка ячейки товара  */}
                {curretStep === 4 && (
                    <div className="scan-section">
                        <h2>Сканируйте НОВУЮ ячейку товара</h2>
                        <input 
                        className="scan-input"
                        onChange={(e) => handlePlaceScanFinal(e.target.value)} // передаем только значение
                                autoFocus
                                inputMode="none" />
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}


            </div>    
        </TSDLayout>
    );
};

export default TSDChangePlace;
