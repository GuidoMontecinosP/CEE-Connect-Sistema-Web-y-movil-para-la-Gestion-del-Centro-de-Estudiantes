import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext, AuthProvider } from "./context/Authcontext";

import HomeScreen from './screens/Home';
import Eventos from './screens/Eventos';
import ListaVotaciones from './screens/ListaVotaciones';
import CrearVotacion from './screens/CrearVotacion';
import EmitirVoto from './screens/EmitirVoto';
import Resultados from './screens/Resultados';
import DetalleVotacion from './screens/DetalleVotacion';
import LoginScreen from './screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

function EventosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Eventos" component={Eventos} />
    </Stack.Navigator>
  );
}

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
          return <Ionicons name={iconName} size={size} color={color} />;
        }
      })}
    >
      <Tab.Screen name="Inicio" component={HomeScreen} />
      <Tab.Screen name="Votaciones" component={VotacionesStack} />
      <Tab.Screen name="Eventos" component={EventosStack} />
    </Tab.Navigator>
  );
}

// El switch entre login y navegación principal
function AppNavigator() {
  const { userToken, isLoading } = useContext(AuthContext);

  if (isLoading) return null; // puedes poner un loading spinner

  return (
    <NavigationContainer>
      {userToken ? <MainTabs /> : <LoginScreen />}
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
