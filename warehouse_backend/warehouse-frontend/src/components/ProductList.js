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
                {products.map(product => (
                    <tr
                                key={product.article}
                                style={{
                                    border: '1px solid #ddd',
                                    backgroundColor: '#fff',
                                    transition: 'background-color 0.2s ease',
                                    
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                            >
                    
                                <td style={{ border: '1px solid #ddd',padding: '8px', textAlign: 'center' }}>{product.article}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px', textAlign: 'left' }}>{product.name}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px', textAlign: 'center' }}>{product.quantity}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px', textAlign: 'center' }}>{product.sector}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px', textAlign: 'center' }}>{product.cell}</td>
                                <td style={{ border: '1px solid #ddd',padding: '8px', textAlign: 'center' }}>{product.zone}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
        </div>
        </Layout>
    );
};

export default ProductList;