import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';

// Screens
import LoginScreen from '../screens/LoginScreen';
import RiderApplicationScreen from '../screens/RiderApplicationScreen';
import RiderHomeScreen from '../screens/RiderHomeScreen';
import AvailableBookingsScreen from '../screens/AvailableBookingsScreen';
import PlaceBidScreen from '../screens/PlaceBidScreen';
import ActiveRideScreen from '../screens/ActiveRideScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import EarningsScreen from '../screens/EarningsScreen';
import MyRidesScreen from '../screens/MyRidesScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
      }}
    >
      <Tab.Screen
        name="RiderHome"
        component={RiderHomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="MyRides"
        component={MyRidesScreen}
        options={{
          tabBarLabel: 'My Rides',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>🏍️</Text>,
        }}
      />
      <Tab.Screen
        name="Earnings"
        component={EarningsScreen}
        options={{
          tabBarLabel: 'Earnings',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>💰</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: { backgroundColor: '#2563eb' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="RiderApplication"
          component={RiderApplicationScreen}
          options={{ title: 'Rider Application' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AvailableBookings"
          component={AvailableBookingsScreen}
          options={{ title: 'Available Bookings' }}
        />
        <Stack.Screen
          name="PlaceBid"
          component={PlaceBidScreen}
          options={{ title: 'Place Your Bid' }}
        />
        <Stack.Screen
          name="ActiveRide"
          component={ActiveRideScreen}
          options={{ title: 'Active Ride' }}
        />
        <Stack.Screen
          name="Documents"
          component={DocumentsScreen}
          options={{ title: 'Documents' }}
        />
        <Stack.Screen
          name="Subscription"
          component={SubscriptionScreen}
          options={{ title: 'Subscription' }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
