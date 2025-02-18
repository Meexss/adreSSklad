// src/utils/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
    // baseURL: 'http://192.168.31.245:8000',
    // baseURL: 'https://adressklad.onrender.com',
});


export default api;
