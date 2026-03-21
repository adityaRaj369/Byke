import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, RefreshControl } from 'react-native';
import api from '../config/api';
import { ArrowLeft, Wallet, TrendingUp, Calendar, ChevronRight, CheckCircle2, IndianRupee } from 'lucide-react-native';

const EarningsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [earnings, setEarnings] = useState({
    today: 450,
    week: 2800,
    month: 12500,
    trips: 14,
    rating: 4.8
  });

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      // In real app: const response = await api.get('/rider/earnings');
      // setEarnings(response.data);
      setTimeout(() => setLoading(false), 800);
    } catch (error) {
      console.log('Error fetching earnings:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

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
          <Text className="text-2xl font-black text-black">My Earnings</Text>
        </View>
        <TouchableOpacity className="bg-yellow-400 p-2.5 rounded-xl">
          <IndianRupee size={20} color="black" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchEarnings} tintColor="#EAB308" />
        }
      >
        {/* Main Wallet Card */}
        <View className="mx-6 mt-4 mb-10">
          <View className="bg-black rounded-[40px] p-10 shadow-2xl shadow-black/30">
            <Text className="text-white/60 text-xs font-black uppercase tracking-[4px]">Available for Payout</Text>
            <Text className="text-white text-6xl font-black mt-4">₹{earnings.today}</Text>
            
            <View className="h-[1px] bg-white/10 my-8" />
            
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white/40 text-[10px] font-black uppercase tracking-widest">Total Trips</Text>
                <Text className="text-white text-xl font-black mt-1">{earnings.trips}</Text>
              </View>
              <TouchableOpacity className="bg-yellow-400 px-6 py-3 rounded-2xl">
                <Text className="text-black font-black text-xs uppercase tracking-widest">Withdraw</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-10">
          <Text className="text-xs font-black text-gray-400 uppercase tracking-[4px] mb-6 ml-1">Earning Stats</Text>
          
          <View className="flex-row justify-between mb-4">
            <View className="w-[47%] bg-gray-50 p-6 rounded-[32px] border border-gray-100">
              <View className="bg-white w-10 h-10 rounded-xl items-center justify-center mb-4 shadow-sm">
                <Calendar size={18} color="#3B82F6" />
              </View>
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">This Week</Text>
              <Text className="text-xl font-black text-black">₹{earnings.week}</Text>
            </View>
            
            <View className="w-[47%] bg-gray-50 p-6 rounded-[32px] border border-gray-100">
              <View className="bg-white w-10 h-10 rounded-xl items-center justify-center mb-4 shadow-sm">
                <TrendingUp size={18} color="#10B981" />
              </View>
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">This Month</Text>
              <Text className="text-xl font-black text-black">₹{earnings.month}</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="px-6 pb-10">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-xs font-black text-gray-400 uppercase tracking-[4px] ml-1">Recent Activity</Text>
            <TouchableOpacity>
              <Text className="text-blue-600 font-black text-xs uppercase tracking-widest">See All</Text>
            </TouchableOpacity>
          </View>

          {[
            { id: '1', title: 'Ride Earning', subtitle: 'Trip #8291', amount: '+ ₹85', time: '2:30 PM', status: 'success' },
            { id: '2', title: 'Parcel Delivery', subtitle: 'Trip #8288', amount: '+ ₹120', time: '11:15 AM', status: 'success' },
            { id: '3', title: 'Platform Fee', subtitle: 'Subscription Payout', amount: '- ₹500', time: 'Yesterday', status: 'fee' },
          ].map((item) => (
            <View 
              key={item.id}
              className="flex-row items-center bg-white border border-gray-50 p-5 rounded-3xl shadow-sm shadow-black/5 mb-4"
            >
              <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                item.status === 'success' ? 'bg-green-50' : 'bg-gray-50'
              }`}>
                {item.status === 'success' ? (
                  <CheckCircle2 size={20} color="#10B981" />
                ) : (
                  <Wallet size={20} color="#6B7280" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-black text-gray-800">{item.title}</Text>
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{item.subtitle}</Text>
              </View>
              <View className="items-end">
                <Text className={`text-base font-black ${
                  item.amount.startsWith('+') ? 'text-green-600' : 'text-gray-800'
                }`}>{item.amount}</Text>
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EarningsScreen;
