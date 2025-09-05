import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  Alert, ActivityIndicator, ScrollView, Image 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

// Azure Blob Storage configuration
const AZURE_STORAGE_ACCOUNT = 'your_storage_account';
const AZURE_CONTAINER = 'menu-images';
const AZURE_SAS_TOKEN = 'your_sas_token'; 

export default function EditItemScreen({ route, navigation }) {
  const { item } = route.params;
  
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState(item.price.toString());
  const [imageUrl, setImageUrl] = useState(item.imageUrl);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageSource, setImageSource] = useState('url'); // 'url' or 'upload'

  const uploadToAzure = async (uri) => {
    try {
      setUploading(true);
      
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Generate unique filename
      const filename = `dish_${item.id}_${Date.now()}.jpg`;
      
      // Azure Blob Storage URL
      const azureUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${filename}?${AZURE_SAS_TOKEN}`;
      
      // Upload to Azure
      const uploadResponse = await fetch(azureUrl, {
        method: 'PUT',
        body: blob,
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': 'image/jpeg',
        },
      });

      if (uploadResponse.ok) {
        // Remove SAS token for public URL
        const publicUrl = `https://${AZURE_STORAGE_ACCOUNT}.blob.core.windows.net/${AZURE_CONTAINER}/${filename}`;
        setImageUrl(publicUrl);
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Azure upload error:', error);
      Alert.alert('Upload Failed', 'Failed to upload image to Azure. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your photos.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadToAzure(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const takePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant permission to access your camera.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadToAzure(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Select Image Source',
      'Choose how you want to add an image',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleUpdateItem = async () => {
    if (!name.trim() || !price.trim() || !description.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }

    setLoading(true);
    try {
      const itemRef = doc(db, 'menuItems', item.id);
      await updateDoc(itemRef, {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        imageUrl: imageUrl || 'https://via.placeholder.com/300.png?text=No+Image',
        updatedAt: new Date(),
      });
      
      Alert.alert('Success', 'Menu item has been updated.');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Could not update the item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Item Name *</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter dish name"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your dish..."
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Price (₹) *</Text>
        <TextInput
          style={styles.input}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />

        <Text style={styles.label}>Dish Image</Text>
        
        {/* Image Source Toggle */}
        <View style={styles.imageSourceToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, imageSource === 'url' && styles.toggleButtonActive]}
            onPress={() => setImageSource('url')}
          >
            <Ionicons name="link" size={20} color={imageSource === 'url' ? '#FFFFFF' : '#FF6B35'} />
            <Text style={[styles.toggleText, imageSource === 'url' && styles.toggleTextActive]}>
              URL
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, imageSource === 'upload' && styles.toggleButtonActive]}
            onPress={() => setImageSource('upload')}
          >
            <Ionicons name="cloud-upload" size={20} color={imageSource === 'upload' ? '#FFFFFF' : '#FF6B35'} />
            <Text style={[styles.toggleText, imageSource === 'upload' && styles.toggleTextActive]}>
              Upload
            </Text>
          </TouchableOpacity>
        </View>

        {imageSource === 'url' ? (
          <TextInput
            style={styles.input}
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder="https://example.com/image.jpg"
            autoCapitalize="none"
            keyboardType="url"
          />
        ) : (
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.buttonDisabled]}
            onPress={showImageOptions}
            disabled={uploading}
          >
            <Ionicons name="camera" size={24} color="#FFFFFF" />
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : 'Take Photo or Choose from Gallery'}
            </Text>
            {uploading && <ActivityIndicator color="#FFFFFF" style={{ marginLeft: 10 }} />}
          </TouchableOpacity>
        )}

        {/* Image Preview */}
        {imageUrl ? (
          <View style={styles.imagePreviewContainer}>
            <Text style={styles.previewLabel}>Image Preview:</Text>
            <Image
              source={{ uri: imageUrl }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setImageUrl('')}
            >
              <Ionicons name="trash" size={16} color="#FFFFFF" />
              <Text style={styles.removeImageText}>Remove Image</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.button, (loading || uploading) && styles.buttonDisabled]}
          onPress={handleUpdateItem}
          disabled={loading || uploading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Save Changes</Text>
            </>
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
  imageSourceToggle: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#FF6B35',
  },
  toggleText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B35',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  uploadButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    marginBottom: 20,
  },
  previewLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  removeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF4757',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  button: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#FFA07A',
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
