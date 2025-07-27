import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { eventosService } from '../services/eventos.service.js';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import axios from '../services/api.js';

export default function CrearEvento() {
    const navigation = useNavigation();
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState(null);
    const [hora, setHora] = useState(null);
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [ubicacion, setUbicacion] = useState('');
    const [tipo, setTipo] = useState('');
    const [imagen, setImagen] = useState(null);
    const [loading, setLoading] = useState(false);

  const formatFecha = (date) => {
    return date ? date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
  };

  const formatFEchaEnvio = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
    };

  const formatHora = (date) => {
    return date ? date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '';
  };

  const validarFormulario = () => {
    if (!titulo.trim() || !descripcion.trim() || !ubicacion.trim() || !fecha || !hora || !tipo.trim()) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return false;
    }
    return true;
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a tus imágenes');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImagen(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('titulo', titulo.trim());
      formData.append('descripcion', descripcion.trim());
      formData.append('fecha', formatFEchaEnvio(fecha));
      formData.append('hora', formatHora(hora));
      formData.append('lugar', ubicacion.trim());
      formData.append('tipo', tipo);

      if (imagen) {
        formData.append('imagen', {
          uri: imagen.uri,
          type: 'image/jpeg',
          name: 'evento.jpg',
        });
      }

        const response = await eventosService.crearEvento(formData);

      Alert.alert('Éxito', 'Evento creado exitosamente', [
        {
          text: 'OK',
          onPress: () => {
            setTitulo('');
            setDescripcion('');
            setFecha(null);
            setHora(null);
            setUbicacion('');
            setTipo('');
            setImagen(null);
            navigation.navigate('Eventos');
          },
        },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.errors?.[0] || 'No se pudo crear el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nuevo Evento</Text>
          <Text style={styles.headerSubtitle}>Ingresa los detalles del evento</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.label}>📌 Título</Text>
            <TextInput
              style={styles.input}
              placeholder="Título del evento"
              value={titulo}
              onChangeText={setTitulo}
              maxLength={100}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>📝 Descripción</Text>
            <TextInput
              style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
              placeholder="Descripción del evento"
              multiline
              value={descripcion}
              onChangeText={setDescripcion}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>📍 Ubicación</Text>
            <TextInput
              style={styles.input}
              placeholder="Ubicación del evento"
              value={ubicacion}
              onChangeText={setUbicacion}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>📅 Fecha</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowDate(true)}>
              <Text style={{ color: fecha ? '#111827' : '#9ca3af' }}>
                {fecha ? formatFecha(fecha) : 'Selecciona una fecha'}
              </Text>
            </TouchableOpacity>
            {showDate && (
              <DateTimePicker
                value={fecha || new Date()}
                mode="date"
                display="default"
                onChange={(e, selectedDate) => {
                  setShowDate(false);
                  if (selectedDate) setFecha(selectedDate);
                }}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>⏰ Hora</Text>
            <TouchableOpacity style={styles.input} onPress={() => setShowTime(true)}>
              <Text style={{ color: hora ? '#111827' : '#9ca3af' }}>
                {hora ? formatHora(hora) : 'Selecciona una hora'}
              </Text>
            </TouchableOpacity>
            {showTime && (
              <DateTimePicker
                value={hora || new Date()}
                mode="time"
                display="default"
                onChange={(e, selectedTime) => {
                  setShowTime(false);
                  if (selectedTime) setHora(selectedTime);
                }}
              />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>🎯 Tipo</Text>
            <View style={[styles.input, { padding: 0 }]}>
              <Picker
                selectedValue={tipo}
                onValueChange={(itemValue) => setTipo(itemValue)}
                style={{ height: 50 }}
              >
                <Picker.Item label="Selecciona un tipo..." value="" color="#9ca3af" />
                <Picker.Item label="Reunión" value="Reunión" />
                <Picker.Item label="Taller" value="Taller" />
                <Picker.Item label="Charla" value="Charla" />
                <Picker.Item label="Recreativo" value="Recreativo" />
                <Picker.Item label="Conferencia" value="Conferencia" />
                <Picker.Item label="Otro" value="Otro" />
              </Picker>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>🖼️ Imagen (opcional)</Text>
            <TouchableOpacity style={styles.input} onPress={handleImagePicker}>
              <Text style={{ color: imagen ? '#111827' : '#9ca3af' }}>
                {imagen ? 'Imagen seleccionada ✅' : 'Seleccionar imagen'}
              </Text>
            </TouchableOpacity>
            {imagen && (
              <Image
                source={{ uri: imagen.uri }}
                style={{ marginTop: 10, width: '100%', height: 200, borderRadius: 12 }}
              />
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.navigate('ListaEventos')} disabled={loading}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.submitButtonText}>
            {loading ? 'Creando...' : '✅ Crear Evento'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    backgroundColor: '#1e3a8a',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
