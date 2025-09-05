import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import MenuItem from '../../components/MenuItem';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useCart } from '../../context/CartContext';

export default function MenuScreen({ navigation }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const { cart } = useCart();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'menuItems'),
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMenuItems(items);
        setLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching menu items:', error);
        setError('Failed to load menu items. Please try again.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // The onSnapshot listener will automatically refresh the data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const renderMenuItem = ({ item }) => <MenuItem item={item} />;

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Our Menu</Text>
      <Text style={styles.headerSubtitle}>Choose your favorite dishes</Text>
    </View>
  );

  if (loading) {
    return <LoadingIndicator message="Loading delicious menu..." />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />
      
      {cart.items.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartButtonText}>
            View Cart ({cart.items.length} items) - ${cart.total.toFixed(2)}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff4757',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  cartButton: {
    backgroundColor: '#FF6B35',
    padding: 16,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
