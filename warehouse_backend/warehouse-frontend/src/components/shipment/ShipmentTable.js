import React from 'react';

const ShipmentTable = ({ shipment, reservedData, showReservedData }) => (
    
    <table>
        <thead>
            <tr>
                <th>Артикул</th>
                <th>Наименование</th>
                <th>Количество общее</th>
                {showReservedData && (
                    <>
                        <th>Сумма резерва</th>
                        <th>Место Хранение</th>
                        <th>Кол-во к отбору</th>
                        <th>Статус</th>
                    </>
                )}
            </tr>
        </thead>
        <tbody>
            {shipment.items.map((stock, index) => {
                const reservedItems = reservedData.filter(item => item.article === stock.article);
                return reservedItems.length > 0 ? (
                    reservedItems.map((reservedItem, subIndex) => (
                        <tr key={subIndex}>
                            {subIndex === 0 && (
                                <>
                                    <td rowSpan={reservedItems.length}>{stock.article}</td>
                                    <td rowSpan={reservedItems.length}>{stock.name}</td>
                                    <td rowSpan={reservedItems.length}>{stock.quantity}</td>
                                </>
                            )}
                            <td>{reservedItem.quantity}</td>
                            <td>{reservedItem.place}</td>
                        </tr>
                    ))
                ) : (
                    <tr key={index}>
                        <td>{stock.article}</td>
                        <td>{stock.name}</td>
                        <td>{stock.quantity}</td>
                    </tr>
                );
            })}
        </tbody>
    </table>
);

export default ShipmentTable;
