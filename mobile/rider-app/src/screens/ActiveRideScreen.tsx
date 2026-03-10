import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Linking } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../config/api';
import MapViewDirections from 'react-native-maps-directions';

const ActiveRideScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params;
  const [booking, setBooking] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState({ latitude: 0, longitude: 0 });

  useEffect(() => {
    fetchBookingDetails();
    const interval = setInterval(fetchBookingDetails, 5000);
    return () => clearInterval(interval);
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking:', error);
    }
  };

  const handleCallUser = () => {
    if (booking?.user?.mobileNumber) {
      Linking.openURL(`tel:${booking.user.mobileNumber}`);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, null, { params: { status } });
      fetchBookingDetails();
    } catch (error: any) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleArrived = () => {
    Alert.alert(
      'Confirm Arrival',
      'Have you arrived at the pickup location?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, Arrived',
          onPress: () => handleUpdateStatus('RIDER_ARRIVED'),
        },
      ]
    );
  };

  const handleStartRide = () => {
    Alert.alert(
      'Start Ride',
      'Is the user ready to start the ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Ride',
          onPress: () => handleUpdateStatus('IN_PROGRESS'),
        },
      ]
    );
  };

  const handleCompleteRide = () => {
    Alert.alert(
      'Complete Ride',
      'Have you reached the destination?',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await handleUpdateStatus('COMPLETED');
            navigation.replace('RiderHome');
          },
        },
      ]
    );
  };

  const getStatusText = () => {
    switch (booking?.status) {
      case 'ACCEPTED':
        return 'Navigate to Pickup';
      case 'RIDER_ARRIVED':
        return 'Waiting for User';
      case 'IN_PROGRESS':
        return 'Ride in Progress';
      default:
        return 'Active Ride';
    }
  };

  if (!booking) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  const destination = booking.status === 'IN_PROGRESS' 
    ? { latitude: booking.dropLatitude, longitude: booking.dropLongitude }
    : { latitude: booking.pickupLatitude, longitude: booking.pickupLongitude };

  return (
    <View className="flex-1">
      <MapView
        className="flex-1"
        region={{
          latitude: booking.pickupLatitude || 28.6139,
          longitude: booking.pickupLongitude || 77.2090,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={{
            latitude: booking.pickupLatitude,
            longitude: booking.pickupLongitude,
          }}
          pinColor="green"
          title="Pickup"
        />
        <Marker
          coordinate={{
            latitude: booking.dropLatitude,
            longitude: booking.dropLongitude,
          }}
          pinColor="red"
          title="Drop"
        />
        {currentLocation.latitude !== 0 && (
          <Marker
            coordinate={currentLocation}
            title="You"
          >
            <View className="bg-blue-600 p-2 rounded-full">
              <Text className="text-white text-xl">🏍️</Text>
            </View>
          </Marker>
        )}
      </MapView>

      <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 shadow-lg">
        <Text className="text-2xl font-bold text-gray-900 mb-2">{getStatusText()}</Text>
        
        <View className="mb-4">
          <Text className="text-gray-600 mb-1">
            {booking.user?.fullName || 'User'}
          </Text>
          <Text className="text-gray-500 text-sm">
            {booking.serviceType} • {booking.estimatedDistance?.toFixed(1)} km
          </Text>
          <Text className="text-lg font-bold text-blue-600 mt-2">
            Fare: ₹{booking.finalFare || booking.estimatedFare}
          </Text>
        </View>

        <View className="flex-row space-x-3 mb-3">
          <TouchableOpacity
            className="flex-1 bg-blue-600 rounded-lg py-3 items-center"
            onPress={handleCallUser}
          >
            <Text className="text-white font-semibold">Call User</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            className="flex-1 bg-gray-200 rounded-lg py-3 items-center"
            onPress={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`;
              Linking.openURL(url);
            }}
          >
            <Text className="text-gray-900 font-semibold">Navigate</Text>
          </TouchableOpacity>
        </View>

        {booking.status === 'ACCEPTED' && (
          <TouchableOpacity
            className="bg-green-600 rounded-lg py-4 items-center"
            onPress={handleArrived}
          >
            <Text className="text-white font-semibold text-base">I've Arrived</Text>
          </TouchableOpacity>
        )}

        {booking.status === 'RIDER_ARRIVED' && (
          <TouchableOpacity
            className="bg-green-600 rounded-lg py-4 items-center"
            onPress={handleStartRide}
          >
            <Text className="text-white font-semibold text-base">Start Ride</Text>
          </TouchableOpacity>
        )}

        {booking.status === 'IN_PROGRESS' && (
          <TouchableOpacity
            className="bg-green-600 rounded-lg py-4 items-center"
            onPress={handleCompleteRide}
          >
            <Text className="text-white font-semibold text-base">Complete Ride</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ActiveRideScreen;
