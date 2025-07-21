import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/Authcontext';

export default function HomeScreen() {
  const { logout } = useContext(AuthContext);

  const handleProximamente = () => {
    Alert.alert(
      "¡Próximamente!",
      "Las noticias de la UBB estarán disponibles muy pronto. ¡Mantente atento!",
      [{ text: "Entendido", style: "default" }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleBox}>
        <Text style={styles.title}>Noticias UBB</Text>
        <Text style={styles.subtitle}>Explora las últimas novedades de la universidad</Text>
      </View>

      <View style={styles.buttonContainer}>
        {/* Botón principal de noticias */}
        <TouchableOpacity style={styles.newsButton} onPress={handleProximamente}>
          <Text style={styles.newsButtonText}>📰 Ver Noticias</Text>
          <Text style={styles.comingSoonText}>Próximamente</Text>
        </TouchableOpacity>

        {/* Botón de cerrar sesión más discreto */}
      
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
    marginBottom: 40,
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
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  newsButton: {
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  newsButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  comingSoonText: {
    color: '#bfdbfe',
    fontSize: 12,
    fontStyle: 'italic',
  },
  logoutButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc2626',
    backgroundColor: 'transparent',
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
  },
});