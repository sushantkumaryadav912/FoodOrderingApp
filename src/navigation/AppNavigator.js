import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingIndicator from '../components/LoadingIndicator';
import SplashScreen from '../screens/SplashScreen';

export default function AppNavigator() {
  const { user, loading, splashLoading } = useAuth();

  if (splashLoading) {
    return <SplashScreen />;
  }

  if (loading) {
    return <LoadingIndicator message="Initializing..." />;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
