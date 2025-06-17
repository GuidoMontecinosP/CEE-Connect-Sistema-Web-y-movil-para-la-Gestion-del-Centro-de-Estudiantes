import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ConfigProvider, theme } from 'antd';

import App from './App.jsx'
import './global.css';

createRoot(document.getElementById('root')).render(
  <ConfigProvider
  theme={{
    //algorithm: theme.darkAlgorithm,
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
  <StrictMode>
    <App />
  </StrictMode>,
  </ConfigProvider>
)
