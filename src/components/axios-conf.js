// axios-conf.js
import axios from 'axios';
import { API_BASE } from './Api_base';

const api = axios.create({
    baseURL: API_BASE, // URL backend
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
    },
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Xử lý 304 Not Modified như success
        if (error.response && error.response.status === 304) {
            return Promise.resolve({
                data: error.response.data,
                status: 304,
                statusText: 'Not Modified',
                headers: error.response.headers,
                config: error.config,
                request: error.request,
            });
        }

        if (error.response && error.response.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    },
);

export default api;
