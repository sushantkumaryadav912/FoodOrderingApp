import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export default function RestaurantSettingsScreen({ navigation }) {
  const { user, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Restaurant profile state
  const [restaurantName, setRestaurantName] = useState('');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Focus states for styling
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    loadRestaurantProfile();
  }, []);

  const loadRestaurantProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const restaurantDocRef = doc(db, 'restaurants', user.uid);
      const restaurantDoc = await getDoc(restaurantDocRef);
      
      if (restaurantDoc.exists()) {
        const data = restaurantDoc.data();
        setRestaurantName(data.restaurantName || '');
        setDescription(data.description || '');
        setPhoneNumber(data.phoneNumber || '');
        setAddress(data.address || '');
        setCuisine(data.cuisine || '');
        setOpeningHours(data.openingHours || '');
        setOwnerName(data.ownerName || '');
      }
    } catch (error) {
      console.error('Error loading restaurant profile:', error);
      Alert.alert('Error', 'Failed to load restaurant profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!restaurantName.trim()) {
      Alert.alert('Required Field', 'Restaurant name is required.');
      return;
    }

    setSaveLoading(true);
    try {
      const restaurantData = {
        restaurantName: restaurantName.trim(),
        description: description.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        cuisine: cuisine.trim(),
        openingHours: openingHours.trim(),
        ownerName: ownerName.trim(),
        updatedAt: new Date(),
        ownerId: user.uid,
      };

      const restaurantDocRef = doc(db, 'restaurants', user.uid);
      const restaurantDoc = await getDoc(restaurantDocRef);

      if (restaurantDoc.exists()) {
        await updateDoc(restaurantDocRef, restaurantData);
      } else {
        await setDoc(restaurantDocRef, {
          ...restaurantData,
          createdAt: new Date(),
        });
      }

      Alert.alert('Success', 'Restaurant profile updated successfully!');
      setEditingProfile(false);
    } catch (error) {
      console.error('Error saving restaurant profile:', error);
      Alert.alert('Error', 'Failed to save restaurant profile. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Password Mismatch', 'New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return;
    }

    setSaveLoading(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      Alert.alert('Success', 'Password updated successfully!');
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
      let errorMessage = 'Failed to change password. Please try again.';
      
      switch (error.code) {
        case 'auth/wrong-password':
          errorMessage = 'Current password is incorrect.';
          break;
        case 'auth/weak-password':
          errorMessage = 'New password is too weak.';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Please log out and log back in before changing your password.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Password Change Failed', errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderInputField = (label, value, onChangeText, placeholder, multiline = false, keyboardType = 'default', secureTextEntry = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        focusedField === label && styles.inputWrapperFocused,
        multiline && styles.multilineWrapper
      ]}>
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          onFocus={() => setFocusedField(label)}
          onBlur={() => setFocusedField(null)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Loading restaurant profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileIcon}>
            <Ionicons name="storefront" size={40} color="#FF6B35" />
          </View>
          <Text style={styles.headerTitle}>Restaurant Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your restaurant profile and details</Text>
        </View>

        {/* Restaurant Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Restaurant Information</Text>
            <TouchableOpacity
              onPress={() => setEditingProfile(!editingProfile)}
              style={styles.editButton}
            >
              <Ionicons 
                name={editingProfile ? 'close' : 'pencil'} 
                size={20} 
                color="#FF6B35" 
              />
            </TouchableOpacity>
          </View>

          {editingProfile ? (
            <View style={styles.formContainer}>
              {renderInputField(
                'Restaurant Name *',
                restaurantName,
                setRestaurantName,
                'Enter your restaurant name'
              )}

              {renderInputField(
                'Description',
                description,
                setDescription,
                'Tell customers about your restaurant...',
                true
              )}

              {renderInputField(
                'Owner/Manager Name',
                ownerName,
                setOwnerName,
                'Your name'
              )}

              {renderInputField(
                'Phone Number',
                phoneNumber,
                setPhoneNumber,
                '+1 (555) 123-4567',
                false,
                'phone-pad'
              )}

              {renderInputField(
                'Address',
                address,
                setAddress,
                'Restaurant address',
                true
              )}

              {renderInputField(
                'Cuisine Type',
                cuisine,
                setCuisine,
                'e.g., Italian, Chinese, Fast Food'
              )}

              {renderInputField(
                'Opening Hours',
                openingHours,
                setOpeningHours,
                'e.g., Mon-Sun: 9:00 AM - 10:00 PM'
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setEditingProfile(false);
                    loadRestaurantProfile(); // Reset fields
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, saveLoading && styles.buttonDisabled]}
                  onPress={handleSaveProfile}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileDisplay}>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Restaurant Name</Text>
                <Text style={styles.profileValue}>
                  {restaurantName || 'Not provided'}
                </Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Owner</Text>
                <Text style={styles.profileValue}>{ownerName || 'Not provided'}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Phone</Text>
                <Text style={styles.profileValue}>{phoneNumber || 'Not provided'}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Address</Text>
                <Text style={styles.profileValue}>{address || 'Not provided'}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Cuisine</Text>
                <Text style={styles.profileValue}>{cuisine || 'Not provided'}</Text>
              </View>
              <View style={styles.profileItem}>
                <Text style={styles.profileLabel}>Hours</Text>
                <Text style={styles.profileValue}>{openingHours || 'Not provided'}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Account Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          
          <View style={styles.accountItem}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <View style={styles.accountItemContent}>
              <Text style={styles.accountItemLabel}>Email</Text>
              <Text style={styles.accountItemValue}>{user?.email}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.accountItem}
            onPress={() => setChangingPassword(!changingPassword)}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <View style={styles.accountItemContent}>
              <Text style={styles.accountItemLabel}>Change Password</Text>
              <Text style={styles.accountItemSubtext}>Update your password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          {changingPassword && (
            <View style={styles.passwordChangeForm}>
              {renderInputField('Current Password', currentPassword, setCurrentPassword, 'Enter current password', false, 'default', true)}
              {renderInputField('New Password', newPassword, setNewPassword, 'Enter new password', false, 'default', true)}
              {renderInputField('Confirm New Password', confirmPassword, setConfirmPassword, 'Confirm new password', false, 'default', true)}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveButton, saveLoading && styles.buttonDisabled]}
                  onPress={handleChangePassword}
                  disabled={saveLoading}
                >
                  {saveLoading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.saveButtonText}>Update</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Actions</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="help-circle-outline" size={20} color="#666" />
            <Text style={styles.actionItemText}>Help & Support</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Ionicons name="document-text-outline" size={20} color="#666" />
            <Text style={styles.actionItemText}>Terms & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionItem, styles.signOutItem]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF4757" />
            <Text style={[styles.actionItemText, styles.signOutText]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Account Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Restaurant member since {userData?.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Unknown'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF5F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FF6B35',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#FFF5F0',
  },
  formContainer: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFFFFF',
  },
  multilineWrapper: {
    paddingVertical: 8,
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 12,
    minHeight: 44,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6C757D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#FFA07A',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileDisplay: {
    marginTop: 8,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  profileLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  profileValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  accountItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  accountItemLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  accountItemValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  accountItemSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  passwordChangeForm: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
  signOutItem: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: '#FF4757',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
