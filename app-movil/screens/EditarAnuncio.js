import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { anuncioService } from '../services/anuncio.service';

export default function EditarAnuncio() {
  const navigation = useNavigation();
  const route = useRoute();
  const { anuncioId } = route.params;
  const [anuncio, setAnuncio] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [epilogo, setEpilogo] = useState('');
  const [link, setLink] = useState('');
  const [tipo, setTipo] = useState('urgente');
  const [imagen, setImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnuncio = async () => {
      try {
        const data = await anuncioService.obtenerAnuncioPorId(anuncioId);
        setAnuncio(data);
        setTitulo(data.titulo || '');
        setEpilogo(data.epilogo || '');
        setLink(data.link || '');
        setTipo(data.tipo || 'urgente');
      } catch (err) {
        Alert.alert('Error', 'No se pudo cargar el anuncio');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };
    fetchAnuncio();
  }, [anuncioId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagen(result.assets[0]);
    }
  };

  const handleActualizar = async () => {
    if (!titulo.trim() || !epilogo.trim()) {
      Alert.alert('Error', 'El título y epílogo son obligatorios');
      return;
    }
    if (!tipo) {
      Alert.alert('Error', 'El tipo de anuncio es obligatorio');
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

      await anuncioService.modificarAnuncio(anuncioId, formData);

      Alert.alert('Éxito', 'Anuncio actualizado correctamente', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('ListaAnuncios'),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo actualizar el anuncio');
    } finally {
      setSubiendo(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#1e3a8a' }}>Cargando anuncio...</Text>
      </View>
    );
  }

  if (!anuncio) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, color: '#dc2626' }}>No se encontró el anuncio.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar Anuncio</Text>
        <Text style={styles.headerSubtitle}>Modifica la información del anuncio</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Epilogo *</Text>
        <TextInput
          style={[styles.input, { height: 80 }]}
          value={epilogo}
          onChangeText={setEpilogo}
          multiline
        />

        <Text style={styles.label}>Enlace (opcional)</Text>
        <TextInput
          style={styles.input}
          value={link}
          onChangeText={setLink}
        />

        <Text style={styles.label}>Tipo de Anuncio *</Text>
        <View style={{
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#d1d5db',
          borderRadius: 12,
          marginBottom: 8,
        }}>
          <Picker
            selectedValue={tipo}
            onValueChange={setTipo}
            style={{ height: 48 }}
          >
            <Picker.Item label="Urgente" value="urgente" />
            <Picker.Item label="Avisos importantes" value="avisos importantes" />
            <Picker.Item label="Otros" value="otros" />
          </Picker>
        </View>

        <Text style={styles.label}>Imagen (opcional)</Text>
        {imagen ? (
          <Image source={{ uri: imagen.uri }} style={styles.previewImage} />
        ) : anuncio.imagen ? (
          <Image source={{ uri: `http://146.83.198.35:1217${anuncio.imagen}` }} style={styles.previewImage} />
        ) : null}

        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.imageButtonText}>Cambiar Imagen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, subiendo && { opacity: 0.6 }]}
          onPress={handleActualizar}
          disabled={subiendo}
        >
          <Text style={styles.submitButtonText}>
            {subiendo ? 'Actualizando...' : '✅ Actualizar Anuncio'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.deleteButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#f8fafc' },
  header: {
    padding: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 12,
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
    marginBottom: 8,
    marginTop: 8,
  },
  submitButton: {
    marginTop: 28,
    backgroundColor: '#1e3a8a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    marginTop: 16,
    backgroundColor: '#fee2e2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#b91c1c',
    fontSize: 15,
    fontWeight: 'bold',
  },
});