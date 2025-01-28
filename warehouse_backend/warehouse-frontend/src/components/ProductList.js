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
            <h1>Список товаров</h1>
            <ul>
                {products.map(product => (
                    <li key={product.article}>
                        {product.article} - {product.name} - {product.quantity} - {product.cell} - {product.sector}
                    </li>
                ))}
            </ul>
        </div>
        </Layout>
    );
};

export default ProductList;