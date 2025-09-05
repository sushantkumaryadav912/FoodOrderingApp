import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Animated,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  // Animation values (commented out)
  // const fadeAnim = new Animated.Value(0);
  // const slideAnim = new Animated.Value(50);

  // React.useEffect(() => {
  //   Animated.parallel([
  //     Animated.timing(fadeAnim, {
  //       toValue: 1,
  //       duration: 800,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 800,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter both email and password.');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Invalid Password', 'Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // Navigation is handled by the AuthContext listener in AppNavigator
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <LinearGradient
        colors={['#FF6B35', '#FF8A5B', '#FFA07A']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -100}
        >
          {/* <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          > */}
          <View style={styles.content}>
            {/* Logo/Icon Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="restaurant" size={40} color="#FF6B35" />
              </View>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Welcome Back!</Text>
              <Text style={styles.subtitle}>Sign in to order your favorite food</Text>
            </View>

            {/* Input Section */}
            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused
              ]}>
                <Ionicons 
                  name="mail-outline" 
                  size={20} 
                  color={emailFocused ? '#FF6B35' : '#999'} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>

              <View style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={20} 
                  color={passwordFocused ? '#FF6B35' : '#999'} 
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(prev => !prev)}
                  style={styles.eyeIcon}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={loading ? ['#FFA07A', '#FFA07A'] : ['#FF6B35', '#FF8A5B']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Social Login Buttons */}
            <View style={styles.socialLoginContainer}>
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#fff', borderColor: '#4285F4' }]}
                onPress={() => Alert.alert('Coming Soon', 'Google login is under development and will be available soon.')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={22} color="#4285F4" style={{ marginRight: 8 }} />
                <Text style={[styles.socialButtonText, { color: '#4285F4' }]}>Continue with Google</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.socialButton, { backgroundColor: '#fff', borderColor: '#000' }]}
                onPress={() => Alert.alert('Coming Soon', 'Apple login is under development and will be available soon.')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={22} color="#000" style={{ marginRight: 8 }} />
                <Text style={[styles.socialButtonText, { color: '#000' }]}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword} 
              onPress={() => navigation.navigate('ForgotPassword')} 
                activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('SignUp')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* </Animated.View> */}
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  socialLoginContainer: {
    marginBottom: 20,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1.5,
    paddingVertical: 12,
    marginBottom: 12,
    marginHorizontal: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputWrapperFocused: {
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowOpacity: 0.2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 14,
  },
  eyeIcon: {
    padding: 4,
  },
  loginButton: {
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 20,
  },
  buttonGradient: {
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonDisabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPassword: {
    alignSelf: 'center',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#FFFFFF',
    fontSize: 16,
    textDecorationLine: 'underline',
    opacity: 0.9,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  footerLink: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});