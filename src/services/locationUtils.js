import * as Location from 'expo-location';

export async function checkLocationPermission() {
  const { status } = await Location.getForegroundPermissionsAsync();
  if (status === 'granted') return true;
  const { status: reqStatus } = await Location.requestForegroundPermissionsAsync();
  return reqStatus === 'granted';
}
