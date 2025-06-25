import axios from 'axios';

const instance = axios.create({ 
  // baseURL:process.env.EXPO_PUBLIC_API_URL,
  baseURL: 'http://192.168.150.170:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);

// // Agrega interceptores para debugging
// instance.interceptors.request.use(
//   (config) => {
//     console.log('📤 Request:', config.method?.toUpperCase(), config.url);
//     console.log('📤 Full URL:', config.baseURL + config.url);
//     console.log('📤 Headers:', config.headers);
//     return config;
//   },
//   (error) => {
//     console.error('❌ Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// instance.interceptors.response.use(
//   (response) => {
//     console.log('✅ Response:', response.status, response.config.url);
//     console.log('✅ Data:', response.data);
//     return response;
//   },
//   (error) => {
//     console.error('❌ Response Error:', error.message);
//     console.error('❌ Error code:', error.code);
//     console.error('❌ Error config:', error.config);
//     if (error.response) {
//       console.error('❌ Response status:', error.response.status);
//       console.error('❌ Response data:', error.response.data);
//     }
//     return Promise.reject(error);
//   }
// );

// Función de prueba - agrégala temporalmente
export const testConnection = async () => {
  try {
    console.log('🔍 Testing connection...');
    const response = await instance.get('/'); // Prueba la raíz primero
    console.log('🔍 Root connection successful');
    return response;
  } catch (error) {
    console.error('🔍 Test connection failed:', error.message);
    throw error;
  }
};

export default instance; 