import React, { useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';
import api from '../api'; // Импортируешь созданный файл


// Компонент для процесса приёмки товаров
const TSDAssembly = () => {
    const [curretStep, setCurrentStep] = useState(1);
    const [acceptanceNumber, setAcceptanceNumber] = useState("");
    const [products, setProducts] = useState([]); // Храним товары из API
    const [error, setError] = useState("");
    
    const loadData = async (uid) => {
        try {
            const response = await api.get(`/api/reserfInfo/?uid_ship=${uid}`);
            const filterData = response.data.filter(item => item.goods_status === "В отгрузке")
            
            setProducts(filterData);
            setCurrentStep(2);
        } catch (error) {
            setCurrentStep(1);
            setError(`Ошибка загрузки приемки: ${error.message || error}`);
        }
    };

    const loadAcceptance = async (e) => {
        const value = e.target.value;
        setCurrentStep(0);
        setAcceptanceNumber(value);
        
        await loadData(value); // ✅ Передаем значение сразу
    };

    const handlePlace = (e) => {
        const scanPlace = e.target.value

        if ( scanPlace === products[0].place) {
            setCurrentStep(3)
            setError('')
        } else {
            setError('Cканирована не верная ячейка')
        }

    }

    const handleBarcode = (e) => {
        const scanBarcode = e.target.value

        if(scanBarcode === products[0].barcode){
            setCurrentStep(4)
            setError('')
        } else {
            setError("Сканирован не верный Штрихкод")
        }
    }

    const submitData = async () => {
        setCurrentStep(0)
        setError('')
        try {
            const request = {
                ship_id: products[0].unique_id_ship,
                stock: [products[0].unique_id]
            }
            console.log(request)
            const resp = await api.post('/api/changePlaceAndStatus/', request)
            if (resp.status === 200) {
                setProducts([])
                setCurrentStep(5);
                setError('') 
                loadData(acceptanceNumber);
                setTimeout(() => {
                    setCurrentStep(2);
                  }, 2000);
                 
            }
        } catch(error) {
            setCurrentStep(4)
            setError('Ошибка в отправке данных', error.status)
        } 

    }

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
                {curretStep === -2 && (
                            <div className="scan-section">
                                <p className='mainText'>{error}</p>
                                <p className='mainText'>Повторите действие повторно</p>
                                <button className='buttonCompl' onClick={submitData}>Повторно отсканировать товар</button>
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
               
                {/* Шаг первый установка номера поставки  */}
                {curretStep === 1 && (
                    <div className="scan-section">
                        <h2>Сканируйте номер сборки</h2>
                        <input
                        className="scan-input"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                loadAcceptance(e);
                            }
                        }}                                              
                            autoFocus
                            inputMode="none"
                        />
                        <div>Дальше ENT</div>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}
                  {curretStep === 2 && (
                    <div className="scan-section">
                        <h2>Место отбора</h2>
                            <div className='blockInfo'>   
                                <p style={{marginBottom: '15px'}} className='mainText'>{products[0].place}</p>
                        </div>
                        <p>Отсканируйте место отбора</p>
                        <input
                        className="scan-input"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handlePlace(e);
                            }
                        }}                                              
                            autoFocus
                            inputMode="none"
                        />
                        <div>Дальше ENT</div>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}
                {curretStep === 3 && (
                    <div className="scan-section">
                        <h2>Товар к отбору</h2>
                        <div className="position-info">
                            <div className='blockInfo'>
                                <p className='supText'>Артикул : </p>
                                <p className='mainText'>{products[0].article}</p>
                            </div>
                            <div className='blockInfo'>
                                <p className='supText'>Наименование : </p>
                                <p className='mainText'>{products[0].name}</p>
                            </div>
                            <div className='blockInfo'>
                                <p className='supText'>Штрихкод : </p>
                                <p className='mainText'>{products[0].barcode}</p>
                            </div>


                        </div>
                        <p>Отсканируйте штрихкод товара</p>
                        <input
                        className="scan-input"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleBarcode(e);
                            }
                        }}                                              
                            autoFocus
                            inputMode="none"
                        />
                        <div>Дальше ENT</div>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}

                {curretStep === 4 && (
                    <div className="scan-section">
                        <h2>Количество к отбору</h2>
                        <div className="position-info">
                            <div className='blockInfo'>
                                <p className='supText'>Артикул : </p>
                                <p className='mainText'>{products[0].article}</p>
                            </div>
                            <div className='blockInfo'>
                                <p className='supText'>Наименование : </p>
                                <p className='mainText'>{products[0].name}</p>
                            </div>
                            <div className='blockInfo'>
                                <p className='supText'>Штрихкод : </p>
                                <p className='mainText'>{products[0].barcode}</p>
                            </div>
                            <div className='blockInfo'>
                                <p className='supText'>Возьмите : </p>
                                <p style={{color: "red"}} className='mainText'>{products[0].quantity} шт.</p>
                            </div>


                        </div>
                        <button className='buttonCompl' onClick={submitData}>Подтвердить</button> 
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}

            </div>
        </TSDLayout>
    );
};

export default TSDAssembly;