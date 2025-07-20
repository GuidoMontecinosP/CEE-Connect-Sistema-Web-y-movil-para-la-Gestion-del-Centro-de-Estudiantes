import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext, AuthProvider } from "./context/Authcontext";

// Screens existentes
import HomeScreen from './screens/Home';
import Eventos from './screens/Eventos';
import ListaVotaciones from './screens/ListaVotaciones';
import CrearVotacion from './screens/CrearVotacion';
import EmitirVoto from './screens/EmitirVoto';
import Resultados from './screens/Resultados';
import DetalleVotacion from './screens/DetalleVotacion';
import ListaSugerencias from './screens/ListaSugerencias';
import CrearSugerencia from './screens/CrearSugerencia';

// Screens de autenticación
import LoginScreen from './screens/LoginScreen';
import Registro from './screens/Registro'; 

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Stack de Votaciones (sin cambios)
function VotacionesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListaVotaciones" component={ListaVotaciones} options={{ title: 'Votaciones' }} />
      <Stack.Screen name="CrearVotacion" component={CrearVotacion} options={{ title: 'Nueva Votación' }} />
      <Stack.Screen name="Detalle" component={DetalleVotacion} />
      <Stack.Screen name="Votar" component={EmitirVoto} />
      <Stack.Screen name="Resultados" component={Resultados} />
    </Stack.Navigator>
  );
}

// Stack de Eventos (sin cambios)
function EventosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Eventos" component={Eventos} />
    </Stack.Navigator>
  );
}
function SugerenciasStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListaSugerencias" component={ListaSugerencias} options={{ title: 'Sugerencias' }} />
      <Stack.Screen 
        name="CrearSugerencia" 
        component={CrearSugerencia} 
        options={{ 
          title: 'Nueva Sugerencia',
          headerShown: false // El componente maneja su propio header
        }} 
      />
    </Stack.Navigator>
  );
}

// Tabs principales cuando el usuario está autenticado (sin cambios)
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
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Votaciones" component={VotacionesStack} />
      <Tab.Screen name="Eventos" component={EventosStack} />
      <Tab.Screen name="Sugerencias" component={SugerenciasStack} />
    </Tab.Navigator>
  );
}

// NUEVO: Stack de autenticación que incluye Login y Register
function AuthNavigator() {
  return (
    <AuthStack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false, // Sin header para las pantallas de auth
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
    // Aquí puedes poner un componente de loading
    return null; 
  }

  return (
    <NavigationContainer>
      {userToken ? <MainTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}