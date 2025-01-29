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
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f0f0f0' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Артикул</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Наименование</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Количество</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Ячейка товара</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Сектор товара</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Статус</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Зона</th>

                        </tr>
                    </thead>
                    <tbody>
                    <tr
                                style={{
                                    border: '1px solid #ddd',
                                    backgroundColor: '#fff',
                                    transition: 'background-color 0.2s ease',
                                    textAlign: 'center',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{product.article}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{product.name}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{product.quantity}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{product.cell}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{product.sector}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{product.status}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px' }}>{product.zone}</td>
                            </tr>
                            </tbody>
                </table>

                </div>
            )}
        </div>
        </Layout>
    );
};

export default Search;