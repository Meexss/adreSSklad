import React, {useState} from 'react';
import { Link } from 'react-router-dom';


const TSDReceivingApp = () => {

  return (
    <div className="app-container">
       <Link to="/TSDmenu"><button className='buttonBack'>Назад</button></Link>
      <h2>Выберите действие</h2>
      
        <Link to="/add-product/scan"><button className='buttonMenu'>Приемка товара ТСД</button></Link>
        <Link to="/add-product/place"><button claclassNamess='buttonMenu'>Расстановка товара ТСД</button></Link>
    </div>
  );
};

export default TSDReceivingApp;