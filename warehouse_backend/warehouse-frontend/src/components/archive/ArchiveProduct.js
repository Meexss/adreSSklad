import React, { useEffect, useState } from "react";
import Layout from "../Layout";
import api from '../api'; // Импортируешь созданный файл


const ArchiveProduct = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try{
                const res = await api.get("/api/archiveProd/")

                setProducts(res.data);
                setLoading(false);
           
            } catch (error)  {
                console.error(error);
                setError("Ошибка загрузки данных");
                setLoading(false);
            }
            finally {
                setLoading(false);
            }}

            fetchData()
            const interval = setInterval(fetchData, 60000);

            // Очистка интервала при размонтировании компонента
            return () => clearInterval(interval);     
    
         }, []);

    return (
        <Layout>
            <div>
                <h2>Архив товаров</h2>
                {loading ? (
                        <div className='loaderWrap'>
                            <span className="loader"></span>
                        </div>
                ) : error ? (
                    <div className='loaderWrap'>
                    <p style={{ color: 'red' }}>{error}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Артикул</th>
                                    <th>Наименование</th>
                                    <th>Количество</th>
                                    <th>Дата прихода</th>
                                    <th>Место хранения</th>
                                    <th>Статус товара</th>
                                    <th>Штрихкод</th>
                                    <th>Дата архивации</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.unique_id}>
                                        <td>{product.article}</td>
                                        <td style={{ textAlign: "left" }}>{product.name}</td>
                                        <td>{product.quantity}</td>
                                        <td>{product.add_date}</td>
                                        <td>{product.place}</td>
                                        <td>{product.goods_status}</td>
                                        <td>{product.barcode}</td>
                                        <td>{product.close_product_date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ArchiveProduct;
