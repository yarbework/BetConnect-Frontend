import axios from 'axios';

const getBaseURL = () => {
    if(import.meta.env.PROD){
        return import.meta.env.VITE_API_URL;
    }
    return '/api';
}

const API = axios.create({
    baseURL: getBaseURL(),
//     baseURL: `${BASE_URL}/api`
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');

    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }

    return req;
});

export default API;