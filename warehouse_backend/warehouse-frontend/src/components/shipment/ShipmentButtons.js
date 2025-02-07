import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPrint } from '@fortawesome/free-solid-svg-icons';

const ShipmentButtons = ({ handleReserveAll, handleMassCancelReservation, showReservedData, handlePrint }) => (
    <div>
        <Link to="/operations">
            <FontAwesomeIcon icon={faArrowLeft} /> Назад
        </Link>
        
        <button onClick={handlePrint}>
            <FontAwesomeIcon icon={faPrint} /> Печать
        </button>

        {!showReservedData && (
            <button onClick={handleReserveAll} style={{ backgroundColor: 'green' }}>
                Зарезервировать все товары
            </button>
        )}
        {showReservedData && (
            <button onClick={handleMassCancelReservation} style={{ backgroundColor: 'red' }}>
                Отменить резервирование
            </button>
        )}
    </div>
);

export default ShipmentButtons;
