import React from 'react';
import { useSelector } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootState } from '../store';

import LoginScreen from '../features/auth/screens/LoginScreen';
import RegisterScreen from '../features/auth/screens/RegisterScreen';
import UserHomeScreen from '../features/user/screens/HomeScreen';
import SelectRideScreen from '../features/user/screens/SelectRideScreen';
import SetPriceScreen from '../features/user/screens/SetPriceScreen';
import BidsScreen from '../features/user/screens/BidsScreen';
import TrackingScreen from '../features/user/screens/TrackingScreen';
import ChatScreen from '../features/user/screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyBookingsScreen from '../screens/MyBookingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import BookingScreen from '../screens/BookingScreen';
import BidSelectionScreen from '../screens/BidSelectionScreen';
import ActiveBookingScreen from '../screens/ActiveBookingScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, needsRegistration } = useSelector((state: RootState) => state.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated && !needsRegistration ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : needsRegistration ? (
          <Stack.Screen name="Register" component={RegisterScreen} />
        ) : (
          <>
            <Stack.Screen name="Home" component={UserHomeScreen} />
            <Stack.Screen name="UserHome" component={UserHomeScreen} />
            <Stack.Screen name="SelectRide" component={SelectRideScreen} />
            <Stack.Screen name="SetPrice" component={SetPriceScreen} />
            <Stack.Screen name="UserBids" component={BidsScreen} />
            <Stack.Screen name="UserTracking" component={TrackingScreen} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="MyBookings" component={MyBookingsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Booking" component={BookingScreen} options={{ headerShown: true, title: 'Book Service' }} />
            <Stack.Screen name="BidSelection" component={BidSelectionScreen} options={{ headerShown: true, title: 'Select Rider' }} />
            <Stack.Screen name="ActiveBooking" component={ActiveBookingScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
