import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/token/`, { username, password });
    const { access, refresh } = response.data;
    
    // Сохраняем токены в localStorage
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    console.log('успешный вход')
    return { success: true };
  } catch (error) {
    return { success: false, message: error.response?.data?.detail || "Ошибка входа" };
  }
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  console.log('выход')
};

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");

  
  // Функция для сохранения токена доступа
  export const setAccessToken = (token) => {
    localStorage.setItem("access_token", token);
  };