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
import TSDSerchProduct from './components/TSDSerchProduct';
import TSDTest from './components/TSDTest';
import TSDSerchPlace from './components/TSDSerchPlace';
import TSDChangePlace from './components/TSDChangePlace';


const App = () => {
    return (
            <Routes>
                <Route path="/" element={<Home />} />

                <Route path="/operations" element={<Operations />} /> {/* информация о реализации товара  */}
                    <Route path="/shipment/:id" element={<ShipmentDetails />} /> {/* информация о деталях реализации товара  */}             
                
                <Route path="/add-product-list" element={<AddProductList />} /> {/* информация о приходе товара  */}   
                    <Route path="/add-product/:id" element={<AddProductDetails />} /> {/* информация о деталях приходе товара  */}  
 
                <Route path="/products" element={<ProductList />} />
                <Route path="/search" element={<Search />} />

                <Route path="/TSDmenu" element={<TSDMenu />} /> {/* главное меню ТСД  */}
                    <Route path="/add-product" element={<TSDReceivingComponent />} /> {/* Оприходование  */}
                        <Route path="/add-product/scan" element={<TSDScanProduct />} /> {/* Сверка кол-ва  */}
                        <Route path="/add-product/place" element={<TSDPlaceProduct />} /> {/* Присваение места  */}
                    <Route path="/change-place-tsd" element={<TSDChangePlace />} /> {/* перемещение товара (изменение ячейки)  */}
                    <Route path="/info-place-tsd" element={<TSDSerchPlace />} /> {/* информация о товаре в ячейке  */}
                    <Route path="/info-product-tsd" element={<TSDSerchProduct />} /> {/* информация о товаре в ячейках  */}
                    <Route path="/ship-info-tsd" element={<TSDMenu />} /> {/* отгрузка товара  */}
                    <Route path="/invent-product-tsd" element={<TSDMenu />} /> {/* инвентаризация товара  */}
                    <Route path="/test-tsd" element={<TSDTest />} /> {/* инвентаризация товара  */}                   




                
                
            </Routes>
    );
};

export default App;
