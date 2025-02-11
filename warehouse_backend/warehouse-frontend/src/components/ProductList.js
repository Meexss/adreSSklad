import React, { useEffect, useState } from "react";
import Layout from "./Layout";
import api from './api'; // Импортируешь созданный файл


const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // const api = useMemo(
    //     () =>
    //         axios.create({
    //             baseURL: "http://127.0.0.1:8000",
    //         }),
    //     []
    // );

    useEffect(() => {
        api.get("/api/products/")
            .then((response) => {
                setProducts(response.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setError("Ошибка загрузки данных");
                setLoading(false);
            });
    }, []);

    return (
        <Layout>
            <div>
                <h2>Список товаров</h2>
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
                        <table >
                            <thead >
                                <tr>
                                    <th>Артикул</th>
                                    <th>Наименование</th>
                                    <th>Количество</th>
                                    <th>Место хранения</th>
                                    <th>Статус товара</th>
                                    <th>Штрихкод</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product.article}>
                                        <td>{product.article}</td>
                                        <td style={{ textAlign: "left" }}>{product.name}</td>
                                        <td>{product.quantity}</td>
                                        <td>{product.place}</td>
                                        <td>{product.goods_status}</td>
                                        <td>{product.barcode}</td>
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

export default ProductList;
