import React from 'react';
import { Link } from 'react-router-dom';
import './TsdStyle.css';
import TSDLayout from './TSDLayout';


const TSDMenu = () => {

  return (
    <TSDLayout>
      <h3>Выберете операцию:</h3>
      <div className="content">
        <Link className='buttonMenu' to="/add-product"><p>Оприходование</p></Link>
        <Link className='buttonMenu' to="/TSDmenu"><p>Отгрузка(в разработке)</p></Link>
        <Link className='buttonMenu' to="/change-place-tsd"><p>Перемещение</p></Link>
        <Link className='buttonMenu' to="/info-place-tsd"><p>Информация о ячейке</p></Link>
        <Link className='buttonMenu' to="/info-product-tsd"><p>Информация о товаре</p></Link>
        <Link className='buttonMenu' to="/TSDmenu"><p>Инвентаризация(в разработке)</p></Link>
        <Link className='buttonMenu' to="/test-tsd"><p>Тест ТСД</p></Link>

      </div>
    </TSDLayout>
  );
};

export default TSDMenu;