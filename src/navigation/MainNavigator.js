import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

// Customer Screens
import MenuScreen from '../screens/customer/MenuScreen';
import CartScreen from '../screens/customer/CartScreen';
import OrderSummaryScreen from '../screens/customer/OrderSummaryScreen';
import SettingsScreen from '../screens/customer/SettingsScreen'; // New Screen

// Restaurant Screens
import RestaurantMenuScreen from '../screens/restaurant/RestaurantMenuScreen';
import AddItemScreen from '../screens/restaurant/AddItemScreen';
import EditItemScreen from '../screens/restaurant/EditItemScreen';

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

// A Stack for the "Home" tab to handle navigation from Menu -> Cart -> Summary
const HomeStackNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Food Menu' }} />
    <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Your Cart' }} />
    <Stack.Screen name="OrderSummary" component={OrderSummaryScreen} options={{ title: 'Confirm Order' }} />
  </Stack.Navigator>
);

// A Stack for the "Settings" tab
const SettingsStackNavigator = () => (
    <Stack.Navigator screenOptions={commonScreenOptions}>
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </Stack.Navigator>
);

// The main Bottom Tab Navigator for Customers
const CustomerTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false, // The header is handled by the StackNavigators inside each tab
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'HomeTab') {
          iconName = focused ? 'home' : 'home-outline';
        } else if (route.name === 'SettingsTab') {
          iconName = focused ? 'settings' : 'settings-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#FF6B35',
      tabBarInactiveTintColor: 'gray',
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: 'bold',
      },
      tabBarStyle: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#EEEEEE',
        height: 60,
        paddingBottom: 5,
        paddingTop: 5,
      }
    })}
  >
    <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ tabBarLabel: 'Home' }} />
    <Tab.Screen name="SettingsTab" component={SettingsStackNavigator} options={{ tabBarLabel: 'Settings' }} />
  </Tab.Navigator>
);


// The Stack Navigator for Restaurants (remains unchanged)
const RestaurantNavigator = () => (
  <Stack.Navigator screenOptions={commonScreenOptions}>
    <Stack.Screen name="RestaurantMenu" component={RestaurantMenuScreen} options={{ title: 'Manage Your Menu' }} />
    <Stack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'Add New Item' }} />
    <Stack.Screen name="EditItem" component={EditItemScreen} options={{ title: 'Edit Item' }} />
  </Stack.Navigator>
);

export default function MainNavigator() {
  const { userData } = useAuth();

  if (!userData) {
    return <CustomerTabNavigator />; // Failsafe
  }

  if (userData.role === 'restaurant') {
    return <RestaurantNavigator />;
  }
  
  return <CustomerTabNavigator />;
}
