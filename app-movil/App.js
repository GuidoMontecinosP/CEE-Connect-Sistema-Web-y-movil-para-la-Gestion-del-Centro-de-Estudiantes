import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons'; // o tu librería de íconos favorita

// Pantallas
import HomeScreen from './screens/Home.js';
import Eventos from './screens/Eventos';

import ListaVotaciones from './screens/ListaVotaciones';
import EmitirVoto from './screens/EmitirVoto';
import Resultados from './screens/Resultados';
import DetalleVotacion from './screens/DetalleVotacion';
//import Perfil from './screens/Perfil';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack de Eventos
function EventosStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Eventos" component={Eventos} />
      {/* <Stack.Screen name="DetalleEvento" component={DetalleEvento} />*/}
    </Stack.Navigator>
  );
}

// Stack de Votaciones
function VotacionesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ListaVotaciones" component={ListaVotaciones} options={{ title: 'Votaciones' }} />
      <Stack.Screen name="Detalle" component={DetalleVotacion} />
      <Stack.Screen name="Votar" component={EmitirVoto} />
      <Stack.Screen name="Resultados" component={Resultados} />
      {/* */}
    </Stack.Navigator>
  );
}

// Stack de Perfil
// function PerfilStack() {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen name="Perfil" component={Perfil} />
//     </Stack.Navigator>
//   );
// }

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#1e3a8a',
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === 'Inicio') iconName = 'home';
            if (route.name === 'Votaciones') iconName = 'checkbox';
            if (route.name === 'Eventos') iconName = 'calendar';
            // if (route.name === 'Perfil') iconName = 'person';
            return <Ionicons name={iconName} size={size} color={color} />;
          }
        })}
      >
        <Tab.Screen name="Inicio" component={HomeScreen} />
        <Tab.Screen name="Votaciones" component={VotacionesStack} />
        <Tab.Screen name="Eventos" component={EventosStack} />
        {/* <Tab.Screen name="Perfil" component={PerfilStack} /> */}
      </Tab.Navigator>
    </NavigationContainer>
  );
}
