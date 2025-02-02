import React, { useState } from 'react';
import axios from 'axios';
import Layout from './Layout';

const Search = () => {
    const [article, setArticle] = useState("");
    const [products, setProducts] = useState([]); // Данные теперь массив
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [errors, setErros] = useState('')

    const handleSearch = () => {
        axios
            .get(`http://127.0.0.1:8000/api/products/`)
            .then((response) => {
                setProducts(response.data);

                // Фильтруем нужные товары
                const foundProducts = response.data.filter((item) => item.article === article);
                setFilteredProducts(foundProducts);
            })
            .catch((error) => setErros(error));
    };
    console.log(products)
    console.log(filteredProducts)
    return (
                <Layout>
                <div>
                    <h2>Поиск</h2>
                        <input
                            type="text"
                            id="enter-text"
                            value={article}
                            placeholder='введите артикул'
                            onChange={(e) => setArticle(e.target.value)}
                        />
                    <button class='search-button' onClick={handleSearch}>Найти</button>
                    
                    {filteredProducts.length > 0 ? (
                        <table >
                            <thead>
                                <tr >
                                    <th >Артикул</th>
                                    <th >Наименование</th>
                                    <th >Количество</th>
                                    <th >Место товара</th>
                                    <th >Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((item, index) => (
                                    <tr key={index} >
                                        <td >{item.article}</td>
                                        <td style={{ textAlign: 'left'}}>{item.name}</td>
                                        <td >{item.quantity}</td>
                                        <td >{item.place}</td>
                                        <td >{item.goods_status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>{errors}</p>
                    )}
                </div>
            </Layout>
    );
};

export default Search;