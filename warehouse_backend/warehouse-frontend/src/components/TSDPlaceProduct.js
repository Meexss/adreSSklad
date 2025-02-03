import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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
    

    // Функция загрузки товаров по номеру приемки
    const loadAcceptance = async () => {
        try {
            const response = await axios.get(
                `https://adressklad.onrender.com/api/addproducts/?add_number=${acceptanceNumber}`
            );
            setProducts(response.data);
            setCurrentStep(2);
        } catch (error) {
            console.error("Ошибка загрузки приемки:", error);
        }
    };

    // Функция обработки сканирования баркода
    const handleBarcodeScan = (e) => {
        const code = e.target.value;
        setBarcode(code);
        console.log("Сканированный баркод:", code);
        console.log("Данные API:", products);
    
        if (products.length === 0) {
            setError('Нет данных для поиска');
            return;
        }
    
        let foundProduct = null;
    
        // Проходим по всем позициям и ищем нужный barcode
        for (let product of products) {
            if (product.positionData) {
                foundProduct = product.positionData.find(
                    (pos) => pos.barcode === code
                );
                if (foundProduct) {
                    break; // Если нашли, выходим из цикла
                }
            }
        }
    
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
        } else {
            alert("Количество не может превышать допустимое значение!{currentProduct.final_quantity}");
        }
    };

    // Функция отправки данных на сервер
    const submitData = async () => {
        if (!currentProduct || !place || !quantity) {
            alert("Заполните все поля!");
            return;
        }

        const requestData = [{
            add_number: acceptanceNumber,
            article: currentProduct.article,
            name: currentProduct.name,
            barcode: barcode,
            quantity: quantity,
            unique_id: "",
            place: place,
            goods_status: "Хранение"
        }];

        console.log(requestData)
        try {
            await axios.post("https://adressklad.onrender.com/api/placeship/", requestData);
            alert("Данные успешно отправлены!");
            setCurrentStep(2); // Возвращаемся к сканированию нового номера приемки
            setBarcode("");
            setCurrentProduct(null);
            setPlace("");
            setQuantity("");
        } catch (error) {
            console.error("Ошибка отправки данных:", error);
        }
    };

    return (
        <div className="app-container">
            <Link to="/add-product"><button class='buttonBack'>В меню</button></Link>
            {curretStep === 1 && (
                <div className="scan-section">
                    <h2>Сканируйте номер приемки</h2>
                    <input
                    className="scan-input"
                        onChange={(e) => {
                            if (e.target.value.length === 5) {
                                
                                setAcceptanceNumber(e.target.value);
                                loadAcceptance();
                            }
                        }}
                        autoFocus
                    />
                </div>
            )}

            {curretStep === 2 && (
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

            {curretStep === 3 && currentProduct && (
                <div className="place-section">
                    <h2>Сканируйте место хранения</h2>
                    <input value={place} onChange={(e) => setPlace(e.target.value)} autoFocus />
                    <button onClick={() => setCurrentStep(4)}>Далее</button>
                </div>
            )}

            {curretStep === 4 && currentProduct && (
                <div className="quantity-section">
                    <h2>Введите количество</h2>
                    <label>Доступное количество:</label>
                    <label>{currentProduct.final_quantity}</label>
                    <input type="number" value={quantity} onChange={handleQuantityChange} autoFocus />
                    <button onClick={submitData}>Подтвердить</button>
                </div>
            )}
        </div>
    );
};

export default TSDPlaceProduct;
