import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { placeBid } from '../store/slices/riderSlice';
import { AppDispatch } from '../store';
import Slider from '@react-native-community/slider';

const PlaceBidScreen = ({ route, navigation }: any) => {
  const { booking } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  
  const [bidAmount, setBidAmount] = useState(booking.estimatedFare || 100);
  const [loading, setLoading] = useState(false);

  const minBid = Math.max(50, (booking.estimatedFare || 100) * 0.7);
  const maxBid = (booking.estimatedFare || 100) * 1.5;

  const handlePlaceBid = async () => {
    if (bidAmount < minBid || bidAmount > maxBid) {
      Alert.alert('Invalid Bid', `Bid must be between ₹${minBid.toFixed(0)} and ₹${maxBid.toFixed(0)}`);
      return;
    }

    setLoading(true);
    try {
      await dispatch(placeBid({ bookingId: booking.id, bidAmount })).unwrap();
      Alert.alert('Success', 'Your bid has been placed!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-6">
        <Text className="text-2xl font-bold text-gray-900 mb-6">Place Your Bid</Text>

        <View className="bg-blue-50 rounded-lg p-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Service Type</Text>
            <Text className="text-gray-900 font-semibold">{booking.serviceType}</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-600">Distance</Text>
            <Text className="text-gray-900 font-semibold">
              {booking.estimatedDistance?.toFixed(1) || '5.0'} km
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Estimated Fare</Text>
            <Text className="text-gray-900 font-semibold">₹{booking.estimatedFare?.toFixed(0) || '0'}</Text>
          </View>
        </View>

        <View className="mb-6">
          <Text className="text-gray-600 text-sm mb-1">📍 Pickup</Text>
          <Text className="text-gray-900 mb-3">{booking.pickupAddress}</Text>
          
          <Text className="text-gray-600 text-sm mb-1">📍 Drop</Text>
          <Text className="text-gray-900">{booking.dropAddress}</Text>
        </View>

        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-4">Your Bid Amount</Text>
          
          <View className="items-center mb-4">
            <Text className="text-5xl font-bold text-blue-600">₹{bidAmount.toFixed(0)}</Text>
          </View>

          <Slider
            minimumValue={minBid}
            maximumValue={maxBid}
            value={bidAmount}
            onValueChange={setBidAmount}
            minimumTrackTintColor="#2563eb"
            maximumTrackTintColor="#cbd5e1"
            thumbTintColor="#2563eb"
            step={5}
          />

          <View className="flex-row justify-between mt-2">
            <Text className="text-gray-600 text-sm">Min: ₹{minBid.toFixed(0)}</Text>
            <Text className="text-gray-600 text-sm">Max: ₹{maxBid.toFixed(0)}</Text>
          </View>
        </View>

        <View className="bg-yellow-50 rounded-lg p-4 mb-6">
          <Text className="text-yellow-800 text-sm">
            💡 <Text className="font-semibold">Tip:</Text> Lower bids have higher chances of being selected. 
            You keep 100% of the fare with no commission!
          </Text>
        </View>

        <TouchableOpacity
          className="bg-blue-600 rounded-lg py-4 items-center mb-3"
          onPress={handlePlaceBid}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Place Bid</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="py-3 items-center"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-gray-600">Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PlaceBidScreen;
