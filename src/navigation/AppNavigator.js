import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import LoadingIndicator from '../components/LoadingIndicator';

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingIndicator message="Initializing..." />;
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
