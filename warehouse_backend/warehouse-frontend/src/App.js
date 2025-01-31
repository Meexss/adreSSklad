import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Operations from './components/Operations';
import ProductList from './components/ProductList';
import TSDReceivingComponent from './components/TSDReceivingComponent';
import Search from './components/Search';
import Home from './components/Home'; // Импортируем главную страницу
import ShipmentDetails from './components/ShipmentDetails';
import AddProductList from './components/AddProductList';
import AddProductDetails from './components/AddProductDetails';

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/operations" element={<Operations />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/add-product" element={<TSDReceivingComponent />} />
                <Route path="/add-product-list" element={<AddProductList />} />
                <Route path="/search" element={<Search />} />
                <Route path="/shipment/:id" element={<ShipmentDetails />} />
                <Route path="/add-product/:id" element={<AddProductDetails />} />
            </Routes>
        </Router>
    );
};

export default App;
