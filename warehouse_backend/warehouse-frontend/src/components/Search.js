import React, { useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

const Search = () => {
    const [article, setArticle] = useState('');
    const [product, setProduct] = useState(null);

    const handleSearch = () => {
        axios.get(`http://127.0.0.1:8000/api/products/?article=${article}`)
            .then(response => setProduct(response.data[0]))
            .catch(error => console.error(error));
    };

    return (
        <Layout>
        <div>
            <h1>Поиск</h1>
            <input type="text" value={article} onChange={(e) => setArticle(e.target.value)} />
            <button onClick={handleSearch}>Найти</button>
            {product && (
                <div>
                    <p>Артикул: {product.article}</p>
                    <p>Наименование: {product.name}</p>
                    <p>Количество: {product.quantity}</p>
                    <p>Ячейка: {product.cell}</p>
                    <p>Сектор: {product.sector}</p>
                    <p>Статус: {product.status}</p>
                    <p>Зона: {product.zone}</p>
                </div>
            )}
        </div>
        </Layout>
    );
};

export default Search;