import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from '../services/api.js'; // Ajusta la ruta según tu estructura

export default function CrearVotacion({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [opciones, setOpciones] = useState(['', '']); // Comienza con 2 opciones mínimas
  const [loading, setLoading] = useState(false);

  const handleOpcionChange = (index, value) => {
    const nuevasOpciones = [...opciones];
    nuevasOpciones[index] = value;
    setOpciones(nuevasOpciones);
  };

  const agregarOpcion = () => {
    if (opciones.length < 10) {
      setOpciones([...opciones, '']);
    }
  };

  const eliminarOpcion = (index) => {
    if (opciones.length > 2) {
      const nuevasOpciones = opciones.filter((_, i) => i !== index);
      setOpciones(nuevasOpciones);
    }
  };

  const validarFormulario = () => {
    if (!titulo.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return false;
    }

    const opcionesValidas = opciones.filter(op => op.trim() !== '');
    if (opcionesValidas.length < 2) {
      Alert.alert('Error', 'Debe haber al menos 2 opciones válidas');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    const opcionesValidas = opciones.filter(op => op.trim() !== '');

    try {
      // Ajusta esta llamada según tu API
      const response = await axios.post('/votacion', {
        titulo: titulo.trim(), // Título de la votación .trim() para eliminar espacios al inicio y final
        opciones: opcionesValidas
      });

      Alert.alert(
        'Éxito',
        'Votación creada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              // Limpiar formulario
              setTitulo('');
              setOpciones(['', '']);
              // Volver a la lista
              navigation.goBack();
            }
          }
        ]
      );
    } catch (err) {
      
      
      Alert.alert(
        'Error',
      err.response?.data?.errors?.[0] || 'No se pudo crear la votación'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}> Nueva Votación</Text>
          <Text style={styles.headerSubtitle}>
            Configura los detalles de tu votación
          </Text>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          {/* Título */}
          <View style={styles.section}>
            <Text style={styles.label}>📝 Título de la Votación</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Ingresa el título de la votación"
              value={titulo}
              onChangeText={setTitulo}
              placeholderTextColor="#9ca3af"
              maxLength={100}
            />
            <Text style={styles.charCount}>{titulo.length}/100</Text>
          </View>

          {/* Opciones */}
          <View style={styles.section}>
            <Text style={styles.label}>🗳️ Opciones de Votación</Text>
            <Text style={styles.sublabel}>
              Agrega las opciones (mínimo 2, máximo 10)
            </Text>

            {opciones.map((opcion, index) => (
              <View key={index} style={styles.opcionContainer}>
                <View style={styles.opcionInputContainer}>
                  <View style={styles.opcionNumber}>
                    <Text style={styles.opcionNumberText}>{index + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.opcionInput}
                    placeholder={`Opción ${index + 1}`}
                    value={opcion}
                    onChangeText={(value) => handleOpcionChange(index, value)}
                    placeholderTextColor="#9ca3af"
                    maxLength={50}
                  />
                  {opciones.length > 2 && (
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => eliminarOpcion(index)}
                    >
                      <Ionicons name="trash" size={20} color="#dc2626" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}

            {/* Botón agregar opción */}
            {opciones.length < 10 && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={agregarOpcion}
              >
                <Ionicons name="add" size={20} color="#1e3a8a" />
                <Text style={styles.addButtonText}>
                  Agregar Opción ({opciones.length}/10)
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Consejos */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Consejos</Text>
            <Text style={styles.tipsText}>• Usa un título claro y descriptivo</Text>
            <Text style={styles.tipsText}>• Las opciones deben ser específicas</Text>
            <Text style={styles.tipsText}>• Evita opciones muy largas</Text>
            <Text style={styles.tipsText}>• Máximo 10 opciones diferentes</Text>
          </View>
        </View>
      </ScrollView>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Creando...' : '✅ Crear Votación'}
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
  sublabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  titleInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
  },
  opcionContainer: {
    marginBottom: 12,
  },
  opcionInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  opcionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  opcionNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  opcionInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 8,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#1e3a8a',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#1e3a8a',
    fontWeight: '500',
    marginLeft: 8,
  },
  tipsContainer: {
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1e3a8a',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
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