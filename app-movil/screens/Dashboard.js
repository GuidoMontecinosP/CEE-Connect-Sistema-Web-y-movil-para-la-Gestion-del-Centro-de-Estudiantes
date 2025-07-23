import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/Authcontext';
import { useNavigation } from '@react-navigation/native';

export default function Dashboard() {
  const { usuario, logout } = useContext(AuthContext);
  const navigation = useNavigation();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Cerrar Sesión', 
          onPress: logout,
          style: 'destructive' 
        },
      ]
    );
  };

  // Función para navegar a los diferentes tabs
  const navigateToTab = (tabName, screenName = null) => {
    navigation.navigate('MainTabs', {
      screen: tabName,
      params: screenName ? { screen: screenName } : undefined
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        
        {/* Bienvenida Principal */}
        <View style={styles.welcomeSection}>
          <View style={styles.avatarContainer}>
            {usuario?.avatar ? (
              <Image source={{ uri: usuario.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.defaultAvatar}>
                <Ionicons name="person" size={40} color="#1e3a8a" />
              </View>
            )}
          </View>
          
          <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
          <Text style={styles.userName}>
            {usuario?.nombre}
          </Text>
          
          <View style={styles.userInfoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Rol: </Text>
              <Text style={styles.infoValue}>{usuario?.rol?.nombre}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Correo: </Text>
              <Text style={styles.infoValue}>{usuario?.correo}</Text>
            </View>
          </View>
        </View>

        

      

        {/* Acciones rápidas */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigateToTab('Votaciones')}
          >
            <View style={styles.actionButtonLeft}>
              <Ionicons name="checkbox" size={20} color="#1e3a8a" />
              <Text style={styles.actionButtonText}>Ver Votaciones</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigateToTab('Eventos')}
          >
            <View style={styles.actionButtonLeft}>
              <Ionicons name="calendar-outline" size={20} color="#1e3a8a" />
              <Text style={styles.actionButtonText}>Próximos Eventos</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigateToTab('Sugerencias')}
          >
            <View style={styles.actionButtonLeft}>
              <Ionicons name="bulb" size={20} color="#1e3a8a" />
              <Text style={styles.actionButtonText}>Ver Sugerencias</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigateToTab('Noticias')}
          >
            <View style={styles.actionButtonLeft}>
              <Ionicons name="newspaper-outline" size={20} color="#1e3a8a" />
              <Text style={styles.actionButtonText}>Noticias</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          {/* Opciones adicionales para crear contenido */}
          {usuario?.rol?.nombre === 'administrador' && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigateToTab('Votaciones', 'CrearVotacion')}
            >
              <View style={styles.actionButtonLeft}>
                <Ionicons name="add-circle" size={20} color="#1e3a8a" />
                <Text style={[styles.actionButtonText, { color: '#1e3a8a' }]}>Crear Votación</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#666" />
            </TouchableOpacity>
          )}

          {/* Solo mostrar opciones de sugerencias si NO es administrador */}
          {usuario?.rol?.nombre !== 'administrador' && (
            <>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigateToTab('Sugerencias', 'CrearSugerencia')}
              >
                <View style={styles.actionButtonLeft}>
                  <Ionicons name="create" size={20} color="#1e3a8a" />
                  <Text style={[styles.actionButtonText, { color: '#1e3a8a' }]}>Nueva Sugerencia</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigateToTab('Sugerencias', 'MisSugerencias')}
              >
                <View style={styles.actionButtonLeft}>
                  <Ionicons name="document-text" size={20} color="#1e3a8a" />
                  <Text style={[styles.actionButtonText, { color: '#1e3a8a' }]}>Mis Sugerencias</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </TouchableOpacity>
            </>
          )}

          
        </View>

        {/* Botón de cerrar sesión */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  
  container: {
    flex: 1,
  },
  
  welcomeSection: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  avatarContainer: {
    marginBottom: 16,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#1e3a8a',
  },
  
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1e3a8a',
  },
  
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  
  userInfoContainer: {
    alignItems: 'center',
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  
  infoLabel: {
    fontSize: 16,
    color: '#64748b',
  },
  
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
  },
  
  roleInfoSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  
  studentCard: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
  },
  
  adminCard: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 12,
    padding: 16,
  },
  
  roleCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  
  adminCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 12,
  },
  
  featuresList: {
    gap: 8,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  featureText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
  },
  
  quickActionsSection: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  actionButtonText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
    fontWeight: '500',
  },
  
  logoutSection: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});