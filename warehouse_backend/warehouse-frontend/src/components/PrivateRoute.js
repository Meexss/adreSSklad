import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, getRefreshToken, setAccessToken } from "./auth"; // импортируем функции для получения и установки токенов
import axios from "axios";

const PrivateRoute = ({ element: Component, isAuthenticated, ...rest }) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [accessToken, setAccessTokenState] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      let token = getAccessToken();
      if (!token) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            // Пытаемся обновить токен
            const response = await axios.post("https://adressklad.onrender.com/api/token/refresh/", {
              refresh: refreshToken,
            });
            token = response.data.access;
            setAccessTokenState(token);
            setAccessToken(token); // сохраняем новый токен
          } catch (error) {
            token = null; // если ошибка, оставляем null
          }
        }
      } else {
        setAccessTokenState(token);
      }
      setIsAuthChecked(true); // Завершаем проверку авторизации
    };

    fetchToken();
  }, []);

  if (!isAuthChecked) {
    return <div>Loading...</div>;
  }

  if (!accessToken && !isAuthenticated) {
    // Если нет токена и пользователь не авторизован, перенаправляем на страницу входа
    return <Navigate to="/login" />;
  }

  // Если токен есть или пользователь авторизован, отображаем компонент
  return <Component {...rest} />;
};

export default PrivateRoute;
