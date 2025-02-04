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
    const value = e.target.value;
    console.log("Вводится значение:", value);
  
    if (value.length === 5) {
      setNumberAcceptance(value);
  
      try {
        await loadAcceptance(); // Дожидаемся загрузки данных
        setCurrentStep(2); // Только после успешной загрузки переходим к шагу 2
      } catch (error) {
        console.error("Ошибка загрузки приемки:", error);
        setError("Ошибка загрузки приемки");
      }
    }
  };


  // Загрузка данных приёмки
  const loadAcceptance = () => {
    console.log("Запрос на сервер с номером: ", numberAcceptance);
    api.get(`/api/addproducts/?add_number=${numberAcceptance}`)
      .then(res => {
        if (res.data.length === 0) throw new Error('Приёмка не найдена');
        setPositions(res.data);
        setApiData(res.data)
        setError('');
        console.log(res)
        console.log(res.data)
      })
      .catch(err => setError(err.message));
  };

  // Обработка сканирования баркода
  const handleBarcodeScan = (e) => {
    const code = e;
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
    const scanResponse = await api.post('/api/addproducts/', scanRequest);
    console.log(scanResponse);


  
    if (scanResponse.status === 201) {
      loadAcceptance()
      console.log("200");
      setBarcode('');
      setFoundPosition(null);
      setEnteredQuantity('');
      setCurrentStep(2);
    }
    
  }, [foundPosition, enteredQuantity, apiData]); // Добавляем зависимости
  

  return (

    <TSDLayout>
      <div className="container">
        <Link to="/add-product"><button class='buttonBack'>В меню</button></Link>
        
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
              value={barcode}
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
              <h3>Выберите позицию вручную:</h3>
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