import React, { useState} from 'react';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';
import api from './api'; // Импортируешь созданный файл


// Компонент для процесса приёмки товаров
const TSDPlaceProduct = () => {
    const [curretStep, setCurrentStep] = useState(1);
    const [acceptanceNumber, setAcceptanceNumber] = useState("");
    const [products, setProducts] = useState([]); // Храним товары из API
    const [barcode, setBarcode] = useState("");
    const [currentProduct, setCurrentProduct] = useState(null);
    const [place, setPlace] = useState("");
    const [quantity, setQuantity] = useState("");
    const [error, setError] = useState("");

    // const api = useMemo(() => axios.create({
    //     // baseURL: 'https://adressklad.onrender.com',
    //     baseURL: 'http://127.0.0.1:8000',
    // }), []);
    

    // Функция загрузки товаров по номеру приемки
    const loadAcceptance = async (e) => {
        const value = e.target.value
        setCurrentStep(0)
        setAcceptanceNumber(value)  
        try {
            const response = await api.get(
                `/api/addproducts/?uid_add=${value}`
            );
            setProducts(response.data);
            setCurrentStep(2);
        } catch (error) {
            setCurrentStep(-1)
            setError(`Ошибка загрузки приемки: ${error.message || error}`);
            
        }
    };

    // Функция обработки сканирования баркода
    const handleBarcodeScan = (e) => {
        setCurrentStep(0)
        const code = e.target.value;

        setTimeout(() => setBarcode(code), 200)
        console.log("Сканированный баркод:", code);
        console.log("Данные API:", products);
    
        if (products.length === 0) {
            setError('Нет данных для поиска');
            return;
        }

        const foundProduct = products.find(position => position.barcode === code);
    
        if (foundProduct) {
            console.log("Товар найден:", foundProduct);
            setCurrentProduct(foundProduct);
            setCurrentStep(3); // Переход к сканированию места
            setError("");
        } else {
            setError("Баркод не найден!");
            setCurrentStep(2);
        }
    };

    // Функция обработки ввода количества
    const handleQuantityChange = (e) => {
        const enteredQuantity = parseInt(e.target.value, 10);
        if (currentProduct && enteredQuantity <= currentProduct.final_quantity) {
            setQuantity(enteredQuantity);
            setError('')
        } else {
            setError(`Количество не может превышать допустимое значение! ${currentProduct.final_quantity}`)
        }
    };

    
    // Функция отправки данных на сервер
    const submitData = async () => {
        setCurrentStep(0)

        const requestData = [{
            type: currentProduct.type,
            uid_add: currentProduct.unique_id_add,
            add_date: currentProduct.add_date,
            add_number: acceptanceNumber,
            article: currentProduct.article,
            name: currentProduct.name,
            barcode: barcode,
            quantity: quantity,
            place: place,
            goods_status: "Хранение"
        }];

        console.log(requestData)
        try {
            await api.post("/api/placeship/", requestData);
            setCurrentStep(5);
            setTimeout(() => {
              setCurrentStep(2);
            }, 2000);
            setBarcode("");
            setCurrentProduct(null);
            setPlace("");
            setQuantity("");
            setError('')
        } catch (error) {
            setCurrentStep(0)
            setError(`Ошибка загрузки приемки: ${error.message || error}`);
            setCurrentStep(-2);

        }
    };

    return (
        <TSDLayout>
            <div className="containerr">
                <Link to="/add-product"><button class='buttonBack'>В меню</button></Link>
                
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
                        <h2>Сканируйте номер приемки</h2>
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
                    </div>
                )}

                {/* Шаг второй установка баркода товара  */}
                {curretStep === 2 && (
                    <div className="scan-section">
                        <h2>Сканируйте баркод товара</h2>
                        <input 
                        className="scan-input"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleBarcodeScan(e);
                            }
                        }} 
                    
                                autoFocus 
                                inputMode="none"/>
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                )}

                {/* Установка места хранения */}
                {curretStep === 3 && currentProduct && (
                    <div className="scan-section">
                        <h2>Сканируйте место хранения</h2>
                        <input onChange={(e) => {setPlace(e.target.value)}} autoFocus inputMode="none"/>
                        <button className='buttonCompl' onClick={() => setCurrentStep(4)}>Далее</button>
                    </div>
                )}

                {/* Шаг четвертый установка количества товара  */}
                {curretStep === 4 && currentProduct && (
                    <div className="quantity-section">
                        <h2>Введите количество</h2>
                        <div className="position-info">
                            <div className='blockInfo'>
                                <p className='supText'>Доступное количество: </p>
                                <p className='mainText'>{currentProduct.final_quantity} шт.</p>
                            </div>
                            <div className="quantity-input">   
                                <label className='mainText'>Введите кол-во:</label>    
                                <input type="number" onChange={handleQuantityChange} autoFocus inputMode="none"/>    
                                {error && <p style={{ color: "red" }}>{error}</p>}                         
                            </div>
                            <button className='buttonCompl' onClick={submitData}>Подтвердить</button> 
                        </div>
                    </div>
                )}
            </div>
        </TSDLayout>
    );
};

export default TSDPlaceProduct;
