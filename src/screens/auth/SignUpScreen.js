import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
  Dimensions, StatusBar, SafeAreaView, Animated,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer'); // 'customer' or 'restaurant'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

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

  const validatePassword = (password) => {
    // At least 6 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    return passwordRegex.test(password);
  };

  const handleSignUp = async () => {
    // Trim whitespace from inputs
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Validation
    if (!trimmedEmail || !trimmedPassword || !trimmedConfirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (trimmedPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    if (!validatePassword(trimmedPassword)) {
      Alert.alert(
        'Weak Password', 
        'Password must contain at least 6 characters with uppercase, lowercase, and a number.'
      );
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
      const user = userCredential.user;
      
      // Store user role in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      Alert.alert('Success', 'Account created successfully!');
      // Navigation is handled by the AuthContext listener
    } catch (error) {
      let errorMessage = 'An error occurred. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Sign-Up Failed', errorMessage);
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
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : -50}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join us and start ordering delicious food!</Text>
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
                    autoComplete="new-password"
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

                <View style={[
                  styles.inputWrapper,
                  confirmPasswordFocused && styles.inputWrapperFocused
                ]}>
                  <Ionicons 
                    name="shield-checkmark-outline" 
                    size={20} 
                    color={confirmPasswordFocused ? '#FF6B35' : '#999'} 
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Confirm Password"
                    placeholderTextColor="#999"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                    autoComplete="new-password"
                    onFocus={() => setConfirmPasswordFocused(true)}
                    onBlur={() => setConfirmPasswordFocused(false)}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(prev => !prev)}
                    style={styles.eyeIcon}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Role Selector */}
              <View style={styles.roleSelector}>
                <Text style={styles.roleLabel}>I am a:</Text>
                <View style={styles.roleOptions}>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'customer' && styles.roleButtonActive]}
                    onPress={() => setRole('customer')}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="person-outline" 
                      size={20} 
                      color={role === 'customer' ? '#FF6B35' : '#666'} 
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={[styles.roleText, role === 'customer' && styles.roleTextActive]}>
                      Customer
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleButton, role === 'restaurant' && styles.roleButtonActive]}
                    onPress={() => setRole('restaurant')}
                    activeOpacity={0.8}
                  >
                    <Ionicons 
                      name="storefront-outline" 
                      size={20} 
                      color={role === 'restaurant' ? '#FF6B35' : '#666'} 
                      style={{ marginBottom: 4 }}
                    />
                    <Text style={[styles.roleText, role === 'restaurant' && styles.roleTextActive]}>
                      Restaurant
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
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
                    <Text style={styles.buttonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account? </Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.footerLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* </Animated.View> */}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    paddingHorizontal: 24,
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
    marginTop: 25,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
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
    marginBottom: 25,
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
  roleSelector: {
    marginBottom: 30,
  },
  roleLabel: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  roleOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  roleText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  roleTextActive: {
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  signUpButton: {
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
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