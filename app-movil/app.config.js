import 'dotenv/config';

export default {
  expo: {
    name: 'app-movil',
    slug: 'app-movil',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    ios: {
      supportsTablet: true
    },
    plugins: [
      './plugins/network-security'
    ],
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      usesCleartextTraffic: true,
      edgeToEdgeEnabled: true,
      package: 'com.ceeconnect.votos'
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      eas: {
        projectId: '1ac9920b-1a97-485a-9a6f-c33b683640b3'
      }
    },
    owner: 'manu22sg'
  }
};
