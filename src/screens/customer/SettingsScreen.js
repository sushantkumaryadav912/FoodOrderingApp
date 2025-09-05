import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Auth context listener will handle navigation to the login screen
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="person-circle-outline" size={80} color="#333" />
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Account Details</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="receipt-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Order History</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#CCC" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#666" />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="#CCC" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={handleSignOut}
      >
        <Text style={styles.signOutButtonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  emailText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 10,
  },
  menu: {
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 20,
    fontSize: 16,
    color: '#333',
  },
  signOutButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
