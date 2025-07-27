import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext, AuthProvider } from "./context/Authcontext";

// Screens existentes
import HomeScreen from './screens/Home';
import CrearAnuncio from './screens/CrearAnuncio';
import EditarAnuncio from './screens/EditarAnuncio';
import WebViewScreen from './screens/WebViewScreen';
import Eventos from './screens/Eventos';
import CrearEvento from './screens/CrearEvento';
import EditarEvento from './screens/EditarEvento';
import ListaVotaciones from './screens/ListaVotaciones';
import CrearVotacion from './screens/CrearVotacion';
import EmitirVoto from './screens/EmitirVoto';
import Resultados from './screens/Resultados';
import DetalleVotacion from './screens/DetalleVotacion';
import ListaSugerencias from './screens/ListaSugerencias';
import CrearSugerencia from './screens/CrearSugerencia';
import EditarSugerencia from './screens/EditarSugerencia';
import MisSugerencias from './screens/MisSugerencias';

// Screens de autenticación
import LoginScreen from './screens/LoginScreen';
import Registro from './screens/Registro';

// NUEVA SCREEN: Dashboard/Perfil
import Dashboard from './screens/Dashboard'; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator(); // NUEVO: Stack principal

// Componente del Header personalizado
function CustomHeader({ navigation, userInfo }) {
  return (
    <View style={styles.customHeader}>
      <View style={styles.headerLeft}>
        {/* Logo o título de la app */}
        <Text style={styles.appTitle}>Mi App</Text>
      </View>
      
      <View style={styles.headerRight}>
        {/* Botón del perfil/dashboard */}
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Dashboard')}
        >
          {userInfo?.avatar ? (
            <Image 
              source={{ uri: userInfo.avatar }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.defaultAvatar}>
              <Ionicons name="person" size={20} color="#1e3a8a" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Stack de Anuncios
function AnunciosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListaAnuncios" component={HomeScreen} />
      <Stack.Screen name="CrearAnuncio" component={CrearAnuncio} />
    </Stack.Navigator>
  );
}

// Stack de Votaciones
function VotacionesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListaVotaciones" component={ListaVotaciones} />
      <Stack.Screen name="CrearVotacion" component={CrearVotacion} />
      <Stack.Screen name="Detalle" component={DetalleVotacion} />
      <Stack.Screen name="Votar" component={EmitirVoto} />
      <Stack.Screen name="Resultados" component={Resultados} />
    </Stack.Navigator>
  );
}

// Stack de Eventos
function EventosStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Eventos" component={Eventos} />
      <Stack.Screen name="CrearEvento" component={CrearEvento} />
      <Stack.Screen name="EditarEvento" component={EditarEvento} />
    </Stack.Navigator>
  );
}

// Stack de Sugerencias
function SugerenciasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListaSugerencias" component={ListaSugerencias} />
      <Stack.Screen name="CrearSugerencia" component={CrearSugerencia} />
      <Stack.Screen name="MisSugerencias" component={MisSugerencias} />
      <Stack.Screen name="EditarSugerencia" component={EditarSugerencia} />
    </Stack.Navigator>
  );
}

// Tabs principales
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1e3a8a',
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Inicio') iconName = 'home';
          if (route.name === 'Votaciones') iconName = 'checkbox';
          if (route.name === 'Eventos') iconName = 'calendar';
          if (route.name === 'Sugerencias') iconName = 'bulb';
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Inicio" component={AnunciosStack} />
      <Tab.Screen name="Votaciones" component={VotacionesStack} />
      <Tab.Screen name="Eventos" component={EventosStack} />
      <Tab.Screen name="Sugerencias" component={SugerenciasStack} />
    </Tab.Navigator>
  );
}

// NUEVO: Stack principal con header personalizado
function MainStackNavigator() {
  const { userInfo } = useContext(AuthContext); // Asume que tienes userInfo en tu contexto

  return (
    <MainStack.Navigator
      screenOptions={({ navigation }) => ({
        header: () => <CustomHeader navigation={navigation} userInfo={userInfo} />,
      })}
    >
      <MainStack.Screen name="MainTabs" component={MainTabs} />
      <MainStack.Screen 
        name="Dashboard" 
        component={Dashboard}
        options={{
          // Puedes personalizar el header del dashboard si quieres
          headerTitle: 'Mi Perfil',
        }}
      />
      <MainStack.Screen name="WebViewScreen" component={WebViewScreen} />
      <MainStack.Screen name="CrearAnuncio" component={CrearAnuncio} />
      <MainStack.Screen name="EditarAnuncio" component={EditarAnuncio} />
      <MainStack.Screen name="ListaAnuncios" component={HomeScreen} />
    </MainStack.Navigator>
  );
}

// Stack de autenticación
function AuthNavigator() {
  return (
    <AuthStack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Registro" component={Registro} />
    </AuthStack.Navigator>
  );
}

// Navigator principal que decide qué mostrar
function AppNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null; 
  }

  return (
    <NavigationContainer>
      {userToken ? <MainStackNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

// Estilos del header
const styles = {
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 40, // Para el status bar
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  headerLeft: {
    flex: 1,
  },
  
  appTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a8a',
  },
  
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  profileButton: {
    padding: 4,
  },
  
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
  
  defaultAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1e3a8a',
  },
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}