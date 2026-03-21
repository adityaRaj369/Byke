import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, RefreshControl, SafeAreaView, ActivityIndicator } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import api from '../config/api';
import { Clock, MapPin, ChevronRight, ArrowLeft, Bike, ShoppingBag, Package, AlertCircle } from 'lucide-react-native';

const MyBidsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyBids = async () => {
    setLoading(true);
    try {
      const response = await api.get('/rider/my-bids');
      setBids(response.data);
    } catch (error) {
      console.log('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBids();
  }, []);

  const getServiceInfo = (type: string) => {
    switch (type) {
      case 'ride': return { icon: Bike, color: '#EAB308', label: 'Ride' };
      case 'errand': return { icon: ShoppingBag, color: '#10B981', label: 'Errand' };
      case 'parcel': return { icon: Package, color: '#3B82F6', label: 'Parcel' };
      default: return { icon: Bike, color: '#6B7280', label: type };
    }
  };

  const renderBid = ({ item }: any) => {
    const service = getServiceInfo(item.booking?.type || 'ride');
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className="bg-white rounded-[32px] p-6 mb-6 border border-gray-100 shadow-sm shadow-black/5"
        onPress={() => {
          if (item.status === 'ACCEPTED') {
            navigation.navigate('Tracking', { rideId: item.bookingId });
          }
        }}
      >
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
              <Text className="text-base font-black text-black">₹{item.bidAmount}</Text>
            </View>
          </View>
          <View className={`px-3 py-1.5 rounded-xl ${
            item.status === 'ACCEPTED' ? 'bg-green-100' : 
            item.status === 'REJECTED' ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            <Text className={`text-[10px] font-black uppercase tracking-widest ${
              item.status === 'ACCEPTED' ? 'text-green-700' : 
              item.status === 'REJECTED' ? 'text-red-700' : 'text-blue-700'
            }`}>{item.status}</Text>
          </View>
        </View>

        <View className="mb-6">
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-green-500 mr-4 shadow-sm shadow-green-500" />
            <Text className="flex-1 text-sm font-bold text-gray-600 truncate" numberOfLines={1}>
              {item.booking?.pickupAddress || 'Pickup Location'}
            </Text>
          </View>
          <View className="w-[2px] h-6 bg-gray-100 ml-1.5 my-1" />
          <View className="flex-row items-center">
            <View className="w-2.5 h-2.5 rounded-full bg-red-500 mr-4 shadow-sm shadow-red-500" />
            <Text className="flex-1 text-sm font-bold text-gray-600 truncate" numberOfLines={1}>
              {item.booking?.dropAddress || 'Drop Location'}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
          <View className="flex-row items-center">
            <Clock size={14} color="#9CA3AF" />
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Placed {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <ChevronRight size={20} color="#D1D5DB" strokeWidth={3} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-4 pb-6 flex-row items-center">
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 mr-4"
        >
          <ArrowLeft size={24} color="black" strokeWidth={2.5} />
        </TouchableOpacity>
        <View>
          <Text className="text-2xl font-black text-black">My Active Bids</Text>
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Track your offers</Text>
        </View>
      </View>

      <FlatList
        data={bids}
        renderItem={renderBid}
        keyExtractor={(item: any) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchMyBids} tintColor="#EAB308" />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-24 px-10">
            <View className="bg-gray-50 p-10 rounded-[50px] mb-8 border border-gray-100">
              <AlertCircle size={64} color="#D1D5DB" strokeWidth={1.5} />
            </View>
            <Text className="text-xl font-black text-black mb-2">No active bids</Text>
            <Text className="text-gray-400 text-center font-bold leading-5">
              You haven't placed any bids yet. Check "Available Orders" to find work near you.
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AvailableBookings')}
              className="mt-8 bg-black px-8 py-4 rounded-3xl shadow-xl shadow-black/20"
            >
              <Text className="text-white font-black uppercase tracking-widest">Browse Orders</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        className="flex-1"
      />
    </SafeAreaView>
  );
};

export default MyBidsScreen;
