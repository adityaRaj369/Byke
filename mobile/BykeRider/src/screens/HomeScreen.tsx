import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  SafeAreaView,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { toggleOnlineStatus, setEarnings, updateLocation } from '../store/slices/riderSlice';
import api from '../config/api';
import Geolocation from 'react-native-geolocation-service';
import { Bell, MapPin, Wallet, TrendingUp, ChevronRight, Navigation, LayoutGrid, Clock, Shield } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user: rider } = useSelector((state: RootState) => state.auth);
  const { isOnline, earnings } = useSelector((state: RootState) => state.rider) as any;

  useEffect(() => {
    fetchEarnings();
    if (isOnline) {
      startLocationTracking();
    }
  }, [isOnline]);

  const fetchEarnings = async () => {
    try {
      // Mock earnings - in real app, fetch from backend
      dispatch(setEarnings({
        today: 450,
        thisWeek: 2800,
        thisMonth: 12500,
      }));
    } catch (error) {
      console.log('Error fetching earnings:', error);
    }
  };

  const startLocationTracking = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        dispatch(updateLocation({ latitude, longitude }));
        
        // Update location on backend
        api.patch('/rider/location', null, {
          params: { latitude, longitude }
        }).catch(console.log);
      },
      (error) => console.log('Location error:', error),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const handleToggleOnline = async () => {
    try {
      const newStatus = !isOnline;
      
      // Update status on backend
      await api.patch('/rider/status', null, {
        params: { status: newStatus ? 'AVAILABLE' : 'OFFLINE' }
      });
      
      dispatch(toggleOnlineStatus());
      
      if (newStatus) {
        startLocationTracking();
        Alert.alert('You are now online', 'You will receive booking notifications');
      } else {
        Alert.alert('You are now offline', 'You will not receive new bookings');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <View className="px-6 pt-6 pb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-black text-gray-400 uppercase tracking-widest">Captain Dashboard</Text>
            <Text className="text-3xl font-black text-black mt-1">Hi, {rider?.name?.split(' ')[0] || 'Captain'}! 👋</Text>
          </View>
          <TouchableOpacity 
            className="bg-gray-50 p-3 rounded-2xl border border-gray-100"
            onPress={() => navigation.navigate('Notifications')}
          >
            <Bell size={24} color="black" />
            <View className="absolute top-2 right-2 w-2.5 h-3 bg-red-500 rounded-full border-2 border-white" />
          </TouchableOpacity>
        </View>

        {/* Online Status Card */}
        <View className="mx-6 mb-8">
          <View className={`rounded-[40px] p-8 flex-row items-center justify-between shadow-2xl ${
            isOnline ? 'bg-green-500 shadow-green-500/30' : 'bg-black shadow-black/30'
          }`}>
            <View className="flex-1">
              <Text className="text-white text-xs font-black uppercase tracking-[2px] opacity-80">
                Current Status
              </Text>
              <Text className="text-white text-2xl font-black mt-1">
                {isOnline ? 'Active & Ready' : 'System Offline'}
              </Text>
              <Text className="text-white text-[10px] font-bold mt-2 opacity-70">
                {isOnline ? 'You are receiving nearby orders' : 'Turn on to start earning today'}
              </Text>
            </View>
            <Switch
              value={isOnline}
              onValueChange={handleToggleOnline}
              trackColor={{ false: '#374151', true: '#ffffff40' }}
              thumbColor={isOnline ? '#fff' : '#9CA3AF'}
              ios_backgroundColor="#374151"
            />
          </View>
        </View>

        {/* Earnings Card */}
        <View className="mx-6 mb-10 bg-gray-50 rounded-[40px] p-8 border border-gray-100">
          <View className="flex-row items-center justify-between mb-8">
            <View className="flex-row items-center">
              <View className="bg-white p-2.5 rounded-xl mr-3 shadow-sm">
                <Wallet size={18} color="#EAB308" />
              </View>
              <Text className="text-gray-800 font-black uppercase tracking-widest text-xs">Today's Earnings</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Earnings')}>
              <Text className="text-blue-600 font-black text-xs uppercase tracking-widest">Details</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-end justify-between">
            <View>
              <Text className="text-4xl font-black text-black">₹{earnings.today}</Text>
              <View className="flex-row items-center mt-2 bg-green-100 self-start px-2 py-1 rounded-lg">
                <TrendingUp size={12} color="#166534" />
                <Text className="text-[10px] font-black text-green-800 ml-1">+12% from yesterday</Text>
              </View>
            </View>
            <View className="items-end">
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Weekly</Text>
              <Text className="text-xl font-black text-gray-800">₹{earnings.thisWeek}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View className="px-6 mb-12">
          <Text className="text-xs font-black text-gray-400 uppercase tracking-[4px] mb-6 ml-1">Captain Tools</Text>
          
          <View className="flex-row flex-wrap justify-between">
            {[
              { id: 'bookings', label: 'Available Orders', icon: Navigation, color: '#EAB308', screen: 'AvailableBookings' },
              { id: 'mybids', label: 'Active Bids', icon: Clock, color: '#3B82F6', screen: 'MyBids' },
              { id: 'docs', label: 'Documents', icon: Shield, color: '#10B981', screen: 'Documents' },
              { id: 'more', label: 'More Ops', icon: LayoutGrid, color: '#6B7280', screen: 'Profile' },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.screen as any)}
                className="w-[47%] bg-white border border-gray-100 p-6 rounded-[32px] mb-4 shadow-sm shadow-black/5"
              >
                <View 
                  className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon size={22} color={item.color} strokeWidth={2.5} />
                </View>
                <Text className="text-sm font-black text-gray-800 leading-5">{item.label}</Text>
                <View className="mt-4 flex-row items-center">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Open</Text>
                  <ChevronRight size={12} color="#D1D5DB" className="ml-1" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tips Footer */}
        <View className="mx-6 p-6 bg-yellow-50 rounded-[32px] border border-yellow-100 flex-row items-center mb-12">
          <View className="bg-yellow-400 p-3 rounded-2xl mr-4 shadow-sm">
            <Shield size={20} color="black" />
          </View>
          <View className="flex-1">
            <Text className="text-yellow-900 font-black text-sm">Safety First!</Text>
            <Text className="text-yellow-700 font-bold text-xs mt-0.5">Always wear a helmet and follow traffic rules.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
