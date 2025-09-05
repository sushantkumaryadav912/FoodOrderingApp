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
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import { LinearGradient } from 'expo-linear-gradient';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }

    if (!validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setEmailSent(true);
      Alert.alert(
        'Reset Email Sent!',
        'A password reset link has been sent to your email address. Please check your inbox (and spam folder) and follow the instructions to reset your password.',
        [
          {
            text: 'Back to Login',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address. Please check your email or create a new account.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please wait a moment before trying again.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Reset Failed', errorMessage);
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
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Logo/Icon Section */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="mail-open" size={40} color="#FF6B35" />
              </View>
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                {emailSent 
                  ? 'Reset email sent! Check your inbox.' 
                  : 'Enter your email address and we\'ll send you a link to reset your password'
                }
              </Text>
            </View>

            {!emailSent && (
              <>
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
                      placeholder="Enter your email address"
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
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                  style={[styles.resetButton, loading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
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
                      <Text style={styles.buttonText}>Send Reset Email</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {emailSent && (
              <View style={styles.successContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                </View>
                <Text style={styles.successText}>
                  We've sent a password reset link to:
                </Text>
                <Text style={styles.emailText}>{email}</Text>
                <Text style={styles.instructionText}>
                  Click the link in your email to reset your password. The link will expire in 1 hour.
                </Text>
                
                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResetPassword}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resendButtonText}>Didn't receive email? Resend</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Login')}
                activeOpacity={0.7}
              >
                <Text style={styles.footerLink}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 1,
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
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
    marginTop: 70,
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
    marginTop: 12,
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 24,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
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
  resetButton: {
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    marginBottom: 30,
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
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  successIcon: {
    marginBottom: 20,
  },
  successText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  emailText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
    marginBottom: 30,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  resendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    textDecorationLine: 'underline',
    fontWeight: '600',
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
