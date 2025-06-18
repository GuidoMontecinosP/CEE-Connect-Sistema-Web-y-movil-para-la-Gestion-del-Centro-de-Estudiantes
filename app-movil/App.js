import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListaVotaciones from './screens/ListaVotaciones.js';
import EmitirVoto from './screens/EmitirVoto.js';
import Resultados from './screens/Resultados.js';
import DetalleVotacion from './screens/DetalleVotacion.js';

import Eventos from './screens/Eventos.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Eventos">
        <Stack.Screen name="Eventos" component={Eventos} />
        <Stack.Screen name="Lista" component={ListaVotaciones} />
        <Stack.Screen name="Votar" component={EmitirVoto} />
        <Stack.Screen name="Resultados" component={Resultados} />
        <Stack.Screen name="Detalle" component={DetalleVotacion} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
