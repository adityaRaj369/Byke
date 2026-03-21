import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, SafeAreaView } from 'react-native';
import api from '../config/api';
import { Bell, ArrowLeft, CheckCircle2, Clock, Info, Inbox } from 'lucide-react-native';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const NotificationsScreen = ({ navigation }: any) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('/rider/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.log('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: number) => {
    try {
      await api.put(`/rider/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.log('Error marking notification as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'NEW_BOOKING': return { icon: Bell, color: '#EAB308' };
      case 'PAYMENT_RECEIVED': return { icon: CheckCircle2, color: '#10B981' };
      default: return { icon: Info, color: '#3B82F6' };
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const { icon: Icon, color } = getIcon(item.type);
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        className={`flex-row p-5 mb-4 rounded-[32px] border ${
          item.read ? 'bg-white border-gray-100' : 'bg-yellow-50/50 border-yellow-100'
        }`}
        onPress={() => markAsRead(item.id)}
      >
        <View 
          className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon size={20} color={color} strokeWidth={2.5} />
        </View>
        
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className={`text-base flex-1 pr-2 ${item.read ? 'font-bold text-gray-700' : 'font-black text-black'}`}>
              {item.title}
            </Text>
            {!item.read && <View className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />}
          </View>
          <Text className="text-sm font-bold text-gray-500 leading-5 mb-2" numberOfLines={2}>
            {item.message}
          </Text>
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {new Date(item.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </TouchableOpacity>
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
            <Text className="text-2xl font-black text-black">Notifications</Text>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Captain Updates</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor="#EAB308" />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center py-24 px-10">
            <View className="bg-gray-50 p-10 rounded-[50px] mb-8 border border-gray-100">
              <Inbox size={64} color="#D1D5DB" strokeWidth={1.5} />
            </View>
            <Text className="text-xl font-black text-black mb-2">No updates yet</Text>
            <Text className="text-gray-400 text-center font-bold leading-5">
              New orders and account updates will appear here. Stay online!
            </Text>
          </View>
        }
        contentContainerStyle={{ padding: 24 }}
        className="flex-1"
      />
    </SafeAreaView>
  );
};

export default NotificationsScreen;
