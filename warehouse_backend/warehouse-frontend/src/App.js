import React, { useState, useEffect } from "react";
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
import PrivateRoute from './components/PrivateRoute'; // Импортируем новый компонент
import Login from './components/Login'; // Импортируем новый компонент
import ArchiveShip from './components/ArchiveShip'; // Импортируем новый компонент
import ArchiveProduct from './components/ArchiveProduct'; // Импортируем новый компонент
import ArchiveAdd from './components/ArchiveAdd'; // Импортируем новый компонент

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Проверка состояния авторизации при загрузке страницы
    useEffect(() => {
        console.log(isAuthenticated)
        console.log(isAuthenticated)

        const token = localStorage.getItem('access_token');
        console.log(token)
        if (token) {
            console.log("успешная смена флага"            )
            setIsAuthenticated(true);
        }
    }, []);

    return (
        <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Приватные маршруты */}
        <Route
          path="/operations"
          element={<PrivateRoute element={Operations} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/shipment/:id"
          element={<PrivateRoute element={ShipmentDetails} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/add-product-list"
          element={<PrivateRoute element={AddProductList} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/add-product/:id"
          element={<PrivateRoute element={AddProductDetails} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/products"
          element={<PrivateRoute element={ProductList} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/search"
          element={<PrivateRoute element={Search} isAuthenticated={isAuthenticated} />}
        />

        {/* Меню ТСД и его маршруты */}
        <Route
          path="/TSDmenu"
          element={<PrivateRoute element={TSDMenu} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/add-product"
          element={<PrivateRoute element={TSDReceivingComponent} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/add-product/scan"
          element={<PrivateRoute element={TSDScanProduct} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/add-product/place"
          element={<PrivateRoute element={TSDPlaceProduct} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/change-place-tsd"
          element={<PrivateRoute element={TSDChangePlace} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/info-place-tsd"
          element={<PrivateRoute element={TSDSerchPlace} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/info-product-tsd"
          element={<PrivateRoute element={TSDSerchProduct} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/ship-info-tsd"
          element={<PrivateRoute element={TSDMenu} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/invent-product-tsd"
          element={<PrivateRoute element={TSDMenu} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/test-tsd"
          element={<PrivateRoute element={TSDTest} isAuthenticated={isAuthenticated} />}
        />

        {/* Архив */}
        <Route
          path="/archive-add"
          element={<PrivateRoute element={ArchiveAdd} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/archive-prod"
          element={<PrivateRoute element={ArchiveProduct} isAuthenticated={isAuthenticated} />}
        />
        <Route
          path="/archive-ship"
          element={<PrivateRoute element={ArchiveShip} isAuthenticated={isAuthenticated} />}
        />

        {/* Страница входа */}
        <Route
          path="/login"
          element={<Login setIsAuthenticated={setIsAuthenticated} />}
        />
      </Routes>
    );
};

export default App;
