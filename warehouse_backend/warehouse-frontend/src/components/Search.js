import React, { useState } from 'react';
import Layout from './Layout';
import api from './api'; // Импортируешь созданный файл


const Search = () => {
    const [article, setArticle] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // const api = useMemo(() => axios.create({
    //     baseURL: 'http://127.0.0.1:8000',
    // }), []);

    const handleSearch = () => {
        setLoading(true);
        setError(""); // Сбрасываем ошибку перед запросом

        api.get(`/api/products/`)
            .then((response) => {
                setProducts(response.data);
                const foundProducts = response.data.filter((item) => item.article === article);
                setFilteredProducts(foundProducts);
            })
            .catch((error) => {
                console.error("Ошибка запроса:", error);
                setError(`Ошибка: ${error.response?.data?.error || error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Layout>
            <div>
                <h2>Поиск</h2>
                <input
                    type="text"
                    id="enter-text"
                    value={article}
                    placeholder="Введите артикул"
                    onChange={(e) => setArticle(e.target.value)}
                />
                <button className="search-button" onClick={handleSearch} disabled={loading}>
                    {loading ? "Поиск..." : "Найти"}
                </button>

                {loading ? (
                        <div className='loaderWrap'>
                            <span className="loader"></span>
                        </div>
                ) : error ? (
                    <div className='loaderWrap'>
                    <p style={{ color: 'red' }}>{error}</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Артикул</th>
                                <th>Наименование</th>
                                <th>Количество</th>
                                <th>Место товара</th>
                                <th>Статус</th>
                                <th>Дата прихода</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.article}</td>
                                    <td style={{ textAlign: 'left' }}>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.place}</td>
                                    <td>{item.goods_status}</td>
                                    <td>{item.add_date}</td>

                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>Товар не найден</p>
                )}
            </div>
        </Layout>
    );
};

export default Search;
