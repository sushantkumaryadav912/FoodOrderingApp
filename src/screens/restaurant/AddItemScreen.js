import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export default function AddItemScreen({ navigation }) {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddItem = async () => {
    if (!name || !price || !description) {
      Alert.alert('Missing Fields', 'Please fill in name, description, and price.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'menuItems'), {
        name,
        description,
        price: parseFloat(price),
        imageUrl: imageUrl || 'https://via.placeholder.com/300.png?text=No+Image', // Default image
        ownerId: user.uid,
        createdAt: new Date(),
      });
      setLoading(false);
      Alert.alert('Success', 'New menu item has been added.');
      navigation.goBack();
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Could not add the item. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Item Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Classic Burger"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="e.g., Juicy beef patty with cheese and lettuce"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>Price ($)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 9.99"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Image URL (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="https://example.com/image.png"
          value={imageUrl}
          onChangeText={setImageUrl}
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleAddItem}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Add Item</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  form: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#FFA07A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
