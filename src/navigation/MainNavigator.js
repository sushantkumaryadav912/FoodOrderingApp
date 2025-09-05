import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet } from 'react-native';

// Customer Screens
import MenuScreen from '../screens/customer/MenuScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrderSummaryScreen from '../screens/customer/OrderSummaryScreen';
import SettingsScreen from '../screens/customer/SettingsScreen';

// Restaurant Screens
import RestaurantMenuScreen from '../screens/restaurant/RestaurantMenuScreen';
import AddItemScreen from '../screens/restaurant/AddItemScreen';
import EditItemScreen from '../screens/restaurant/EditItemScreen';
import RestaurantSettingsScreen from '../screens/restaurant/RestaurantSettingsScreen';
import RestaurantOrdersScreen from '../screens/restaurant/RestaurantOrdersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const commonScreenOptions = {
  headerStyle: {
    backgroundColor: '#FF6B35',
    shadowOpacity: 0,
    elevation: 0,
  },
  headerTintColor: '#FFFFFF',
  headerTitleStyle: {
    fontWeight: 'bold',
    fontSize: 20,
  },
  headerBackTitleVisible: false,
};

// Customer Navigation Stack Navigators
const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Food Menu' }} />
    <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
    <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Confirm Order' }} />
  </Stack.Navigator>
);

const CartStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
    <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Food Menu' }} />
    <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Confirm Order' }} />
  </Stack.Navigator>
);

const SettingsStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
  </Stack.Navigator>
);

// Custom Tab Bar Badge Component for Cart
const TabBarBadge = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{count > 99 ? '99+' : count}</Text>
    </View>
  );
};

// Customer Tab Navigator
const CustomerTabNavigator = () => {
  const { cart } = useCart();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'CartTab') {
            iconName = focused ? 'bag' : 'bag-outline';
          } else if (route.name === 'SettingsTab') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          const IconComponent = (
            <View style={styles.tabIconContainer}>
              <Ionicons name={iconName} size={size} color={color} />
              {route.name === 'CartTab' && <TabBarBadge count={cart.items.length} />}
            </View>
          );
          
          return IconComponent;
        },
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#EEEEEE',
          height: 80,
          paddingBottom: 10,
          paddingTop: 10,
        }
      })}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeStackNavigator} 
        options={{ tabBarLabel: 'Home' }} 
      />
      <Tab.Screen 
        name="CartTab" 
        component={CartStackNavigator} 
        options={{ tabBarLabel: 'Cart' }} 
      />
      <Tab.Screen 
        name="SettingsTab" 
        component={SettingsStackNavigator} 
        options={{ tabBarLabel: 'Settings' }} 
      />
    </Tab.Navigator>
  );
};

// Restaurant Navigation Stack Navigators
const RestaurantMenuStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} options={{ title: 'Your Menu' }} />
    <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Add New Item' }} />
    <Stack.Screen name="EditItem" component={EditItemScreen} options={{ title: 'Edit Item' }} />
  </Stack.Navigator>
);

const RestaurantOrdersStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="RestaurantOrders" component={RestaurantOrdersScreen} options={{ title: 'Orders' }} />
  </Stack.Navigator>
);

const RestaurantSettingsStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="RestaurantSettings" component={RestaurantSettingsScreen} options={{ title: 'Settings' }} />
  </Stack.Navigator>
);

// Restaurant Tab Navigator
const RestaurantTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'MenuTab') {
          iconName = focused ? 'restaurant' : 'restaurant-outline';
        } else if (route.name === 'OrdersTab') {
          iconName = focused ? 'receipt' : 'receipt-outline';
        } else if (route.name === 'RestaurantSettingsTab') {
          iconName = focused ? 'settings' : 'settings-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF6B35',
      tabBarInactiveTintColor: 'gray',
      tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        height: 80,
        paddingBottom: 10,
        paddingTop: 10,
      }
    })}
  >
    <Tab.Screen 
      name="MenuTab" 
      component={RestaurantMenuStackNavigator} 
      options={{ tabBarLabel: 'Menu' }} 
    />
    <Tab.Screen 
      name="OrdersTab" 
      component={RestaurantOrdersStackNavigator} 
      options={{ tabBarLabel: 'Orders' }} 
    />
    <Tab.Screen 
      name="RestaurantSettingsTab" 
      component={RestaurantSettingsStackNavigator} 
      options={{ tabBarLabel: 'Settings' }} 
    />
  </Tab.Navigator>
);

// Main Navigator Component
export default function MainNavigator() {
  const { userData } = useAuth();

  // Fallback to customer navigation if userData is not available yet
  if (!userData) {
    return <CustomerTabNavigator />;
  }

  // Return appropriate navigator based on user role
  if (userData.role === 'restaurant') {
    return <RestaurantTabNavigator />; 
  }
  
  return <CustomerTabNavigator />;
}

const styles = StyleSheet.create({
  tabIconContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#FF6B35',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
