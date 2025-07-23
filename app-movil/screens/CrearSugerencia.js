import React, { useState, useContext } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../context/Authcontext';
import { sugerenciasService } from '../services/sugerencia.services';

const CrearSugerencia = ({ navigation }) => {
  const [titulo, setTitulo] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [categoria, setCategoria] = useState('');
  const [contacto, setContacto] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { userToken, usuario } = useContext(AuthContext);

  const categorias = [
    { label: 'Selecciona una categoría', value: '' },
    { label: 'Infraestructura', value: 'infraestructura' },
    { label: 'Eventos', value: 'eventos' },
    { label: 'Bienestar', value: 'bienestar' },
    { label: 'Otros', value: 'otros' },
  ];

  const validarFormulario = () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return false;
    }
    
    if (titulo.trim().length < 5) {
      Alert.alert('Error', 'El título debe tener al menos 5 caracteres');
      return false;
    }
    
    if (titulo.trim().length > 200) {
      Alert.alert('Error', 'El título no puede exceder los 200 caracteres');
      return false;
    }
    
    if (!mensaje.trim()) {
      Alert.alert('Error', 'El mensaje es obligatorio');
      return false;
    }
    
    if (mensaje.trim().length < 10) {
      Alert.alert('Error', 'El mensaje debe tener al menos 10 caracteres');
      return false;
    }
    
    if (mensaje.trim().length > 500) {
      Alert.alert('Error', 'El mensaje no puede exceder los 500 caracteres');
      return false;
    }
    
    if (contacto.trim() && contacto.trim().length > 100) {
      Alert.alert('Error', 'El contacto no puede exceder los 100 caracteres');
      return false;
    }
    
    if (!categoria) {
      Alert.alert('Error', 'Debes seleccionar una categoría');
      return false;
    }
    
    return true;
  };
  if(usuario?.rol !== 'estudiante') {
    
    navigation.navigate('ListaSugerencias');
  }

  const enviarSugerencia = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setLoading(true);

      const nuevaSugerencia = {
        titulo: titulo.trim(),
        mensaje: mensaje.trim(),
        categoria,
        contacto: contacto.trim() || null,
        autorId: usuario?.id,
      };

      await sugerenciasService.crearSugerencia(nuevaSugerencia);

      Alert.alert(
        'Éxito',
        'Tu sugerencia ha sido enviada correctamente. Será revisada por los administradores.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {

      Alert.alert(
        'Error',
        error.message || 'No se pudo enviar la sugerencia. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const limpiarFormulario = () => {
    Alert.alert(
      'Confirmar',
      '¿Estás seguro de que quieres limpiar el formulario? Se perderán todos los datos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: () => {
            setTitulo('');
            setMensaje('');
            setCategoria('');
            setContacto('');
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text style={styles.title}>Nueva Sugerencia</Text>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={limpiarFormulario}
          >
            <Ionicons name="refresh" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Información */}
        <View style={styles.infoBox}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#1e3a8a" />
            <Text style={styles.infoTitle}>Información</Text>
          </View>
          <Text style={styles.infoText}>
            Las sugerencias son una forma de comunicar ideas, mejoras o problemas 
            que hayas identificado. Serán revisadas por los administradores.
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Título */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Título <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej: Mejorar wifi en biblioteca"
              placeholderTextColor="#999"
              maxLength={100}
            />
            <Text style={styles.charCount}>
              {titulo.length}/100 caracteres
            </Text>
          </View>

          {/* Categoría */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Categoría <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={categoria}
                onValueChange={(itemValue) => setCategoria(itemValue)}
                style={styles.picker}
              >
                {categorias.map((cat) => (
                  <Picker.Item
                    key={cat.value}
                    label={cat.label}
                    value={cat.value}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* Contacto */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Contacto <Text style={styles.optional}>(Opcional)</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={contacto}
              onChangeText={setContacto}
              placeholder="Ej: correo o instagram"
              placeholderTextColor="#999"
              maxLength={100}
            />
            <Text style={styles.charCount}>
              {contacto.length}/100 caracteres
            </Text>
          </View>

          {/* Mensaje */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mensaje <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.textArea}
              value={mensaje}
              onChangeText={setMensaje}
              placeholder="Describe detalladamente tu sugerencia..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCount}>
              {mensaje.length}/1000 caracteres
            </Text>
          </View>

          {/* Consejos */}
          <View style={styles.tipsBox}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={18} color="#f59e0b" />
              <Text style={styles.tipsTitle}>Consejos</Text>
            </View>
            <Text style={styles.tipsText}>
              • Sé específico y claro en tu descripción{'\n'}
              • Incluye detalles sobre cómo esto beneficiaría a la comunidad{'\n'}
              • Si es un problema, describe cuándo y dónde ocurre{'\n'}
              • Usa un lenguaje respetuoso y constructivo
            </Text>
          </View>

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.disabledButton
              ]}
              onPress={enviarSugerencia}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.submitButtonText}>Enviando...</Text>
                </View>
              ) : (
                <>
                  <Ionicons name="send" size={18} color="white" />
                  <Text style={styles.submitButtonText}>Enviar Sugerencia</Text>
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
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e3a8a',
    flex: 1,
    textAlign: 'center',
  },
  clearButton: {
    padding: 4,
  },
  infoBox: {
    backgroundColor: '#f0f8ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  form: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#ff4d4f',
  },
  optional: {
    color: '#999',
    fontWeight: 'normal',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 50,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  tipsBox: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginLeft: 6,
  },
  tipsText: {
    fontSize: 13,
    color: '#d97706',
    lineHeight: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#1e3a8a',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});

export default CrearSugerencia;