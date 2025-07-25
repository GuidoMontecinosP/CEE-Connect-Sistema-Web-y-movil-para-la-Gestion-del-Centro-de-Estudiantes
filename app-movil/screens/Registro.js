import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Linking,
} from 'react-native';
import axios from '../services/api.js';
import { useNavigation } from '@react-navigation/native';

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (!nombre || !correo || !contrasena || !confirmarContrasena) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    // Validar correo institucional
    const emailPattern = /@alumnos\.ubiobio\.cl$/;
    if (!emailPattern.test(correo)) {
      Alert.alert('Error', 'El correo debe ser institucional @alumnos.ubiobio.cl');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/auth/register', {
        nombre,
        correo,
        contrasena,
        rolId: 2,
      });

      Alert.alert(
        ' Verifica tu cuenta',
        `Te enviamos un enlace de verificación a:\n${correo}\n\n• Abre tu aplicación de correo\n• Revisa tu bandeja de entrada y spam\n• Toca el enlace "Verificar cuenta"\n• Luego vuelve aquí para iniciar sesión`,
        [            
          {
            text: 'Entendido',
            style: 'default',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (err) {
      console.log('Error de registro:', err.response?.data.details);
     
      Alert.alert(
        'Error',
        err.response?.data?.details || 'Error al registrarse'
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length < 8) return 'débil';
    if (!/[A-Z]/.test(password)) return 'media';
    if (!/[0-9]/.test(password)) return 'media';
    if (!/[!@#$%^&*]/.test(password)) return 'media';
    return 'fuerte';
  };

  const getColorStrength = (strength) => {
    switch (strength) {
      case 'débil':
        return '#dc2626';
      case 'media':
        return '#d97706';
      case 'fuerte':
        return '#16a34a';
      default:
        return '#374151';
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        
        <View style={styles.formContainer}>
          <Image
            source={require('../assets/escudo-color-gradiente-oscuro.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.title}>Registrarse</Text>

          <View style={styles.form}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={styles.input}
              value={nombre}
              onChangeText={setNombre}
              placeholder="Ej: Bastián Andrés Baeza Sánchez"
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
              autoComplete="name"
            />

            <Text style={styles.label}>Correo institucional</Text>
            <TextInput
              style={styles.input}
              value={correo}
              onChangeText={setCorreo}
              placeholder="usuario@alumnos.ubiobio.cl"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Text style={styles.label}>Contraseña</Text>
            <TextInput
              style={styles.input}
              value={contrasena}
              onChangeText={(text) => {
                setContrasena(text);
                setPasswordStrength(getPasswordStrength(text));
              }}
              placeholder="Contraseña"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoComplete="password-new"
            />

            {contrasena && (
              <Text
                style={[
                  styles.passwordStrength,
                  { color: getColorStrength(passwordStrength) },
                ]}
              >
                Seguridad: {passwordStrength}
              </Text>
            )}

            <Text style={styles.label}>Confirmar contraseña</Text>
            <TextInput
              style={styles.input}
              value={confirmarContrasena}
              onChangeText={setConfirmarContrasena}
              placeholder="Confirmar contraseña"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoComplete="password-new"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    width: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  formContainer: {
    flex: 1,
    marginTop: '40%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 40,
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 120,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e3a8a',
    marginBottom: 20,
  },
  form: {
    width: '100%',
    maxWidth: 360,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 16,
    backgroundColor: '#ffffff',
    color: '#374151',
  },
  passwordStrength: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: -4,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#1e3a8a',
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#1e3a8a',
    fontWeight: '600',
  },
});