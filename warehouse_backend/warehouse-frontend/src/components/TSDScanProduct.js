import React, {useState, useCallback, useMemo  } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';

// Компонент для процесса приёмки товаров
const TSDScanProduct = () => {
  const [curretStep, setCurrentStep] = useState(1) // счётчик действий
  const [positions, setPositions] = useState([]); //получение данных с API
  const [foundPosition, setFoundPosition] = useState(null); //артикул и др
  const [barcode, setBarcode] = useState(''); //отсканированный баркод
  const [enteredQuantity, setEnteredQuantity] = useState(''); // Для хранения введенного количества
  const [error, setError] = useState(''); // Добавьте это состояние для ошибок
  const [apiData, setApiData] = useState([])
  const [numberAcceptance, setNumberAcceptance] = useState('')


  const api = useMemo(() => axios.create({
    // baseURL: 'https://adressklad.onrender.com',
    baseURL: 'http://127.0.0.1:8000',
}), []);

  const handleAcceptanceScan = async (e) => {
    setCurrentStep(0)
    const value = e.target.value;
    console.log("Вводится значение:", value);
  
      try {
        const loadResponse = await api.get(`/api/addproducts/?add_number=${value}`)
        setPositions(loadResponse.data);
        setApiData(loadResponse.data)
        setCurrentStep(2); // Только после успешной загрузки переходим к шагу 2
        console.log(value)
        console.log(positions)
      } catch (error) {
        console.error("Ошибка загрузки приемки:", error);
        setError(`Ошибка загрузки приемки: ${error.message || error}`);
        setCurrentStep(-1)
      }
  };


  // Обработка сканирования баркода
  const handleBarcodeScan = (e) => {
    const code = e.target.value;
    setBarcode(code);
    console.log("Сканированный баркод:", code);

    // Проверка на пустоту массива позиций
    if (positions.length === 0) {
        setError('Нет данных для поиска');
        return;
    }

    // Ищем баркод среди всех позиций
    let foundPosition = null;
    for (let position of positions) {
        foundPosition = position.positionData?.find(positionData => positionData.barcode === code);
        if (foundPosition) break; // Если нашли, прерываем цикл
    }

    if (foundPosition) {
      console.log(foundPosition)
        setFoundPosition(foundPosition);
        setCurrentStep(3)
    } else {
        setError('Баркод не найден');
        setCurrentStep(4)
    }
};

  const handleFinalQuantityChange = (e) => {
    setEnteredQuantity(e.target.value); // Обновляем введенное значение
  };

  const hanleNewBarcode = (item) => {
    setFoundPosition(item)
    setFoundPosition(prevState => ({
      ...prevState,
      newbarcode: barcode,
      error_barcodeL: true,
    }));
    setCurrentStep(3)

  }

  const handleSubmit = useCallback(async () => {
    // Вычисляем новое значение final_quantity
    const sumcol = Number(foundPosition.final_quantity) + Number(enteredQuantity);
    console.log("Обновленное final_quantity:", sumcol);
    setCurrentStep(0)
    // Обновляем состояние с использованием предыдущего значения
    setFoundPosition(prevState => {
      const updatedPosition = { ...prevState, final_quantity: sumcol };
      console.log("Updated foundPosition:", updatedPosition);
      return updatedPosition;
    });
  
    // Формируем запрос для API
    const scanRequest = {
      add_number: apiData[0]?.add_number,
      add_date: apiData[0]?.add_date,
      counterparty: apiData[0]?.counterparty,
      warehouse: apiData[0]?.warehouse,
      progress: "В работе",
      positionData: [{ ...foundPosition, final_quantity: sumcol }] // Используем обновленное значение для запроса
    };
    console.log(scanRequest);
  
    // Отправка запроса

    try {
      const scanResponse = await api.post('/api/addproducts/', scanRequest);
      console.log(scanResponse);
        try {
          const loadResponse = await api.get(`/api/addproducts/?add_number=${numberAcceptance}`)
          setPositions(loadResponse.data);
          setApiData(loadResponse.data)
          setCurrentStep(2); // Только после успешной загрузки переходим к шагу 2
        } catch (error) {
          setError(`Ошибка загрузки приемки: ${error.message || error}`);
        }
      console.log("200");
      setBarcode('');
      setFoundPosition(null);
      setEnteredQuantity('');
      setCurrentStep(5);

      setTimeout(() => {
        setCurrentStep(2);
      }, 2000);
    }catch (err) {
      setError(`Данные не отправлены по причине: ${err.message || err}`);
      setCurrentStep(-2)
      console.log(barcode, foundPosition, enteredQuantity)
    }
    
  }, [foundPosition, enteredQuantity, apiData]); // Добавляем зависимости

  const newTry = async () => {
    try {
      const loadResponse = await api.get(`/api/addproducts/?add_number=${numberAcceptance}`)
      setPositions(loadResponse.data);
      setApiData(loadResponse.data)
      setCurrentStep(2); // Только после успешной загрузки переходим к шагу 2
    } catch (error) {
      setError(`Ошибка загрузки приемки: ${error.message || error}`);
    }
    setBarcode('');
    setFoundPosition(null);
    setEnteredQuantity('');
    setCurrentStep(2);

  }
  

  return (

    <TSDLayout>
      <div className="container">
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
                        <button className='buttonCompl' onClick={newTry}>Повторно отсканировать товар</button>
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
        {curretStep === 1  && (
          <div className="scan-section">
            <h2>Сканируйте номер приемки</h2>
            <input className="scan-input" onInput= {handleAcceptanceScan} autoFocus inputMode="none"/>
          </div>
          )}

        {/* Шаг второй установка баркода товара  */}
        {curretStep === 2 && (
          <div className="scan-section">
            <h2>Сканируйте баркод товара</h2>
            <input
              className="scan-input"
              onInput= {handleBarcodeScan}
              autoFocus
              inputMode="none"
            /> 
            {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
          )}

        {/* Шаг третий вывод позиции и установка кол-ва  */}
        {curretStep === 3 && (
            <div>
              <h3>Найдена позиция:</h3>
              <div className="position-info">
                <p className='mainText'>{foundPosition.name}</p>
                <div className='blockInfo'>
                  <p className='supText'>Артикул: </p>
                  <p className='mainText'>{foundPosition.article}</p>
                </div>
                <div className='blockInfo'>
                  <p className='supText'>К приемке:</p>
                  <p className='mainText'>{foundPosition.quantity - foundPosition.final_quantity} шт.</p>
                </div>
                <div className="quantity-input">   
                  <label className='mainText'>Введите кол-во:</label>
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

        {/* Шаг четвертый выбор позиции при не соответствии баркода  */}
        {curretStep === 4 && (
            <div>
              <h3>Штрихкод не найден выберите позицию вручную:</h3>
              <div> 
              {positions.map((position, idx) => (
                      <div key={idx} className="position-item">
                        {position.positionData?.map((item, i) => (
                          <div 
                            key={i} 
                            className="position-info" 
                            onClick={() => hanleNewBarcode(item)} // Обновляем состояние с выбранной позицией
                          >
                            <p className='mainText'>{item.name}</p>
                            <div className='blockInfo'>
                              <p className='supText'>Артикул: </p>
                              <p className='mainText'>{item.article}</p>
                            </div>
                            <div className='blockInfo'>
                              <p className='supText'>К приемке:</p>
                              <p className='mainText'>{item.barcode}</p>
                            </div>
                          </div>
                        ))}
                      </div>
              ))}
              </div>
            </div>  
          )}
      </div>
    </TSDLayout>
  );
};



export default TSDScanProduct;