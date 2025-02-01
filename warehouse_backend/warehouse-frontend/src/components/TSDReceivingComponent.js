import React, {useState} from 'react';
import TSDScanProduct from './TSDScanProduct';
import TSDPlaceProduct from './TSDPlaceProduct';


const TSDReceivingApp = () => {
  const [activeComponent, setActiveComponent] = useState(null);

  return (
    <div className="app-container">
      <h2>Выберите действие</h2>
      <div>
        <button onClick={() => setActiveComponent('place')}>Расстановка товара</button>
        <button onClick={() => setActiveComponent('scan')}>Приемка товара</button>
      </div>

      <div className="content">
        {activeComponent === 'place' && <TSDPlaceProduct />}
        {activeComponent === 'scan' && <TSDScanProduct />}
      </div>
    </div>
  );
};

export default TSDReceivingApp;