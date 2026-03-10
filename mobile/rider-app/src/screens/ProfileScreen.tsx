import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }: any) => {
  const { profile } = useSelector((state: RootState) => state.rider);
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: '👤', label: 'Personal Information', screen: 'EditProfile' },
    { icon: '🏍️', label: 'Vehicle Details', screen: 'VehicleDetails' },
    { icon: '📄', label: 'Documents', screen: 'Documents' },
    { icon: '💳', label: 'Subscription', screen: 'Subscription' },
    { icon: '💰', label: 'Bank Details', screen: 'BankDetails' },
    { icon: '⭐', label: 'My Ratings', screen: 'Ratings' },
    { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
    { icon: '❓', label: 'Help & Support', screen: 'Support' },
    { icon: '⚙️', label: 'Settings', screen: 'Settings' },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6 pb-12">
        <View className="items-center">
          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-white text-2xl font-bold">{profile?.user?.fullName || 'Rider'}</Text>
          <Text className="text-blue-100 mt-1">{profile?.user?.mobileNumber}</Text>
        </View>
      </View>

      <View className="bg-white rounded-t-3xl -mt-6 p-6">
        <View className="flex-row mb-6">
          <View className="flex-1 bg-blue-50 rounded-lg p-4 mr-2">
            <Text className="text-gray-600 text-sm mb-1">Total Rides</Text>
            <Text className="text-2xl font-bold text-blue-600">{profile?.totalRides || 0}</Text>
          </View>
          <View className="flex-1 bg-yellow-50 rounded-lg p-4 ml-2">
            <Text className="text-gray-600 text-sm mb-1">Rating</Text>
            <Text className="text-2xl font-bold text-yellow-600">
              ⭐ {profile?.averageRating?.toFixed(1) || '5.0'}
            </Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-gray-900">Subscription</Text>
            <View className={`px-3 py-1 rounded-full ${profile?.subscriptionActive ? 'bg-green-100' : 'bg-red-100'}`}>
              <Text className={`text-xs font-semibold ${profile?.subscriptionActive ? 'text-green-800' : 'text-red-800'}`}>
                {profile?.subscriptionActive ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>
          {profile?.subscriptionActive && profile?.subscriptionEndDate && (
            <Text className="text-gray-600 text-sm">
              Valid until: {new Date(profile.subscriptionEndDate).toLocaleDateString()}
            </Text>
          )}
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Vehicle</Text>
          <View className="bg-gray-50 rounded-lg p-4">
            <Text className="text-gray-900 font-semibold">
              {profile?.vehicleMake} {profile?.vehicleModel}
            </Text>
            <Text className="text-gray-600 text-sm mt-1">
              {profile?.vehicleRegistrationNumber} • {profile?.vehicleColor}
            </Text>
          </View>
        </View>

        <View className="space-y-2 mb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-4 flex-row items-center"
              onPress={() => navigation.navigate(item.screen)}
            >
              <Text className="text-2xl mr-4">{item.icon}</Text>
              <Text className="flex-1 text-gray-900 font-medium">{item.label}</Text>
              <Text className="text-gray-400 text-xl">›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="bg-red-600 rounded-lg py-4 items-center"
          onPress={handleLogout}
        >
          <Text className="text-white font-semibold text-base">Logout</Text>
        </TouchableOpacity>

        <View className="mt-6 items-center">
          <Text className="text-gray-500 text-sm">BYKE Rider App</Text>
          <Text className="text-gray-400 text-xs mt-1">Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;
