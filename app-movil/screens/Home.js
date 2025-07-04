import React, { useContext } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AuthContext } from '../context/Authcontext'; // 

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <View style={styles.titleBox}>
        <Text style={styles.title}>Noticias UBB</Text>
        <Text style={styles.subtitle}>Explora las últimas novedades de la universidad</Text>
      </View>

      <View style={{ marginTop: 30 }}>
        <Button title="Cerrar sesión" onPress={logout} color="#dc2626" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleBox: {
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});
