import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import 'antd/dist/reset.css';
import { ConfigProvider, theme } from 'antd';
import App from './App';
import './global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          colorSuccess: '#52c41a',
          colorError: '#ff4d4f',
          colorWarning: '#faad14',
          colorInfo: '#1677ff',
        },
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>
);