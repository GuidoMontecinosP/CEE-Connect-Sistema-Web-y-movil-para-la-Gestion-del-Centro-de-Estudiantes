import React, { useEffect, useState, useContext} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/Authcontext.js';
import { sugerenciasService } from '../services/sugerencia.services.js';

const EditarSugerencia = () => {
  const [formData, setFormData] = useState({
    titulo: '',
    mensaje: '',
    categoria: '',
    contacto: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [datosOriginales, setDatosOriginales] = useState(null);
  const [errors, setErrors] = useState({});

  const navigation = useNavigation();
  const route = useRoute();
  const { usuario } = useContext(AuthContext);
  
  const { id } = route.params;
  const datosIniciales = route.params?.sugerencia || {};

  useEffect(() => {
    const cargarSugerencia = async () => {
      try {
        //console.log('Cargando sugerencia con ID:', id);
        const res = await sugerenciasService.obtenerSugerenciaPorId(id);
      
        const datos = res.data;
        
        if (usuario.id !== res.data.autor.id) {
          Alert.alert('Error', 'No tienes permiso para editar esta sugerencia');
          navigation.goBack();
          return;
        }
        
        setDatosOriginales(datos);
        setFormData({
          titulo: datos.titulo || '',
          mensaje: datos.mensaje || '',
          categoria: datos.categoria || '',
          contacto: datos.contacto || '',
        });
      } catch (err) {
        console.error('Error al cargar sugerencia:', err);
        Alert.alert('Error', 'No se pudo cargar la sugerencia');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    cargarSugerencia();
  }, [id, usuario.id, navigation]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    } else if (formData.titulo.trim().length < 5) {
      newErrors.titulo = 'El título debe tener al menos 5 caracteres';
    } else if (formData.titulo.trim().length > 200) {
      newErrors.titulo = 'El título no debe exceder 200 caracteres';
    }

    if (!formData.mensaje.trim()) {
      newErrors.mensaje = 'La descripción es requerida';
    } else if (formData.mensaje.trim().length < 10) {
      newErrors.mensaje = 'La descripción debe tener al menos 10 caracteres';
    } else if (formData.mensaje.trim().length > 500) {
      newErrors.mensaje = 'La descripción no debe exceder 500 caracteres';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Selecciona una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateForm()) return;

    try {
      setUpdating(true);
      
      // Solo enviar campos que realmente cambiaron
      const datosActualizados = {};
      
      if (formData.titulo.trim() !== datosOriginales?.titulo) {
        datosActualizados.titulo = formData.titulo.trim();
      }
      if (formData.mensaje.trim() !== datosOriginales?.mensaje) {
        datosActualizados.mensaje = formData.mensaje.trim();
      }
      if (formData.categoria !== datosOriginales?.categoria) {
        datosActualizados.categoria = formData.categoria;
      }
      if (formData.contacto.trim() !== datosOriginales?.contacto) {
        datosActualizados.contacto = formData.contacto.trim() || '';
      }
      
      // Verificar que hay al menos un cambio
      if (Object.keys(datosActualizados).length === 0) {
        Alert.alert('Aviso', 'No se detectaron cambios');
        return;
      }
      
      await sugerenciasService.actualizarSugerencia(id, datosActualizados);
      
      Alert.alert(
        'Éxito',
        'Sugerencia actualizada exitosamente',
        [{ text: 'OK', onPress: () => navigation.navigate('MisSugerencias') }]
      );
    } catch (err) {
      console.error('Error al actualizar:', err);
      Alert.alert('Error', err.message || 'Error al actualizar sugerencia');
    } finally {
      setUpdating(false);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
        <Text style={styles.loadingText}>Cargando sugerencia...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#1e3a8a" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Sugerencia</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Título principal */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>Modifica tu Sugerencia</Text>
            <Text style={styles.subtitle}>
              Actualiza los datos que desees cambiar
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            {/* Campo Título */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="create-outline" size={16} color="#1e3a8a" />
                {' '}Título de la Sugerencia
              </Text>
              <TextInput
                style={[styles.input, errors.titulo && styles.inputError]}
                value={formData.titulo}
                onChangeText={(value) => updateFormData('titulo', value)}
                placeholder={datosIniciales.titulo || "Ingresa el título de tu sugerencia..."}
                placeholderTextColor="#9ca3af"
                multiline={false}
              />
              {errors.titulo && (
                <Text style={styles.errorText}>{errors.titulo}</Text>
              )}
            </View>

            {/* Campo Descripción */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="document-text-outline" size={16} color="#1e3a8a" />
                {' '}Descripción Detallada
              </Text>
              <TextInput
                style={[styles.textArea, errors.mensaje && styles.inputError]}
                value={formData.mensaje}
                onChangeText={(value) => updateFormData('mensaje', value)}
                placeholder={datosIniciales.mensaje || "Describe tu sugerencia en detalle..."}
                placeholderTextColor="#9ca3af"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <Text style={styles.characterCount}>
                {formData.mensaje.length}/500 caracteres
              </Text>
              {errors.mensaje && (
                <Text style={styles.errorText}>{errors.mensaje}</Text>
              )}
            </View>

            {/* Campo Categoría */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="folder-outline" size={16} color="#1e3a8a" />
                {' '}Categoría
              </Text>
              <View style={[styles.pickerContainer, errors.categoria && styles.inputError]}>
                <Picker
                  selectedValue={formData.categoria}
                  style={styles.picker}
                  onValueChange={(value) => updateFormData('categoria', value)}
                >
                  <Picker.Item label="Selecciona una categoría..." value="" />
                 <Picker.Item label="Académico" value="academico" />
                  <Picker.Item label="Bienestar" value="bienestar" />
                  <Picker.Item label="Cultura" value="cultura" />
                  <Picker.Item label="Deportes" value="deportes" />
                  <Picker.Item label="Infraestructura" value="infraestructura" />
                  <Picker.Item label="Eventos" value="eventos" />
                  <Picker.Item label="General" value="general" />
                  <Picker.Item label="Seguridad" value="seguridad" />
                  <Picker.Item label="Servicios" value="servicios" />
                  <Picker.Item label="Otros" value="otros" />
                </Picker>
              </View>
              {errors.categoria && (
                <Text style={styles.errorText}>{errors.categoria}</Text>
              )}
            </View>

            {/* Campo Contacto */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Ionicons name="mail-outline" size={16} color="#1e3a8a" />
                {' '}Contacto (Opcional)
              </Text>
              <TextInput
                style={styles.input}
                value={formData.contacto}
                onChangeText={(value) => updateFormData('contacto', value)}
                placeholder={datosIniciales.contacto || "Email o teléfono de contacto..."}
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Consejos */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb-outline" size={20} color="#1e3a8a" />
              <Text style={styles.tipsTitle}>Consejos para editar</Text>
            </View>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
                <Text style={styles.tipText}>Solo se guardarán los campos modificados</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
                <Text style={styles.tipText}>Los cambios serán visibles inmediatamente</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#059669" />
                <Text style={styles.tipText}>Puedes cancelar en cualquier momento</Text>
              </View>
            </View>
          </View>

          {/* Botones de acción */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.submitButton, updating && styles.submitButtonDisabled]}
              onPress={onSubmit}
              disabled={updating}
            >
              {updating ? (
                <>
                  <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Guardando...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="white" style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e3a8a',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 24,
    
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#334155',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8fafc',
    color: '#334155',
    minHeight: 100,
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#334155',
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    marginLeft: 8,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#1e3a8a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});

export default EditarSugerencia;