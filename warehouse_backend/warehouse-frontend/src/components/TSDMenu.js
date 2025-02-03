import React from 'react';
import { Link } from 'react-router-dom';


const TSDMenu = () => {

  return (
    <div className="menu-container">
      <h2>Выберете операцию</h2>
      <div className="content">
        <Link to="/add-product"><button className='buttonMenu'>Оприходование</button></Link>
        <button className='buttonMenu'>Отгрузка(в разработке)</button>
        <button className='buttonMenu'>Перемещение(в разработке)</button>
        <button className='buttonMenu'>Информация о ячейке(в разработке)</button>
      </div>
    </div>
  );
};

export default TSDMenu;