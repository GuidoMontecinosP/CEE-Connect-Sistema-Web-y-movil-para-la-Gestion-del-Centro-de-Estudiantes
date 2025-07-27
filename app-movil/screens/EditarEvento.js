import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, KeyboardAvoidingView, Platform, Image
} from 'react-native';

import { useNavigation, useRoute } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

import { eventosService } from '../services/eventos.service';


export default function EditarEvento() {
    const navigation = useNavigation();
    const route = useRoute();
    const { eventoId } = route.params;

    const [evento, setEvento] = useState(null);
    const [titulo, setTitulo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [fecha, setFecha] = useState(null);
    const [hora, setHora] = useState(null);
    const [ubicacion, setUbicacion] = useState('');
    const [tipo, setTipo] = useState('');
    const [imagen, setImagen] = useState(null);
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvento = async () => {
            try {
                const data = await eventosService.obtenerEventoPorId(eventoId);
                setEvento(data);
                setTitulo(data.titulo || '');
                setDescripcion(data.descripcion || '');
                setFecha(data.fecha ? new Date(data.fecha) : null);
                setHora(data.hora ? new Date(`2000-01-01T${data.hora}`) : null);
                setUbicacion(data.lugar || '');
                setTipo(data.tipo || '');
            } catch (err) {
                Alert.alert('Error', 'No se pudo cargar el evento');
                navigation.goBack();
            } finally {
                setLoading(false);
            }
        };
        fetchEvento();
    }, [eventoId]);

    const formatFecha = (date) => date
        ? date.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : '';

    const formatFechaEnvio = (date) => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

  const formatHora = (date) => date
    ? date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : '';

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

    const handleUpdate = async () => {
        setLoading(true);

        try {
            const formData = new FormData();
            if (titulo !== evento.titulo) formData.append('titulo', titulo.trim());
            if (descripcion !== evento.descripcion) formData.append('descripcion', descripcion.trim());
            if (ubicacion !== evento.lugar) formData.append('lugar', ubicacion.trim());
            if (tipo !== evento.tipo) formData.append('tipo', tipo);
            if (fecha && formatFechaEnvio(fecha) !== evento.fecha)
                formData.append('fecha', formatFechaEnvio(fecha));
            if (hora && formatHora(hora) !== evento.hora)
                formData.append('hora', formatHora(hora));

            if (imagen) {
                formData.append('imagen', {
                uri: imagen.uri,
                type: 'image/jpeg',
                name: 'evento-editado.jpg',
                });
            }

            await eventosService.modificarEvento(evento.id, formData);

            Alert.alert('Éxito', 'Evento actualizado correctamente', [
                { text: 'OK', onPress: () => navigation.navigate('Eventos') },
            ]);
        } catch (err) {
            Alert.alert('Error', err.response?.data?.errors?.[0] || 'No se pudo actualizar el evento');
        } finally {
            setLoading(false);
        }
    };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#1e3a8a' }}>Cargando evento...</Text>
      </View>
    );
  }

  if (!evento) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#dc2626' }}>No se encontró el evento.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Editar Evento</Text>
          <Text style={styles.headerSubtitle}>Modifica solo los campos necesarios</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.label}>📌 Título</Text>
            <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>📝 Descripción</Text>
            <TextInput style={[styles.input, { height: 100 }]} multiline value={descripcion} onChangeText={setDescripcion} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>📍 Ubicación</Text>
            <TextInput style={styles.input} value={ubicacion} onChangeText={setUbicacion} />
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
              <Picker selectedValue={tipo} onValueChange={setTipo}>
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
              <Image source={{ uri: imagen.uri }} style={{ marginTop: 10, width: '100%', height: 200, borderRadius: 12 }} />
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={loading}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.submitButton, loading && styles.submitButtonDisabled]} onPress={handleUpdate} disabled={loading}>
          <Text style={styles.submitButtonText}>{loading ? 'Actualizando...' : '✅ Guardar Cambios'}</Text>
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
