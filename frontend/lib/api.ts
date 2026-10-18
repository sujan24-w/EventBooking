import axios from 'axios';
//process.env.NEXT_PUBLIC_API_URL
const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;