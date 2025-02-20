import React from 'react';
import { Link } from 'react-router-dom';
import TSDLayout from './TSDLayout';

const TSDWrapeMove = () => {

  return (
    <TSDLayout>

       <Link to="/TSDmenu"><button className='buttonBack'>Назад</button></Link>

        <h2>Выберите действие:</h2>
        <div className="content">
          <Link className='buttonMenu' to="/change-place-tsd"><p>Ручное перемещение товара</p></Link>
          <Link className='buttonMenu' to="/moveMain"><p>Расстановка товара из Сборки</p></Link>
        </div>
    </TSDLayout>
  );
};

export default TSDWrapeMove;