
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.titleBox}>
        <Text style={styles.title}>Noticias UBB</Text>
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Eventos')}>
          <Text style={styles.iconPlaceholder}>📅</Text>
          <Text style={styles.label}>Eventos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Lista')}>
          <Text style={styles.iconPlaceholder}>🗳️</Text>
          <Text style={styles.label}>Votaciones</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Perfil')}>
          <Text style={styles.iconPlaceholder}>👤</Text>
          <Text style={styles.label}>Perfil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 20,
  },
  titleBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
  },
  navItem: {
    alignItems: 'center',
  },
  iconPlaceholder: {
    fontSize: 32,
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    color: '#374151',
  },
});
