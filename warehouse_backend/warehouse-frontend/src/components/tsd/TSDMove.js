import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';
import api from '../api'; // Импортируешь созданный файл


// Компонент для поиска товара
const TSDMove = () => {

    const [curretStep, setCurrentStep] = useState(1);
    const [error, setError] = useState("");
    const [barcode, setBarcode] = useState(""); //сканированный баркод
    const [filteredBarcode, setFilteredBarcode] = useState([])
    const [sunPlace, setSumPlace] = useState(0) //сумирование найденых
    const [quantity, setQuantity] = useState("");
    const [newPlace, setNewPlace] = useState('')

    const handleBarcodeScan = async (e) => {
        
        setCurrentStep(0)
        const code = e.target.value;
        setBarcode(code);
        console.log(code)
        try {
            const response = await api.get('/api/moveData/')
            console.log(response)
            
            if(response.status === 200) {
                const foundProducts = response.data.filter((item) => item.barcode === code);
                if(foundProducts.length > 0){
                    console.log(foundProducts)
                    setFilteredBarcode(foundProducts);
                    setSumPlace(foundProducts.reduce((acc, item) => acc + item.quantity, 0));
                    setCurrentStep(2)
                } else {
                    setError('Баркод не найден')
                    setCurrentStep(1)
                }
            }
        } catch (error) {
            console.error("Ошибка запроса:", error);
           setCurrentStep(-1)
        }
    };

        // Функция обработки ввода количества
        const handleQuantityChange = (e) => {

            const enteredQuantity = parseInt(e.target.value, 10);
            if (enteredQuantity <= sunPlace) {
                setQuantity(enteredQuantity);
                setError('')
            } else {
                setError(`Количество не может превышать допустимое значение! ${sunPlace}`)
            }
        };

        const handlePlaceScanFinal = async (e) => {
            setCurrentStep(0)
            setError('')
            const updatedNewPlace = e.target.value; // Новое место из сканера
            setNewPlace(updatedNewPlace);
        
            const request = {
                barcode: barcode,       // Штрихкод товара
                colChange: quantity,   // Количество к переносу
                newPlace: updatedNewPlace // Куда переносим
            }
            console.log(request)
        
            try {
                const response = await api.post("/api/moveChangePlace/", request);
                setCurrentStep(5)
                setTimeout(() => {
                    setCurrentStep(1);}, 2000)
                setError('')
                setBarcode('')
                setFilteredBarcode([])
                setSumPlace(0)
                setQuantity('')
                setNewPlace('')

              
            } catch (error) {
                setError(`Ошибка отправки данных: ${error.message || error}`);
                setCurrentStep(3)
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

                {curretStep === -1 && (
                            <div className="scan-section">
                                <p className='mainText'>{error}</p>
                                <p className='mainText'>Повторите действие повторно</p>
                            </div>
                )}

                {curretStep === 5 && (
                            <div className="scan-section">
                                <p className='mainText'>Данные успешно отправлены</p>
                            </div>
                )}

                {/* Шаг первый сканирование баркода  */}
               {curretStep === 1 && (
                    <div className="scan-section">
                        <h2>Сканируйте Штрихкод в месте Сборки</h2>
                        <input 
                        className="scan-input"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleBarcodeScan(e);
                            }
                        }}
                        
                                autoFocus
                                inputMode="none" />
                         {error && <p style={{ color: "red" }}>{error}</p>}        
                        <div>Дальше ENT</div>        
                    </div>
                )}

                {curretStep === 2 && (
                    <div className="quantity-section">
                    <div className="position-info">
                        <div className='blockInfo'>
                            <p className='supText'>Артикул: </p>
                            <p className='mainText'>{filteredBarcode[0].article}</p>
                        </div>
                        <div className='blockInfo'>
                            <p className='supText'>Наименование: </p>
                            <p className='mainText'>{filteredBarcode[0].name}</p>
                        </div>

                        <div className='blockInfo'>
                            <p className='supText'>Доступное количество: </p>
                            <p className='mainText'>{sunPlace} шт.</p>
                        </div>
                        <div className="quantity-input">   
                            <label className='mainText'>Введите кол-во:</label>    
                            <input
                                type="number"
                                value={sunPlace}  // Связываем input с состоянием
                            
                                onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleQuantityChange(e)
                                    console.log("Отправка количества:", sunPlace);
                                    setCurrentStep(3) // Проверяем текущее значение
                                }
                                }}
                                autoFocus
                                inputMode="numeric"  // Лучше использовать "numeric" для чисел
                            /> 
                            {error && <p style={{ color: "red" }}>{error}</p>}                         
                        </div>
                        <div>Дальше ENT</div>    
                    </div>
                </div>


                )}

                 {/* Шаг четвертый установка ячейки товара  */}
                 {curretStep === 3 && (
                    <div className="scan-section">
                        <h2>Сканируйте НОВУЮ ячейку товара</h2>
                        <input 
                        className="scan-input"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handlePlaceScanFinal(e);
                            }
                        }}
                        
                                autoFocus
                                inputMode="none" />
                        <div>Дальше ENT</div>        
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}

            </div>    
        </TSDLayout>
    );
};

export default TSDMove;