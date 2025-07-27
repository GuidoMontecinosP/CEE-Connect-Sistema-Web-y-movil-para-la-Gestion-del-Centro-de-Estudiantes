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
import Icon from 'react-native-vector-icons/Ionicons'; // Asegúrate de tener esta librería instalada

export default function Registro() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

    // Validar contraseña fuerte
    if (!isPasswordValid(contrasena)) {
      Alert.alert(
        'Error', 
        'La contraseña debe tener:\n• Mínimo 8 caracteres\n• Al menos 1 mayúscula\n• Al menos 1 minúscula\n• Al menos 1 número\n• Al menos 1 símbolo (!@#$%^&*[]_-.,\'"#$%&/()=)'
      );
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
        'Verifica tu cuenta',
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

  const isPasswordValid = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*\[\]\-_.,'"#$%&/()=]/.test(password)
    );
  };

  const getPasswordStrength = (password) => {
    if (password.length < 8) return 'débil';
    
    let strength = 0;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*\[\]\-_.,'"#$%&/()=]/.test(password)) strength++;
    
    if (strength < 3) return 'débil';
    if (strength === 3) return 'media';
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

  const getPasswordRequirements = (password) => {
    return [
      { text: 'Mínimo 8 caracteres', valid: password.length >= 8 },
      { text: 'Al menos 1 mayúscula', valid: /[A-Z]/.test(password) },
      { text: 'Al menos 1 minúscula', valid: /[a-z]/.test(password) },
      { text: 'Al menos 1 número', valid: /[0-9]/.test(password) },
      { text: 'Al menos 1 símbolo (!@#$%^&*[]_-.,\'"#$%&/()=)', valid: /[!@#$%^&*\[\]\-_.,'"#$%&/()=]/.test(password) },
    ];
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
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={contrasena}
                onChangeText={(text) => {
                  setContrasena(text);
                  setPasswordStrength(getPasswordStrength(text));
                }}
                placeholder="Contraseña"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showPassword}
                autoComplete="password-new"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            {contrasena && (
              <>
                <Text
                  style={[
                    styles.passwordStrength,
                    { color: getColorStrength(passwordStrength) },
                  ]}
                >
                  Seguridad: {passwordStrength}
                </Text>
                
                <View style={styles.requirementsContainer}>
                  {getPasswordRequirements(contrasena).map((req, index) => (
                    <View key={index} style={styles.requirementRow}>
                      <Icon
                        name={req.valid ? 'checkmark-circle' : 'close-circle'}
                        size={16}
                        color={req.valid ? '#16a34a' : '#dc2626'}
                      />
                      <Text
                        style={[
                          styles.requirementText,
                          { color: req.valid ? '#16a34a' : '#dc2626' }
                        ]}
                      >
                        {req.text}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            <Text style={styles.label}>Confirmar contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={confirmarContrasena}
                onChangeText={setConfirmarContrasena}
                placeholder="Confirmar contraseña"
                placeholderTextColor="#9ca3af"
                secureTextEntry={!showConfirmPassword}
                autoComplete="password-new"
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#6b7280"
                />
              </TouchableOpacity>
            </View>

            {confirmarContrasena && contrasena !== confirmarContrasena && (
              <Text style={styles.errorText}>
                Las contraseñas no coinciden
              </Text>
            )}

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
    marginTop: '25%', // Reducido de 40% a 25%
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 40,
    paddingTop: 20, // Aumentado de 0.1 a 20
    paddingBottom: 10,
    alignItems: 'center',
  },
  logo: {
    width: 160, // Reducido de 180 a 160
    height: 100, // Reducido de 120 a 100
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: '#ffffff',
    marginBottom: 4,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: '#374151',
  },
  eyeButton: {
    padding: 12,
  },
  passwordStrength: {
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
    fontWeight: '500',
  },
  requirementsContainer: {
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    marginTop: 4,
    marginBottom: 8,
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