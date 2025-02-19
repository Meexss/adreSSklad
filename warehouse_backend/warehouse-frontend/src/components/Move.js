import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import api from './api'; // Импортируешь созданный файл


const Move = () => {
    const [moveList, setMoveList] = useState([])

    useEffect(() => {

        const fetchData = async () => {
            try{
                const res = await api.get('/api/moveData/')
                setMoveList(res.data);  
            } catch (error) {
                console.error("Ошибка запроса:", error);
               

            }}

            fetchData()
            const interval = setInterval(fetchData, 60000);

            // Очистка интервала при размонтировании компонента
            return () => clearInterval(interval);     

    }, [api]);

    return (
        <Layout>
            <div >
                <h2>Перемещение/Размещение</h2>
                <div className="table-container">
                    <table>
                        <thead>
                            <th>Номер перемещения</th>
                            <th>Артикул</th>
                            <th >Наименование</th>
                            <th>Штрихкод</th>
                            <th>Место</th>
                            <th>Кол-во</th>
                            <th>Статус товара</th>
                            <th>Новое место</th>
                        </thead>
                        <tbody>
                            {moveList.map((item, index) => (
                                    <tr key={index}>
                                        {index !== 0 && (
                                            <>
                                <td>{item.moveNumber}</td>
                                <td>{item.article}</td>
                                <td className='text-left'>{item.name}</td>
                                <td>{item.barcode}</td>
                                <td>{item.place}</td>
                                <td>{item.quantity}</td>
                                <td>{item.goods_status}</td>
                                <td>{item.newPlace}</td>
                                            </>
                                        )}


                                    </tr>
                    
                            ))
                            }
                            
                        </tbody>
                        
                    </table>  
                </div>     
            </div>
        </Layout>
    );
};

export default Move;