import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ListaVotaciones from './screens/ListaVotaciones.js';
import EmitirVoto from './screens/EmitirVoto.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Lista" component={ListaVotaciones} />
        <Stack.Screen name="Votar" component={EmitirVoto} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
