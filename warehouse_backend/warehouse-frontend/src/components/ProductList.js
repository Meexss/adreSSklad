import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

const ProductList = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        axios.get('http://127.0.0.1:8000/api/products/')
            .then(response => setProducts(response.data))
            .catch(error => console.error(error));
    }, []);

    return (
        <Layout>
        <div>
            <h2>Список товаров</h2>
            <div>
            <table >
                    <thead >
                        <tr >
                            <th >Артикул</th>
                            <th >Наименование</th>
                            <th >Количество</th>
                            <th >Место хранения</th>
                            <th >Статус товара</th>
                            <th >Штрихкод</th>
                        </tr>
                    </thead>
                    <tbody>
                {products.map(product => (
                    <tr key={product.article}>
                                <td >{product.article}</td>
                                <td style={{ textAlign: 'left'}} >{product.name}</td>
                                <td >{product.quantity}</td>
                                <td >{product.place}</td>
                                <td >{product.goods_status}</td>
                                <td >{product.barcode}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
        </div>
        </Layout>
    );
};

export default ProductList;