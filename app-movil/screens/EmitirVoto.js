
import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/Authcontext';
import { votacionService } from '../services/votacion.services';
import { votoService } from '../services/voto.services';

const { width } = Dimensions.get('window');

const EmitirVoto = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { votacionId } = route.params;
  const { usuario } = useContext(AuthContext);
  
  const [votacion, setVotacion] = useState(null);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState(null);
  const [yaVoto, setYaVoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enviandoVoto, setEnviandoVoto] = useState(false);
  
  const usuarioId = usuario?.id;

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [votacionRes, yaVotoRes] = await Promise.all([
          votacionService.obtenerVotacionPorId(votacionId),
          votoService.verificarSiYaVoto(usuarioId, votacionId)
        ]);
        
        setVotacion(votacionRes.data);
        setYaVoto(yaVotoRes.data.yaVoto);
      } catch (error) {
        Alert.alert('Error', `Error al cargar datos: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [votacionId]);

  const handleSubmit = async () => {
    if (!opcionSeleccionada) {
      Alert.alert('Atención', 'Debes seleccionar una opción antes de votar');
      return;
    }

    Alert.alert(
      'Confirmar Voto',
      '¿Estás seguro de que quieres emitir tu voto? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setEnviandoVoto(true);
              await votoService.emitirVoto(usuarioId, votacionId, opcionSeleccionada);
              Alert.alert('Éxito', '¡Voto emitido exitosamente!');
              setYaVoto(true);
            } catch (error) {
              Alert.alert('Error', `Error al emitir voto: ${error.message}`);
            } finally {
              setEnviandoVoto(false);
            }
          },
        },
      ]
    );
  };

  const getEstadoInfo = (estado) => {
    switch (estado) {
      case 'activa':
        return {
          color: '#10b981',
          backgroundColor: '#d1fae5',
          text: 'Activa',
          icon: 'checkmark-circle'
        };
      case 'cerrada':
        return {
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          text: 'Cerrada',
          icon: 'lock-closed'
        };
      default:
        return {
          color: '#6b7280',
          backgroundColor: '#f3f4f6',
          text: estado,
          icon: 'help-circle'
        };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={styles.loadingText}>Cargando votación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!votacion) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text style={styles.errorTitle}>Votación no encontrada</Text>
          <Text style={styles.errorSubtitle}>
            La votación que buscas no existe o ha sido eliminada.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('ListaVotaciones')}
          >
            <Text style={styles.primaryButtonText}>Volver a Votaciones</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const estadoInfo = getEstadoInfo(votacion.estado);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Información de la votación */}
        <View style={styles.votacionCard}>
          <View style={styles.votacionHeader}>
            <View style={styles.votacionTitleContainer}>
              <Text style={styles.votacionTitle}>{votacion.titulo}</Text>
              <View style={[styles.estadoTag, { backgroundColor: estadoInfo.backgroundColor }]}>
                <Ionicons name={estadoInfo.icon} size={16} color={estadoInfo.color} />
                <Text style={[styles.estadoText, { color: estadoInfo.color }]}>
                  {estadoInfo.text}
                </Text>
              </View>
            </View>
          </View>
          
          {votacion.descripcion && (
            <Text style={styles.votacionDescription}>{votacion.descripcion}</Text>
          )}
        </View>

        {/* Votación no disponible */}
        {votacion.estado !== 'activa' && (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={24} color="#f59e0b" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Votación no disponible</Text>
              <Text style={styles.warningText}>
                Esta votación está {votacion.estado} y no se pueden emitir votos.
              </Text>
            </View>
          </View>
        )}

        {/* Ya votó */}
        {yaVoto && (
          <View style={styles.successCard}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            <Text style={styles.successTitle}>¡Ya has votado!</Text>
            <Text style={styles.successSubtitle}>
              Tu voto ha sido registrado correctamente en esta votación. No puedes votar nuevamente.
            </Text>
            <View style={styles.successButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => navigation.navigate('ListaVotaciones')}
              >
                <Text style={styles.secondaryButtonText}>Volver a Votaciones</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Resultados', { votacionId })}
              >
                <Text style={styles.primaryButtonText}>Ver Resultados</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Formulario de votación */}
        {!yaVoto && votacion.estado === 'activa' && (
          <View style={styles.votingCard}>
            <View style={styles.votingHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#1e3a8a" />
              <Text style={styles.votingTitle}>Emite tu voto</Text>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>
                Tu voto es secreto y no podrá ser modificado una vez emitido. 
                Asegúrate de seleccionar la opción correcta.
              </Text>
            </View>

            <Text style={styles.optionsTitle}>Selecciona una opción:</Text>

            {votacion.opciones.map((opcion) => (
              <TouchableOpacity
                key={opcion.id}
                style={[
                  styles.optionCard,
                  opcionSeleccionada === opcion.id && styles.optionCardSelected
                ]}
                onPress={() => setOpcionSeleccionada(opcion.id)}
              >
                <View style={styles.optionContent}>
                  <View style={[
                    styles.radioButton,
                    opcionSeleccionada === opcion.id && styles.radioButtonSelected
                  ]}>
                    {opcionSeleccionada === opcion.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <Text style={styles.optionText}>{opcion.textoOpcion}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <View style={styles.votingFooter}>
              <View style={styles.footerInfo}>
                <Ionicons name="time" size={16} color="#64748b" />
                <Text style={styles.footerText}>
                  Asegúrate de tu elección antes de confirmar
                </Text>
              </View>
              
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!opcionSeleccionada || enviandoVoto) && styles.submitButtonDisabled
                ]}
                disabled={!opcionSeleccionada || enviandoVoto}
                onPress={handleSubmit}
              >
                {enviandoVoto ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="send" size={20} color="#fff" />
                )}
                <Text style={styles.submitButtonText}>
                  {enviandoVoto ? 'Emitiendo Voto...' : 'Emitir Voto'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  votacionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  votacionHeader: {
    marginBottom: 16,
  },
  votacionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  votacionTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginRight: 16,
  },
  estadoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  estadoText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  votacionDescription: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  warningCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#d97706',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#92400e',
  },
  successCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginTop: 16,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
  },
  successButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  votingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  votingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  votingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e3a8a',
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  optionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionCardSelected: {
    borderColor: '#1e3a8a',
    borderWidth: 2,
    backgroundColor: '#f0f9ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: '#1e3a8a',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1e3a8a',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  votingFooter: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
  },
  submitButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  primaryButton: {
    backgroundColor: '#1e3a8a',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e3a8a',
  },
  secondaryButtonText: {
    color: '#1e3a8a',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EmitirVoto;