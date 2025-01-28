import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Operations from './components/Operations';
import ProductList from './components/ProductList';
import AddProduct from './components/AddProduct';
import Search from './components/Search';
import Home from './components/Home'; // Импортируем главную страницу

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/operations" element={<Operations />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/search" element={<Search />} />
            </Routes>
        </Router>
    );
};

export default App;
