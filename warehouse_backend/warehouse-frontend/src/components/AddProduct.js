import React, { useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        article: '',
        name: '',
        quantity: 0,
        cell: '',
        sector: '',
        status: '',
        zone: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://127.0.0.1:8000/api/products/', formData)
            .then(response => console.log(response.data))
            .catch(error => console.error(error));
    };

    return (
        <Layout>
        <div>
            <h1>Оприходование ТСД</h1>
            <form onSubmit={handleSubmit}>
                <input type="text" name="article" placeholder="Артикул" onChange={handleChange} />
                <input type="text" name="name" placeholder="Наименование" onChange={handleChange} />
                <input type="number" name="quantity" placeholder="Количество" onChange={handleChange} />
                <input type="text" name="cell" placeholder="Ячейка" onChange={handleChange} />
                <input type="text" name="sector" placeholder="Сектор" onChange={handleChange} />
                <input type="text" name="status" placeholder="Статус" onChange={handleChange} />
                <input type="text" name="zone" placeholder="Зона" onChange={handleChange} />
                <button type="submit">Добавить</button>
            </form>
        </div>
        </Layout>
    );
};

export default AddProduct;