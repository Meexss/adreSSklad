import React, { useRef } from 'react';
import { useLocation } from 'react-router-dom';
// import ReactToPrint from 'react-to-print';
import Layout from './Layout';

const ShipmentDetails = () => {
    const location = useLocation();
    const { shipment } = location.state || {};
    const shipmentRef = useRef(); // Ссылка для компонента, который будем печатать

    if (!shipment) {
        return <h2>Данные об отгрузке отсутствуют</h2>;
    }

    return (
        <Layout>
            <div style={{ padding: '20px' }} ref={shipmentRef}>
                <h1>Детали отгрузки</h1>
                <p><strong>Номер отгрузки:</strong> {shipment.shipment_number}</p>
                <p><strong>Дата:</strong> {shipment.shipment_date}</p>
                <p><strong>Контрагент:</strong> {shipment.counterparty}</p>
                <p><strong>Склад:</strong> {shipment.warehouse}</p>
                <p><strong>Статус:</strong> {shipment.progress}</p>
                
                <button>Зарезервировать товар</button>
                <br></br>
                <br></br>
                <button>Печать отборочника</button>
                <br></br>
                <br></br>
                <button>Закрыть отгрузку</button>
                <h3>Список товаров:</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Артикул</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Наименование</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Количество</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Сектор товара</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ячейка товара</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Зона</th>
                        </tr>
                    </thead>
                    <tbody>
                        {shipment.stocks.map((stock, index) => (
                            <tr key={index}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.article}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.name}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{stock.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Кнопка для печати */}
                    {/* <ReactToPrint
    trigger={() => <button>Печать</button>}
    content={() => shipmentRef.current}
    onAfterPrint={() => console.log("Печать завершена!")}
    /> */}
            </div>
        </Layout>
    );
};

export default ShipmentDetails;
