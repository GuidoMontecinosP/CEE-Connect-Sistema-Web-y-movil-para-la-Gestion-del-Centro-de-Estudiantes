import { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Animated, 
  Dimensions, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import axios from '../services/api';

const { width } = Dimensions.get('window');

export default function Resultados({ route }) {
  const { id } = route.params;
  const [resultados, setResultados] = useState(null);
  const [animatedValues, setAnimatedValues] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchResultados = async () => {
    try {
      const res = await axios.get(`/votacion/${id}/resultados`);
      setResultados(res.data.data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo cargar resultados');
    }
  };

  useEffect(() => {
    fetchResultados();
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchResultados();
    }, [id])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchResultados();
    setRefreshing(false);
  }, [id]);

  useEffect(() => {
    if (!resultados) return;
    const animations = resultados.resultados.map(() => new Animated.Value(0));
    setAnimatedValues(animations);

    setTimeout(() => {
      animations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000 + index * 200,
          useNativeDriver: false,
        }).start();
      });
    }, 300);
  }, [resultados]);

  if (!resultados) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEmoji}>📊</Text>
          <Text style={styles.loadingText}>Cargando resultados...</Text>
          <Text style={styles.loadingSubtext}>Analizando votos</Text>
        </View>
      </View>
    );
  }

  const totalVotos = resultados.resultados.reduce((sum, r) => sum + r.votos, 0);
  const maxVotos = Math.max(...resultados.resultados.map(r => r.votos));
  const resultadosConPorcentaje = resultados.resultados.map((r, idx) => ({
    ...r,
    porcentaje: totalVotos > 0 ? (r.votos / totalVotos) * 100 : 0,
    originalIndex: idx,
    color: getColorByIndex(idx),
    isWinner:
      resultados.votacion.estado === 'cerrada' &&
      r.votos === maxVotos &&
      r.votos > 0,
  }));
  const resultadosOrdenados = [...resultadosConPorcentaje].sort(
    (a, b) => b.votos - a.votos
  );

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#1e3a8a']}
          tintColor="#1e3a8a"
          title="Actualizando..."
          titleColor="#1e3a8a"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🏆</Text>
        <Text style={styles.title}>Resultados de Votación</Text>
        <Text style={styles.subtitle}>{resultados.votacion.titulo}</Text>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalVotos}</Text>
            <Text style={styles.statLabel}>Total de Votos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {resultados.resultados.length}
            </Text>
            <Text style={styles.statLabel}>Opciones</Text>
          </View>
        </View>
      </View>

      {/* Results */}
      <View style={styles.resultsContainer}>
        {resultadosOrdenados.map((resultado) => {
          const animatedWidth = animatedValues[resultado.originalIndex]
            ? animatedValues[resultado.originalIndex].interpolate({
                inputRange: [0, 1],
                outputRange: [0, resultado.porcentaje],
              })
            : new Animated.Value(0);

          return (
            <View
              key={`result-${resultado.originalIndex}`}
              style={styles.resultCard}
            >
              {resultado.isWinner && (
                <View style={styles.winnerBadge}>
                  <Text style={styles.winnerText}>🥇 GANADOR</Text>
                </View>
              )}

              {/* Badge de liderato en empate o líder único */}
              {resultados.votacion.estado === 'activa' && resultado.votos === maxVotos && (
                <View style={styles.leadingBadge}>
                  <Text style={styles.leadingText}>📈 LIDERANDO</Text>
                </View>
              )}

              <View style={styles.resultHeader}>
                <Text style={styles.optionText}>{resultado.opcion}</Text>
                <View style={styles.resultStats}>
                  <Text style={styles.voteCount}>{resultado.votos} votos</Text>
                  <Text style={styles.percentage}>
                    {resultado.porcentaje.toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressBarContainer}>
                <Animated.View
                  style={[
                    styles.progressBar,
                    {
                      backgroundColor: resultado.color,
                      width: animatedWidth.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      }),
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          📅 Estado:{' '}
          {resultados.votacion.estado === 'activa'
            ? '🟢 Activa'
            : '🔴 Cerrada'}
        </Text>
      </View>
    </ScrollView>
  );
}


// Función para obtener colores según índice
function getColorByIndex(index) {
  const colors = [
    '#3b82f6', // Azul
    '#10b981', // Verde
    '#f59e0b', // Amarillo
    '#ef4444', // Rojo
    '#8b5cf6', // Púrpura
    '#06b6d4', // Cian
    '#f97316', // Naranja
    '#84cc16', // Lima
    '#ec4899', // Rosa
    '#6366f1', // Índigo
  ];
  return colors[index % colors.length];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingCard: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    padding: 24,
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    width: '100%',
    maxWidth: 300,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 20,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    position: 'relative',
  },
  winnerBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 3,
  },
  winnerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#92400e',
  },
  leadingBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 3,
  },
  leadingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 16,
  },
  resultStats: {
    alignItems: 'flex-end',
  },
  voteCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  percentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
});
