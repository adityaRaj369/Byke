import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRiderProfile, updateAvailability, updateLocation } from '../store/slices/riderSlice';
import { AppDispatch, RootState } from '../store';
import Geolocation from 'react-native-geolocation-service';

const RiderHomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isAvailable } = useSelector((state: RootState) => state.rider);
  const [locationTracking, setLocationTracking] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchRiderProfile());
  }, []);

  useEffect(() => {
    if (isAvailable) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
  }, [isAvailable]);

  const startLocationTracking = () => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(updateLocation({ latitude, longitude }));
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, distanceFilter: 50, interval: 5000 }
    );
    setLocationTracking(watchId);
  };

  const stopLocationTracking = () => {
    if (locationTracking) {
      Geolocation.clearWatch(locationTracking);
      setLocationTracking(null);
    }
  };

  const handleToggleAvailability = async () => {
    try {
      const newStatus = isAvailable ? 'OFFLINE' : 'AVAILABLE';
      await dispatch(updateAvailability(newStatus)).unwrap();
    } catch (error: any) {
      Alert.alert('Error', error);
    }
  };

  const getStatusColor = () => {
    if (!profile) return 'bg-gray-500';
    switch (profile.status) {
      case 'PENDING':
        return 'bg-yellow-500';
      case 'APPROVED':
        return 'bg-blue-500';
      case 'ACTIVE':
        return 'bg-green-500';
      case 'BANNED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-600">Loading...</Text>
      </View>
    );
  }

  if (profile.status === 'PENDING') {
    return (
      <View className="flex-1 bg-white p-6 justify-center items-center">
        <Text className="text-6xl mb-4">⏳</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-2">Application Under Review</Text>
        <Text className="text-gray-600 text-center mb-6">
          Your rider application is being reviewed by our team. You'll be notified once approved.
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-3 px-6"
          onPress={() => navigation.navigate('Documents')}
        >
          <Text className="text-white font-semibold">View Documents</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6 pb-12">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">
              {profile.user?.fullName || 'Rider'}
            </Text>
            <View className="flex-row items-center mt-1">
              <View className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-400' : 'bg-gray-400'} mr-2`} />
              <Text className="text-blue-100">{isAvailable ? 'Available' : 'Offline'}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => navigation.navigate('Notifications')}
              className="mr-3 bg-blue-500 p-2 rounded-full"
            >
              <Text className="text-xl">🔔</Text>
            </TouchableOpacity>
            <Switch
              value={isAvailable}
              onValueChange={handleToggleAvailability}
              trackColor={{ false: '#cbd5e1', true: '#10b981' }}
              thumbColor={isAvailable ? '#ffffff' : '#f4f4f5'}
            />
          </View>
        </View>

        <View className="flex-row items-center">
          <Text className="text-yellow-400 text-xl mr-1">⭐</Text>
          <Text className="text-white text-lg font-semibold">
            {profile.averageRating?.toFixed(1) || '5.0'}
          </Text>
          <Text className="text-blue-100 ml-2">
            ({profile.totalRides || 0} rides)
          </Text>
        </View>
      </View>

      <View className="bg-white rounded-t-3xl -mt-6 p-6">
        <View className="flex-row mb-6">
          <View className="flex-1 bg-blue-50 rounded-lg p-4 mr-2">
            <Text className="text-gray-600 text-sm mb-1">Today's Earnings</Text>
            <Text className="text-2xl font-bold text-blue-600">₹0</Text>
          </View>
          <View className="flex-1 bg-green-50 rounded-lg p-4 ml-2">
            <Text className="text-gray-600 text-sm mb-1">This Week</Text>
            <Text className="text-2xl font-bold text-green-600">₹0</Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-900">Subscription Status</Text>
            <View className={`px-3 py-1 rounded-full ${profile.subscriptionActive ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`text-xs font-semibold ${profile.subscriptionActive ? 'text-green-800' : 'text-red-800'}`}>
                {profile.subscriptionActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          {profile.subscriptionActive ? (
            <Text className="text-gray-600">
              Valid until: {new Date(profile.subscriptionEndDate).toLocaleDateString()}
            </Text>
          ) : (
            <TouchableOpacity
              className="bg-blue-600 rounded-lg py-3 items-center mt-2"
              onPress={() => navigation.navigate('Subscription')}
            >
              <Text className="text-white font-semibold">Activate Subscription - ₹500/month</Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="space-y-3">
          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-lg p-4 flex-row items-center"
            onPress={() => navigation.navigate('AvailableBookings')}
          >
            <Text className="text-3xl mr-4">📋</Text>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">Available Bookings</Text>
              <Text className="text-gray-600 text-sm">Browse and bid on nearby bookings</Text>
            </View>
            <Text className="text-gray-400 text-xl">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-lg p-4 flex-row items-center"
            onPress={() => navigation.navigate('MyRides')}
          >
            <Text className="text-3xl mr-4">🏍️</Text>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">My Rides</Text>
              <Text className="text-gray-600 text-sm">View your ride history</Text>
            </View>
            <Text className="text-gray-400 text-xl">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-lg p-4 flex-row items-center"
            onPress={() => navigation.navigate('Earnings')}
          >
            <Text className="text-3xl mr-4">💰</Text>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">Earnings</Text>
              <Text className="text-gray-600 text-sm">Track your income</Text>
            </View>
            <Text className="text-gray-400 text-xl">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-white border border-gray-200 rounded-lg p-4 flex-row items-center"
            onPress={() => navigation.navigate('Documents')}
          >
            <Text className="text-3xl mr-4">📄</Text>
            <View className="flex-1">
              <Text className="text-gray-900 font-semibold text-base">Documents</Text>
              <Text className="text-gray-600 text-sm">Manage your documents</Text>
            </View>
            <Text className="text-gray-400 text-xl">›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RiderHomeScreen;
