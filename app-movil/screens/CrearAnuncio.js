import React, { useState } from 'react';
import { Picker } from '@react-native-picker/picker';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { anuncioService } from '../services/anuncio.service';

export default function CrearAnuncio() {
  const navigation = useNavigation();
  const [titulo, setTitulo] = useState('');
  const [epilogo, setEpilogo] = useState('');
  const [link, setLink] = useState('');
  const [tipo, setTipo] = useState('');
  const [imagen, setImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagen(result.assets[0]);
    }
  };


  const handleCrear = async () => {
    if (!titulo.trim() || !epilogo.trim() || !tipo.trim()) {
      Alert.alert('Error', 'El título, epílogo y tipo son obligatorios');
      return;
    }

    try {
      setSubiendo(true);

      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('epilogo', epilogo);
      if (link.trim()) formData.append('link', link);
      formData.append('tipo', tipo);
      if (imagen) {
        formData.append('imagen', {
          uri: imagen.uri,
          name: 'anuncio.jpg',
          type: 'image/jpeg',
        });
      }

      await anuncioService.crearAnuncio(formData);

      Alert.alert('Éxito', 'Anuncio creado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ListaAnuncios'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo crear el anuncio');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Crear Anuncio</Text>
          <Text style={styles.headerSubtitle}>Ingresa la información del nuevo anuncio</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Tipo de Anuncio *</Text>
          <View style={[styles.input, { padding: 0 }]}> 
            <Picker
              selectedValue={tipo}
              onValueChange={setTipo}
              style={{ height: 50 }}
            >
              <Picker.Item label="Selecciona un tipo..." value="" color="#9ca3af" />
              <Picker.Item label="Avisos Importante" value="avisos importante" />
              <Picker.Item label="Urgente" value="urgente" />
              <Picker.Item label="Otro" value="otro" />
            </Picker>
          </View>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Título del anuncio"
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.label}>Epílogo *</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            placeholder="Resumen del anuncio"
            value={epilogo}
            onChangeText={setEpilogo}
            multiline
          />

          <Text style={styles.label}>Enlace (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="https://enlace.com"
            value={link}
            onChangeText={setLink}
          />

          <Text style={styles.label}>Imagen (opcional)</Text>
          {imagen && (
            <Image source={{ uri: imagen.uri }} style={styles.previewImage} />
          )}
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>Seleccionar Imagen</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.navigate('home')}
          disabled={subiendo}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, subiendo && styles.submitButtonDisabled]}
          onPress={handleCrear}
          disabled={subiendo}
        >
          <Text style={styles.submitButtonText}>
            {subiendo ? 'Creando...' : '✅ Crear Anuncio'}
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
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 8,
    marginTop: 20,
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
  imageButton: {
    marginTop: 8,
    backgroundColor: '#e0e7ff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  imageButtonText: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 8,
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
