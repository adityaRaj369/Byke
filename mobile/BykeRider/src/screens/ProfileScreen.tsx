import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, CreditCard, Bell, HelpCircle, LogOut, ChevronRight, Settings, FileText, Bike, ShieldCheck } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const ProfileScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<any>();
  const { user: rider } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout from Captain account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            dispatch(logout());
          },
        },
      ]
    );
  };

  const menuItems = [
    { icon: Bike, label: 'Vehicle Details', color: '#EAB308', screen: 'Documents' },
    { icon: FileText, label: 'Documents', color: '#3B82F6', screen: 'Documents' },
    { icon: CreditCard, label: 'Subscription', color: '#10B981', screen: 'Earnings' },
    { icon: Bell, label: 'Notifications', color: '#F59E0B', screen: 'Notifications' },
    { icon: HelpCircle, label: 'Help & Support', color: '#8B5CF6', screen: 'Profile' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="px-6 pt-10 pb-12 items-center bg-gray-50 rounded-b-[50px] border-b border-gray-100">
          <View className="relative">
            <View className="w-28 h-28 bg-black rounded-[40px] items-center justify-center shadow-2xl shadow-black/30">
              <Text className="text-4xl font-black text-yellow-400">
                {rider?.name?.charAt(0).toUpperCase() || 'R'}
              </Text>
            </View>
            <View className="absolute -bottom-2 -right-2 bg-yellow-400 p-2 rounded-xl border-4 border-white">
              <ShieldCheck size={20} color="black" />
            </View>
          </View>
          
          <Text className="text-3xl font-black text-black mt-6">{rider?.name || 'BYKE Captain'}</Text>
          <View className="bg-white/80 px-4 py-2 rounded-2xl mt-3 border border-gray-100 flex-row items-center">
            <Text className="text-sm font-black text-gray-400 uppercase tracking-widest mr-2">
              {rider?.phone || '+91 00000 00000'}
            </Text>
            <View className="bg-green-500 w-2 h-2 rounded-full" />
          </View>
        </View>

        {/* Menu Section */}
        <View className="px-6 py-10">
          <Text className="text-xs font-black text-gray-400 uppercase tracking-[4px] mb-6 ml-1">Captain Management</Text>
          
          <View className="space-y-4">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(item.screen)}
                className="flex-row items-center bg-white border border-gray-100 p-5 rounded-[32px] shadow-sm shadow-black/5 mb-4"
              >
                <View 
                  className="p-3 rounded-2xl mr-4"
                  style={{ backgroundColor: `${item.color}15` }}
                >
                  <item.icon size={22} color={item.color} strokeWidth={2.5} />
                </View>
                <Text className="flex-1 text-lg font-black text-gray-800">{item.label}</Text>
                <ChevronRight size={20} color="#D1D5DB" strokeWidth={3} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              className="flex-row items-center bg-red-50 border border-red-100 p-5 rounded-[32px] mt-6"
            >
              <View className="bg-red-500/10 p-3 rounded-2xl mr-4">
                <LogOut size={22} color="#EF4444" strokeWidth={2.5} />
              </View>
              <Text className="flex-1 text-lg font-black text-red-500">Go Offline & Logout</Text>
              <ChevronRight size={20} color="#FCA5A5" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer info */}
        <View className="items-center pb-12">
          <Text className="text-[10px] font-black text-gray-300 uppercase tracking-[4px]">BYKE CAPTAIN v1.0.1</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;
