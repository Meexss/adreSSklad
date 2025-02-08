import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';
import api from './api'; // Импортируешь созданный файл


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

    


    // const api = useMemo(() => axios.create({
    //     // baseURL: 'https://adressklad.onrender.com',
    //     baseURL: 'http://127.0.0.1:8000',
    // }), []);
 

    const handlePlaceScan = async (e) => {
        setCurrentStep(0)
        const value = e.target.value
        setPlace(value);
        console.log(value);

        try {
            const response = await api.get(`/api/serch_place/?place=${value}`)
            console.log(response)
            setFilteredPlace(response.data);
            setError('')
            setCurrentStep(2);

        }
        catch(err) {
            setError(`Ошибка загрузки места: ${error.message || error}`);
            setCurrentStep(-1)
        }

        console.log("Сканированное место:", value);
    };

    const handleBarcodeScan = async (e) => {
        setCurrentStep(0)
        const code = e.target.value;
        setBarcode(code);
        console.log(code)

        // Фильтруем нужные товары
        const foundProducts = filteredPlace.filter((item) => item.barcode === code);
        if(foundProducts.length > 0){
            console.log(foundProducts)
            setFilteredBarcode(foundProducts);
            setSumPlace(foundProducts.reduce((acc, item) => acc + item.quantity, 0));
            setCurrentStep(3)
        } else {
            setError('Баркод не найден')
            setCurrentStep(2)
        }
    };

    const handleFinalQuantityChange = (e) => {
        setColChange(Number(e.target.value));; // Обновляем введенное значение
      };


    const handleSubmit =() => {
        setCurrentStep(4)
    }

    const handlePlaceScanFinal = async (e) => {
        setCurrentStep(0)
        setError('')
        const updatedNewPlace = e.target.value; // Новое место из сканера
        setNewPlace(updatedNewPlace);
    
        console.log("Отправка запроса:", { place, barcode, colChange, newPlace: updatedNewPlace });
    
        try {
            const response = await api.post("/api/products/", {
                place: place,           // Откуда переносим
                barcode: barcode,       // Штрихкод товара
                colChange: colChange,   // Количество к переносу
                newPlace: updatedNewPlace // Куда переносим
            });
            setCurrentStep(5)
            setTimeout(() => {
                setCurrentStep(1);}, 2000)
            setError('')
            setBarcode('')
            setColChange('')
            setFilteredPlace('')
            setFilteredBarcode('')
            setSumPlace('')
        } catch (error) {
            setError(`Ошибка отправки данных: ${error.message || error}`);
            setCurrentStep(4)
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
               
               {/* Шаг первый установка ячейки товара  */}
               {curretStep === 1 && (
                    <div className="scan-section">
                        <h2>Сканируйте ячейку товара от куда переместить!!!</h2>
                        <input 
                        className="scan-input"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handlePlaceScan(e);
                            }
                        }}
                        
                                autoFocus
                                inputMode="none" />
                    </div>
                )}

                {/* Шаг второй установка баркода товара  */}
               {curretStep === 2 && (
                    <div className="scan-section">
                        <h2>Сканируйте Штрихкод товара</h2>
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
                            onInput= {handleFinalQuantityChange} // Сохраняем введенное количество
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
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handlePlaceScanFinal(e);
                            }
                        }}
                        
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
