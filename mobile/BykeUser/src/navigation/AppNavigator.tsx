import React from 'react';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootState } from '../store';

import LoginScreen from '../features/auth/screens/LoginScreen';
import UserHomeScreen from '../features/user/screens/HomeScreen';
import SelectRideScreen from '../features/user/screens/SelectRideScreen';
import BidsScreen from '../features/user/screens/BidsScreen';
import TrackingScreen from '../features/user/screens/TrackingScreen';
import ChatScreen from '../features/user/screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="UserHome" component={UserHomeScreen} />
            <Stack.Screen name="SelectRide" component={SelectRideScreen} />
            <Stack.Screen name="UserBids" component={BidsScreen} />
            <Stack.Screen name="UserTracking" component={TrackingScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
