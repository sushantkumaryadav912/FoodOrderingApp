import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import LoadingIndicator from '../../components/LoadingIndicator';

const ORDER_STATUSES = {
  pending: { label: 'Pending', color: '#FFA500', icon: 'time-outline' },
  confirmed: { label: 'Confirmed', color: '#4A90E2', icon: 'checkmark-circle-outline' },
  preparing: { label: 'Preparing', color: '#FF6B35', icon: 'restaurant-outline' },
  ready: { label: 'Ready', color: '#32CD32', icon: 'bag-check-outline' },
  delivered: { label: 'Delivered', color: '#28A745', icon: 'checkmark-done-outline' },
  cancelled: { label: 'Cancelled', color: '#DC3545', icon: 'close-circle-outline' },
};

export default function RestaurantOrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Query orders that contain items from this restaurant
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter orders that contain items from this restaurant
      const restaurantOrders = allOrders.filter(order => 
        order.items && order.items.some(item => item.ownerId === user.uid)
      );

      setOrders(restaurantOrders);
      setLoading(false);
      setRefreshing(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders.');
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date(),
      });
      Alert.alert('Success', `Order status updated to ₹{ORDER_STATUSES[newStatus].label}`);
      setModalVisible(false);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status.');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getOrderValue = (order) => {
    // Calculate value of items from this restaurant only
    const restaurantItems = order.items.filter(item => item.ownerId === user.uid);
    return restaurantItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const renderOrderItem = ({ item: order }) => {
    const restaurantItems = order.items.filter(item => item.ownerId === user.uid);
    const orderValue = getOrderValue(order);
    const status = ORDER_STATUSES[order.status] || ORDER_STATUSES.pending;

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => {
          setSelectedOrder(order);
          setModalVisible(true);
        }}
        activeOpacity={0.8}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Order #{order.id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderTime}>{formatTimestamp(order.timestamp)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Ionicons name={status.icon} size={16} color="#FFFFFF" />
            <Text style={styles.statusText}>{status.label}</Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <Text style={styles.customerEmail}>{order.customerEmail || 'Customer'}</Text>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.itemCount}>{restaurantItems.length} item(s)</Text>
          <Text style={styles.orderTotal}>₹{orderValue.toFixed(2)}</Text>
        </View>

        <View style={styles.itemsPreview}>
          {restaurantItems.slice(0, 2).map((item, index) => (
            <Text key={index} style={styles.itemPreview}>
              {item.quantity}x {item.name}
            </Text>
          ))}
          {restaurantItems.length > 2 && (
            <Text style={styles.moreItems}>+{restaurantItems.length - 2} more items</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderModal = () => {
    if (!selectedOrder) return null;

    const restaurantItems = selectedOrder.items.filter(item => item.ownerId === user.uid);
    const orderValue = getOrderValue(selectedOrder);
    const currentStatus = selectedOrder.status || 'pending';

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Details</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Order Information</Text>
                <Text style={styles.modalText}>Order ID: #{selectedOrder.id.slice(-6).toUpperCase()}</Text>
                <Text style={styles.modalText}>Customer: {selectedOrder.customerEmail}</Text>
                <Text style={styles.modalText}>Time: {formatTimestamp(selectedOrder.timestamp)}</Text>
                <Text style={styles.modalText}>Total: ₹{orderValue.toFixed(2)}</Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Items Ordered</Text>
                {restaurantItems.map((item, index) => (
                  <View key={index} style={styles.modalItem}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemDetails}>
                      {item.quantity}x ₹{item.price.toFixed(2)} = ₹{(item.quantity * item.price).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.sectionTitle}>Update Status</Text>
                <View style={styles.statusButtons}>
                  {Object.entries(ORDER_STATUSES).map(([status, config]) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusButton,
                        { backgroundColor: config.color },
                        currentStatus === status && styles.activeStatus
                      ]}
                      onPress={() => updateOrderStatus(selectedOrder.id, status)}
                    >
                      <Ionicons name={config.icon} size={18} color="#FFFFFF" />
                      <Text style={styles.statusButtonText}>{config.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return <LoadingIndicator message="Loading orders..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Incoming Orders</Text>
        <Text style={styles.headerSubtitle}>{orders.length} orders total</Text>
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#CCC" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptySubtitle}>Orders from customers will appear here</Text>
          </View>
        }
        contentContainerStyle={orders.length === 0 ? styles.emptyList : styles.ordersList}
      />

      {renderOrderModal()}
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  orderTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerEmail: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  itemsPreview: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
  itemPreview: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 0,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 400,
  },
  modalSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  modalItem: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  modalItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  modalItemDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  activeStatus: {
    opacity: 0.7,
  },
  statusButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
