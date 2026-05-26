import axios from 'axios';

const api = axios.create({
  // Lee la variable del archivo .env
  baseURL: import.meta.env.VITE_API_URL
           || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;