import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TSDReceivingComponent = () => {
  const [positions, setPositions] = useState([]);
  const [dataAdd, setDataAdd] = useState([]);
  const [acceptanceNumber, setAcceptanceNumber] = useState('');
  const [currentStep, setCurrentStep] = useState('enter_number');
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [inputPlace, setInputPlace] = useState('');
  const [inputQuantity, setInputQuantity] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/api/addproducts/')
      .then(response => setPositions(response.data))
      .catch(error => console.error('Ошибка загрузки данных:', error));
  }, []);

  const handleAcceptanceScan = (e) => {
    setAcceptanceNumber(e.target.value);
    const foundItems = positions.filter(item => item.add_number === e.target.value);

    if (foundItems.length > 0) {
      setDataAdd(foundItems);
      setCurrentStep('processing');
      setErrorMessage('');
    } else {
      setErrorMessage('Номер приемки не найден');
    }
  };

  const handleConfirm = () => {
    if (!inputPlace || !inputQuantity) {
      setErrorMessage('Заполните все поля');
      return;
    }

    const updatedPositions = [...dataAdd];
    updatedPositions[currentPositionIndex] = {
      ...updatedPositions[currentPositionIndex],
      place: inputPlace,
      receivedQuantity: inputQuantity,
    };
    setDataAdd(updatedPositions);

    setInputPlace('');
    setInputQuantity('');
    setErrorMessage('');

    if (currentPositionIndex < dataAdd.length - 1) {
      setCurrentPositionIndex(currentPositionIndex + 1);
    } else {
      setCurrentStep('completed');
    }
  };

//1 шаг, сканим номер приемки, 2 шаг сканим баркод 3 шаг ищем по баркоду позицию в списке 4 шаг выводим артикул, наименование и кол-во, 
// 5 шаг баркод не найден, выбираем из списка позиций артикул и добавляем в API ошибку баркода и вводим кол-во 6 шаг отправляем по API данные 7 шаг заново сканируем баркод... Сделать кнопку в меню
// компонент 2 присваивание места 1 шаг загружаем со второй базы данные о приемке, 2 шаг сканим баркод, 3 шаг сканим место хранения, 4 шаг вписываем кол-во 5 шаг повторно сканируем баркож


  return (
    <div className="tsd-container">
      {currentStep === 'enter_number' && (
        <div className="scan-section">
          <h2>Сканируйте номер приемки</h2>
          <input
            type="text"
            value={acceptanceNumber}
            onChange={handleAcceptanceScan}
            autoFocus
            className="scan-input"
          />
          {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
      )}

      {currentStep === 'processing' && dataAdd[currentPositionIndex] && (
        <div className="position-section">
          <div className="position-info">
            <h3>Позиция {currentPositionIndex + 1} из {dataAdd.length}</h3>
            <p>Артикул: {dataAdd[currentPositionIndex].article}</p>
            <p>Наименование: {dataAdd[currentPositionIndex].name}</p>
            <p>Ожидаемое количество: {dataAdd[currentPositionIndex].quantity}</p>
          </div>

          <div className="input-group">
            <label>Место хранения:</label>
            <input
              type="text"
              value={inputPlace}
              onChange={(e) => setInputPlace(e.target.value)}
              autoFocus
              className="tsd-input"
            />
          </div>

          <div className="input-group">
            <label>Количество:</label>
            <input
              type="number"
              value={inputQuantity}
              onChange={(e) => setInputQuantity(e.target.value)}
              className="tsd-input"
            />
          </div>

          <button onClick={handleConfirm} className="confirm-button">
            Подтвердить (Enter)
          </button>

          {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
      )}

      {currentStep === 'completed' && (
        <div className="completed-section">
          <h2>Приемка завершена!</h2>
          <p>Все позиции успешно обработаны</p>
          <button onClick={() => {
            setCurrentStep('enter_number');
            setAcceptanceNumber('');
            setDataAdd([]);
            setCurrentPositionIndex(0);
          }}>
            Начать заново
          </button>
        </div>
      )}
    </div>
  );
};

export default TSDReceivingComponent;
