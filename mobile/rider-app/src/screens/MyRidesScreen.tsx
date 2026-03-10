import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import api from '../config/api';

const MyRidesScreen = ({ navigation }: any) => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/bookings/rider/my-bookings');
      setBookings(response.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS':
      case 'RIDER_ARRIVED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  const filteredBookings = bookings.filter((booking: any) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return booking.status === 'COMPLETED';
    if (filter === 'cancelled') return booking.status === 'CANCELLED';
    return true;
  });

  const renderBookingItem = ({ item }: any) => (
    <TouchableOpacity
      className="bg-white rounded-lg p-4 mb-3 border border-gray-200"
      onPress={() => navigation.navigate('BookingDetail', { booking: item })}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center flex-1">
          <Text className="text-3xl mr-3">{getServiceIcon(item.serviceType)}</Text>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900">{item.serviceType}</Text>
            <Text className="text-gray-600 text-sm">
              {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
            </Text>
          </View>
        </View>
        <View className={`px-3 py-1 rounded-full ${getStatusColor(item.status)}`}>
          <Text className="text-xs font-semibold">{item.status}</Text>
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
        <View className="flex-row items-center">
          <Text className="text-gray-600 text-sm">{item.estimatedDistance?.toFixed(1)} km</Text>
          {item.rating && (
            <>
              <Text className="text-gray-400 mx-2">•</Text>
              <Text className="text-yellow-500 text-sm">⭐ {item.rating}</Text>
            </>
          )}
        </View>
        <Text className="text-lg font-bold text-green-600">
          ₹{item.finalFare || item.estimatedFare}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6">
        <Text className="text-white text-2xl font-bold">My Rides</Text>
        <Text className="text-blue-100 mt-1">{bookings.length} total rides</Text>
      </View>

      <View className="flex-row p-4 bg-white border-b border-gray-200">
        {['all', 'completed', 'cancelled'].map((filterType) => (
          <TouchableOpacity
            key={filterType}
            className={`flex-1 mx-1 py-2 rounded-lg ${
              filter === filterType ? 'bg-blue-600' : 'bg-gray-100'
            }`}
            onPress={() => setFilter(filterType)}
          >
            <Text
              className={`text-center font-semibold capitalize ${
                filter === filterType ? 'text-white' : 'text-gray-600'
              }`}
            >
              {filterType}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-600">Loading...</Text>
        </View>
      ) : filteredBookings.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-6xl mb-4">🏍️</Text>
          <Text className="text-gray-900 text-lg font-semibold mb-2">No rides yet</Text>
          <Text className="text-gray-600 text-center">
            Your completed rides will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
};

export default MyRidesScreen;
