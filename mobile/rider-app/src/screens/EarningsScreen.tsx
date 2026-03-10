import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../config/api';

const EarningsScreen = () => {
  const { profile } = useSelector((state: RootState) => state.rider);
  const [earnings, setEarnings] = useState({
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  });
  const [recentRides, setRecentRides] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const response = await api.get('/bookings/rider/my-bookings');
      const completedBookings = response.data.filter((b: any) => b.status === 'COMPLETED');
      
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const weekStart = new Date(now.setDate(now.getDate() - 7));
      const monthStart = new Date(now.setMonth(now.getMonth() - 1));

      const todayEarnings = completedBookings
        .filter((b: any) => new Date(b.completedAt) >= todayStart)
        .reduce((sum: number, b: any) => sum + (b.finalFare || 0), 0);

      const weekEarnings = completedBookings
        .filter((b: any) => new Date(b.completedAt) >= weekStart)
        .reduce((sum: number, b: any) => sum + (b.finalFare || 0), 0);

      const monthEarnings = completedBookings
        .filter((b: any) => new Date(b.completedAt) >= monthStart)
        .reduce((sum: number, b: any) => sum + (b.finalFare || 0), 0);

      const totalEarnings = completedBookings
        .reduce((sum: number, b: any) => sum + (b.finalFare || 0), 0);

      setEarnings({
        today: todayEarnings,
        week: weekEarnings,
        month: monthEarnings,
        total: totalEarnings,
      });

      setRecentRides(completedBookings.slice(0, 10));
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    }
  };

  const periods = [
    { key: 'today', label: 'Today', amount: earnings.today },
    { key: 'week', label: 'This Week', amount: earnings.week },
    { key: 'month', label: 'This Month', amount: earnings.month },
  ];

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6 pb-12">
        <Text className="text-white text-2xl font-bold mb-2">Earnings</Text>
        <Text className="text-blue-100">Track your income</Text>
      </View>

      <View className="bg-white rounded-t-3xl -mt-6 p-6">
        <View className="flex-row mb-6">
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              className={`flex-1 mx-1 p-4 rounded-lg ${
                selectedPeriod === period.key ? 'bg-blue-600' : 'bg-gray-100'
              }`}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                className={`text-xs mb-1 ${
                  selectedPeriod === period.key ? 'text-blue-100' : 'text-gray-600'
                }`}
              >
                {period.label}
              </Text>
              <Text
                className={`text-xl font-bold ${
                  selectedPeriod === period.key ? 'text-white' : 'text-gray-900'
                }`}
              >
                ₹{period.amount.toFixed(0)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="bg-green-50 rounded-lg p-4 mb-6">
          <Text className="text-gray-600 text-sm mb-1">Total Lifetime Earnings</Text>
          <Text className="text-3xl font-bold text-green-600">₹{earnings.total.toFixed(0)}</Text>
          <Text className="text-gray-500 text-sm mt-2">
            {profile?.totalRides || 0} rides completed • 100% commission-free
          </Text>
        </View>

        <View className="mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Recent Rides</Text>
          
          {recentRides.length === 0 ? (
            <View className="bg-gray-50 rounded-lg p-8 items-center">
              <Text className="text-4xl mb-2">💰</Text>
              <Text className="text-gray-600">No completed rides yet</Text>
            </View>
          ) : (
            recentRides.map((ride: any, index) => (
              <View key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                <View className="flex-row justify-between items-start mb-2">
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">{ride.serviceType}</Text>
                    <Text className="text-gray-600 text-sm" numberOfLines={1}>
                      {ride.pickupAddress}
                    </Text>
                    <Text className="text-gray-600 text-sm" numberOfLines={1}>
                      → {ride.dropAddress}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-lg font-bold text-green-600">
                      ₹{ride.finalFare || ride.estimatedFare}
                    </Text>
                    <Text className="text-gray-500 text-xs">
                      {new Date(ride.completedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center pt-2 border-t border-gray-100">
                  <Text className="text-gray-500 text-sm">
                    {ride.estimatedDistance?.toFixed(1)} km
                  </Text>
                  {ride.rating && (
                    <>
                      <Text className="text-gray-400 mx-2">•</Text>
                      <Text className="text-yellow-500 text-sm">⭐ {ride.rating}</Text>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        <View className="bg-blue-50 rounded-lg p-4">
          <Text className="text-blue-900 font-semibold mb-2">💡 Earnings Tip</Text>
          <Text className="text-blue-800 text-sm">
            Stay online during peak hours (8-10 AM, 6-9 PM) to maximize your earnings. 
            Remember, you keep 100% of your fares with just ₹500/month subscription!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default EarningsScreen;
