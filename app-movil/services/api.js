import axios from 'axios';

const instance = axios.create({ 
  // baseURL:process.env.EXPO_PUBLIC_API_URL,
  baseURL: 'http://192.168.150.170:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
