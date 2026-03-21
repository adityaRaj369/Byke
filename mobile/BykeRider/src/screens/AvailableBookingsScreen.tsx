import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { setAvailableBookings, addBid } from '../store/slices/riderSlice';
import api from '../config/api';
import { Bike, Package, ShoppingBag, MapPin, ChevronRight, Clock, ArrowLeft, Send } from 'lucide-react-native';

const AvailableBookingsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  const [bidAmounts, setBidAmounts] = useState<{[key: string]: string}>({});
  const { availableBookings } = useSelector((state: RootState) => state.rider) as any;

  const fetchAvailableBookings = async () => {
    setLoading(true);
    try {
      // Mock available bookings - in real app, fetch from backend
      const mockBookings = [
        {
          id: '1',
          type: 'ride',
          status: 'bidding',
          pickupLocation: { address: 'Connaught Place, Delhi', latitude: 28.6315, longitude: 77.2167 },
          dropLocation: { address: 'India Gate, Delhi', latitude: 28.6129, longitude: 77.2295 },
          estimatedFare: 120,
          user: { id: '1', name: 'Rahul Sharma', phone: '+919876543210' },
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          type: 'errand',
          status: 'bidding',
          pickupLocation: { address: 'Khan Market, Delhi', latitude: 28.5984, longitude: 77.2319 },
          dropLocation: { address: 'Lajpat Nagar, Delhi', latitude: 28.5677, longitude: 77.2431 },
          description: 'Buy groceries from Big Bazaar',
          estimatedFare: 80,
          user: { id: '2', name: 'Priya Singh', phone: '+919876543211' },
          createdAt: new Date().toISOString(),
        },
      ];
      dispatch(setAvailableBookings(mockBookings as any));
    } catch (error) {
      console.log('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableBookings();
  }, []);

  const handlePlaceBid = async (bookingId: string) => {
    const bidAmount = bidAmounts[bookingId];
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bid amount');
      return;
    }

    try {
      const response = await api.post('/bids', null, {
        params: {
          bookingId,
          bidAmount: parseFloat(bidAmount),
        }
      });

      dispatch(addBid(response.data));
      Alert.alert('Success', 'Bid placed successfully!');
      
      // Clear bid amount
      setBidAmounts(prev => ({ ...prev, [bookingId]: '' }));
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to place bid');
    }
  };

  const getServiceInfo = (type: string) => {
    switch (type) {
      case 'ride': return { icon: Bike, color: '#EAB308', label: 'Ride' };
      case 'errand': return { icon: ShoppingBag, color: '#10B981', label: 'Errand' };
      case 'parcel': return { icon: Package, color: '#3B82F6', label: 'Parcel' };
      default: return { icon: Bike, color: '#6B7280', label: type };
    }
  };

  const renderBooking = ({ item }: any) => {
    const service = getServiceInfo(item.type);
    const bidAmount = bidAmounts[item.id] || '';

    return (
      <View className="bg-white rounded-[32px] p-6 mb-6 border border-gray-100 shadow-sm shadow-black/5">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <View 
              className="w-12 h-12 rounded-2xl items-center justify-center mr-3"
              style={{ backgroundColor: `${service.color}15` }}
            >
              <service.icon size={22} color={service.color} strokeWidth={2.5} />
            </View>
            <View>
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{service.label}</Text>
              <Text className="text-base font-black text-black">₹{item.estimatedFare}</Text>
            </View>
          </View>
          <View className="items-end">
            <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <Clock size={12} color="#9CA3AF" />
              <Text className="text-[10px] font-black text-gray-500 ml-1 uppercase">
                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-green-500 mr-4 shadow-sm shadow-green-500" />
            <Text className="flex-1 text-sm font-bold text-gray-600 truncate" numberOfLines={1}>{item.pickupLocation.address}</Text>
          </View>
          <View className="w-[2px] h-6 bg-gray-100 ml-1.5 my-1" />
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-red-500 mr-4 shadow-sm shadow-red-500" />
            <Text className="flex-1 text-sm font-bold text-gray-600 truncate" numberOfLines={1}>{item.dropLocation.address}</Text>
          </View>
        </View>

        {item.description && (
          <View className="bg-gray-50 p-4 rounded-2xl mb-6 border border-gray-100">
            <Text className="text-xs font-bold text-gray-500 italic">“{item.description}”</Text>
          </View>
        )}

        <View className="h-[1px] bg-gray-50 mb-6" />

        <View className="flex-row items-center space-x-3">
          <View className="flex-1 flex-row items-center bg-gray-50 rounded-3xl px-5 py-1 border border-gray-100 mr-3">
            <Text className="text-sm font-black text-gray-400 mr-2">₹</Text>
            <TextInput
              className="flex-1 h-12 text-black font-black text-lg"
              placeholder="Your Bid"
              placeholderTextColor="#D1D5DB"
              value={bidAmount}
              onChangeText={(text: string) => setBidAmounts(prev => ({ ...prev, [item.id]: text }))}
              keyboardType="numeric"
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => handlePlaceBid(item.id)}
            className="bg-black w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-black/20"
          >
            <Send size={20} color="white" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-4 pb-6 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mr-4"
          >
            <ArrowLeft size={24} color="black" strokeWidth={2.5} />
          </TouchableOpacity>
          <View>
            <Text className="text-2xl font-black text-black">New Orders</Text>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Nearby Bookings</Text>
          </View>
        </View>
        <View className="bg-yellow-400 px-3 py-1 rounded-full">
          <Text className="text-[10px] font-black text-black uppercase tracking-tighter">{availableBookings.length} Live</Text>
        </View>
      </View>

      <FlatList
        data={availableBookings}
        renderItem={renderBooking}
        keyExtractor={(item: any) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchAvailableBookings} tintColor="#EAB308" />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-24 px-10">
            <View className="bg-gray-50 p-10 rounded-[50px] mb-8 border border-gray-100">
              <Bike size={64} color="#D1D5DB" strokeWidth={1.5} />
            </View>
            <Text className="text-xl font-black text-black mb-2">Quiet neighborhood?</Text>
            <Text className="text-gray-400 text-center font-bold leading-5">
              We couldn't find any orders near you right now. Stay online to get notified instantly!
            </Text>
          </View>
        }
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        className="flex-1"
      />
    </SafeAreaView>
  );
};

export default AvailableBookingsScreen;
