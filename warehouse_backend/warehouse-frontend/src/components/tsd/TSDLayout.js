import React from 'react';
import './TsdStyle.css';


const TSDLayout = ({ children }) => {

  return (
        <div className='app-container'>
            <div className="mainWrapperTSD">
                <h1 className='textMain'>Акватехнологии.Склад</h1>
            </div>
            <div className='children'>
                {children}
            </div>
        </div>
  );
};

export default TSDLayout;