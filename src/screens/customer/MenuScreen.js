import React, { useState, useEffect } from 'react';
import {
  View,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  TextInput
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
  const [searchQuery, setSearchQuery] = useState('');
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
    setTimeout(() => setRefreshing(false), 1000);
  };


  const filteredMenuItems = menuItems.filter(item => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const nameMatch = item.name && item.name.toLowerCase().includes(query);
    const restaurantMatch = item.restaurantName && item.restaurantName.toLowerCase().includes(query);
    return nameMatch || restaurantMatch;
  });

  // Group items by restaurantName
  const groupedByRestaurant = filteredMenuItems.reduce((groups, item) => {
    const key = item.restaurantName || 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});

  const sections = Object.keys(groupedByRestaurant).map(restaurantName => ({
    title: restaurantName,
    data: groupedByRestaurant[restaurantName],
  }));

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItemContainer}>
      <MenuItem item={item} />
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
      <View style={styles.searchBarWrapper}>
        <TextInput
          style={styles.customSearchInput}
          placeholder="Search for items or restaurants..."
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCorrect={false}
          autoCapitalize="none"
          clearButtonMode="while-editing"
        />
      </View>
      <SectionList
        sections={sections}
        renderItem={renderMenuItem}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.restaurantName}>{title}</Text>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ color: '#888', fontSize: 16 }}>No items found.</Text>
          </View>
        }
        stickySectionHeadersEnabled={false}
      />
      {cart.items.length > 0 && (
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Text style={styles.cartButtonText}>
            View Cart ({cart.items.length} items) - ₹{cart.total.toFixed(2)}
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
  searchBarWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  customSearchInput: {
    backgroundColor: '#f1f3f6',
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 17,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    elevation: 1,
  },
  menuItemContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  restaurantName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 4,
    marginLeft: 4,
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
