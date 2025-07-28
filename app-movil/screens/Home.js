import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/Authcontext';
import { anuncioService } from '../services/anuncio.service';

export default function PantallaAnuncios() {
  const navigation = useNavigation();
  const [anuncios, setAnuncios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { usuario } = useContext(AuthContext);

  const esAdmin = usuario?.rol?.nombre === 'administrador';

  const fetchAnuncios = async () => {
    try {
      const res = await anuncioService.obtenerAnuncios();

      setAnuncios(Array.isArray(res) ? res : []);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los anuncios', error.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAnuncios();
  }, []);

  // Refresca automáticamente al volver a la pantalla
  const { addListener } = navigation;
  useEffect(() => {
    const unsubscribe = addListener('focus', () => {
      fetchAnuncios();
    });
    return unsubscribe;
  }, [navigation]);

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnuncios();
    setRefreshing(false);
  };

  const handleEliminar = async (id) => {
    Alert.alert('¿Eliminar anuncio?', 'Esta acción no se puede deshacer.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await anuncioService.eliminarAnuncio(id);
            fetchAnuncios(); // Recargar lista
          } catch (error) {
            Alert.alert('Error', 'No se pudo eliminar el anuncio');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1e3a8a"]} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Anuncios del CEE</Text>
        {esAdmin && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CrearAnuncio')}
          >
            <Ionicons name="add-circle-outline" size={24} color="white" />
            <Text style={styles.createButtonText}>Crear Anuncio</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1e3a8a" style={{ marginTop: 40 }} />
      ) : (
        <View style={styles.cardContainer}>
          {anuncios.length === 0 ? (
            <Text style={styles.emptyText}>No hay anuncios disponibles.</Text>
          ) : (
            anuncios.map((anuncio) => (
              <View key={anuncio.id} style={styles.card}>
                {anuncio.imagen && (
                  <Image
                    source={{ uri: `http://146.83.198.35:1217${anuncio.imagen}` }}
                    style={styles.image}
                  />
                )}
                <Text style={styles.title}>{anuncio.titulo}</Text>
                <Text style={styles.epilogo}>{anuncio.epilogo}</Text>

                {anuncio.link && (
                  <TouchableOpacity
                    onPress={() => navigation.navigate('WebViewScreen', { url: anuncio.link })}
                  >
                    <Text style={styles.link}>Más información</Text>
                  </TouchableOpacity>
                )}

                {esAdmin && (
                  <View style={styles.adminButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() =>
                        navigation.navigate('EditarAnuncio', { anuncioId: anuncio.id })
                      }
                    >
                      <Ionicons name="create-outline" size={20} color="white" />
                      <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleEliminar(anuncio.id)}
                    >
                      <Ionicons name="trash-outline" size={20} color="white" />
                      <Text style={styles.buttonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
};



const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  createButton: {
    marginTop: 16,
    backgroundColor: '#1e3a8a',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  cardContainer: {
    padding: 20,
    gap: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  epilogo: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  link: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#6b7280',
    marginTop: 60,
  },
  adminButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#0284c7',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
  },
});
