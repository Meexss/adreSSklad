import React from 'react';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';

const TSDReceivingApp = () => {

  return (
    <TSDLayout>

       <Link to="/TSDmenu"><button className='buttonBack'>Назад</button></Link>

        <h2>Выберите действие:</h2>
        <div className="content">
          <Link className='buttonMenu' to="/add-product/scan"><p>Приемка товара ТСД</p></Link>
          <Link className='buttonMenu' to="/add-product/place"><p>Расстановка товара ТСД</p></Link>
        </div>
    </TSDLayout>
  );
};

export default TSDReceivingApp;