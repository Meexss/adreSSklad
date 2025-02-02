import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Operations from './components/Operations';
import ProductList from './components/ProductList';
import TSDReceivingComponent from './components/TSDReceivingComponent';
import Search from './components/Search';
import Home from './components/Home'; // Импортируем главную страницу
import ShipmentDetails from './components/ShipmentDetails';
import AddProductList from './components/AddProductList';
import AddProductDetails from './components/AddProductDetails';
import TSDScanProduct from './components/TSDScanProduct';
import TSDPlaceProduct from './components/TSDPlaceProduct';
import TSDMenu from './components/TSDMenu';

const App = () => {
    return (
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/operations" element={<Operations />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/add-product" element={<TSDReceivingComponent />} />
                <Route path="/add-product/scan" element={<TSDScanProduct />} />
                <Route path="/add-product/place" element={<TSDPlaceProduct />} />
                <Route path="/add-product-list" element={<AddProductList />} />
                <Route path="/search" element={<Search />} />
                <Route path="/shipment/:id" element={<ShipmentDetails />} />
                <Route path="/add-product/:id" element={<AddProductDetails />} />
                <Route path="/TSDmenu" element={<TSDMenu />} />
            </Routes>
    );
};

export default App;
