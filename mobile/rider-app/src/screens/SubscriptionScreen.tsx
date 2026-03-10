import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import api from '../config/api';

const SubscriptionScreen = ({ navigation }: any) => {
  const { profile } = useSelector((state: RootState) => state.rider);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      // In production, this would integrate with Stripe/Razorpay
      const response = await api.post('/payments/subscribe', {
        riderId: profile?.id,
        amount: 500,
      });
      
      Alert.alert('Success', 'Subscription activated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to activate subscription');
    } finally {
      setLoading(false);
    }
  };

  const isActive = profile?.subscriptionActive;
  const expiryDate = profile?.subscriptionEndDate 
    ? new Date(profile.subscriptionEndDate).toLocaleDateString()
    : null;

  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="bg-blue-600 p-6 pb-12">
        <Text className="text-white text-2xl font-bold mb-2">Subscription</Text>
        <Text className="text-blue-100">Manage your BYKE subscription</Text>
      </View>

      <View className="bg-white rounded-t-3xl -mt-6 p-6">
        {isActive ? (
          <View className="bg-green-50 border-2 border-green-500 rounded-lg p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-green-900">Active</Text>
              <Text className="text-4xl">✅</Text>
            </View>
            <Text className="text-green-800 text-base mb-2">
              Your subscription is active and you can accept rides.
            </Text>
            <View className="bg-white rounded-lg p-3 mt-3">
              <Text className="text-gray-600 text-sm">Next renewal date</Text>
              <Text className="text-gray-900 font-semibold text-lg">{expiryDate}</Text>
            </View>
          </View>
        ) : (
          <View className="bg-red-50 border-2 border-red-500 rounded-lg p-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-red-900">Inactive</Text>
              <Text className="text-4xl">⚠️</Text>
            </View>
            <Text className="text-red-800 text-base">
              Your subscription is inactive. Activate now to start accepting rides.
            </Text>
          </View>
        )}

        <View className="bg-blue-600 rounded-lg p-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-blue-100 text-sm">Monthly Subscription</Text>
              <Text className="text-white text-4xl font-bold">₹500</Text>
              <Text className="text-blue-100 text-sm mt-1">per month</Text>
            </View>
            <Text className="text-6xl">🏍️</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-3">What's Included</Text>
          
          <View className="space-y-3">
            <View className="flex-row items-start">
              <Text className="text-green-600 text-xl mr-3">✓</Text>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">Unlimited Rides</Text>
                <Text className="text-gray-600 text-sm">Accept as many bookings as you want</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Text className="text-green-600 text-xl mr-3">✓</Text>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">100% Commission-Free</Text>
                <Text className="text-gray-600 text-sm">Keep all your earnings, no per-ride cuts</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Text className="text-green-600 text-xl mr-3">✓</Text>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">All Service Types</Text>
                <Text className="text-gray-600 text-sm">Rides, Errands, and Parcel delivery</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Text className="text-green-600 text-xl mr-3">✓</Text>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">Competitive Bidding</Text>
                <Text className="text-gray-600 text-sm">Set your own prices for each ride</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Text className="text-green-600 text-xl mr-3">✓</Text>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">24/7 Support</Text>
                <Text className="text-gray-600 text-sm">Get help whenever you need it</Text>
              </View>
            </View>

            <View className="flex-row items-start">
              <Text className="text-green-600 text-xl mr-3">✓</Text>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">Flexible Schedule</Text>
                <Text className="text-gray-600 text-sm">Work whenever you want, go offline anytime</Text>
              </View>
            </View>
          </View>
        </View>

        <View className="bg-yellow-50 rounded-lg p-4 mb-6">
          <Text className="text-yellow-900 font-semibold mb-2">💰 Earnings Example</Text>
          <Text className="text-yellow-800 text-sm mb-3">
            If you complete just 10 rides per day at ₹100 average:
          </Text>
          <View className="bg-white rounded p-3">
            <Text className="text-gray-600 text-sm">Daily: ₹1,000</Text>
            <Text className="text-gray-600 text-sm">Monthly: ₹30,000</Text>
            <Text className="text-gray-600 text-sm">Subscription: -₹500</Text>
            <Text className="text-green-600 font-bold text-lg mt-2">Net: ₹29,500/month</Text>
          </View>
        </View>

        {!isActive && (
          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-4 items-center mb-3"
            onPress={handleSubscribe}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-base">
              {loading ? 'Processing...' : 'Activate Subscription - ₹500/month'}
            </Text>
          </TouchableOpacity>
        )}

        <View className="bg-gray-50 rounded-lg p-4">
          <Text className="text-gray-600 text-xs text-center">
            • Auto-renews monthly • Cancel anytime • 3-day grace period on payment failure
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SubscriptionScreen;
