import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setAvailableBookings, addAvailableBooking } from '../store/slices/riderSlice';
import { AppDispatch, RootState } from '../store';
import io from 'socket.io-client';

const AvailableBookingsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { availableBookings, profile } = useSelector((state: RootState) => state.rider);

  useEffect(() => {
    if (!profile) return;

    const socket = io('http://localhost:8080', {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      socket.emit('subscribe', `/topic/rider/${profile.id}/bookings`);
    });

    socket.on(`/topic/rider/${profile.id}/bookings`, (booking: any) => {
      dispatch(addAvailableBooking(booking));
    });

    return () => {
      socket.disconnect();
    };
  }, [profile]);

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'RIDE':
        return '🏍️';
      case 'ERRAND':
        return '🛒';
      case 'PARCEL':
        return '📦';
      default:
        return '📋';
    }
  };

  const calculateDistance = (booking: any) => {
    return (booking.estimatedDistance || 5).toFixed(1);
  };

  const renderBookingItem = ({ item }: any) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
      onPress={() => navigation.navigate('BookingDetail', { booking: item })}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center">
          <Text className="text-3xl mr-3">{getServiceIcon(item.serviceType)}</Text>
          <View>
            <Text className="text-lg font-bold text-gray-900">{item.serviceType}</Text>
            <Text className="text-gray-600 text-sm">{calculateDistance(item)} km away</Text>
          </View>
        </View>
        <View className="bg-blue-100 px-3 py-1 rounded-full">
          <Text className="text-blue-800 font-semibold text-sm">
            ₹{item.estimatedFare?.toFixed(0) || '0'}
          </Text>
        </View>
      </View>

      <View className="mb-2">
        <Text className="text-gray-600 text-sm mb-1">📍 Pickup</Text>
        <Text className="text-gray-900" numberOfLines={1}>{item.pickupAddress}</Text>
      </View>

      <View className="mb-3">
        <Text className="text-gray-600 text-sm mb-1">📍 Drop</Text>
        <Text className="text-gray-900" numberOfLines={1}>{item.dropAddress}</Text>
      </View>

      {item.errandDescription && (
        <View className="bg-gray-50 rounded p-2 mb-3">
          <Text className="text-gray-600 text-sm">Errand: {item.errandDescription}</Text>
        </View>
      )}

      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <Text className="text-gray-500 text-sm">
          {item.biddingWindowSeconds}s bidding window
        </Text>
        <TouchableOpacity
          className="bg-blue-600 rounded-lg px-6 py-2"
          onPress={() => navigation.navigate('PlaceBid', { booking: item })}
        >
          <Text className="text-white font-semibold">Place Bid</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6">
        <Text className="text-white text-2xl font-bold">Available Bookings</Text>
        <Text className="text-blue-100 mt-1">
          {availableBookings.length} bookings nearby
        </Text>
      </View>

      {availableBookings.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">🔍</Text>
          <Text className="text-gray-900 text-lg font-semibold mb-2">No bookings available</Text>
          <Text className="text-gray-600 text-center">
            New bookings will appear here when users request rides nearby
          </Text>
        </View>
      ) : (
        <FlatList
          data={availableBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

export default AvailableBookingsScreen;
