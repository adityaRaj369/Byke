import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { loginSuccess, setLoading } from '../store/slices/authSlice';
import { AppDispatch } from '../store';
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Bike, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react-native';

const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoadingState] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const sendOTP = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoadingState(true);
    try {
      const response = await api.post('/auth/send-otp', {
        mobileNumber: phone
      });
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent to your phone number');
    } catch (error: any) {
      console.error('OTP Send Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoadingState(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setLoadingState(true);
    dispatch(setLoading(true));
    
    try {
      const response = await api.post('/auth/rider/verify-otp', {
        mobileNumber: phone,
        otpCode: otp,
        fullName: `Rider ${phone.slice(-4)}`
      });

      const { accessToken, userId } = response.data;
      
      await AsyncStorage.setItem('riderToken', accessToken);
      
      dispatch(loginSuccess({ 
        accessToken: accessToken,
        user: { 
          id: userId, 
          name: `Rider ${phone.slice(-4)}`, 
          phone: `+91${phone}`,
          role: 'RIDER'
        }
      }));
      
      Alert.alert('Success', 'Login successful!');
      navigation.replace('Home');
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View className="flex-1 px-8 pt-10 pb-8">
          {/* Brand Section */}
          <View className="items-center mb-12">
            <View className="w-24 h-24 rounded-[40px] bg-black items-center justify-center shadow-2xl shadow-black/40">
              <Bike size={48} color="#EAB308" strokeWidth={2.5} />
            </View>
            <Text className="text-5xl font-black text-black mt-6 tracking-tighter">BYKE</Text>
            <View className="bg-yellow-400 px-4 py-1.5 rounded-full mt-3">
              <Text className="text-[10px] font-black text-black uppercase tracking-[4px]">Captain Edition</Text>
            </View>
          </View>

          <View className="bg-gray-50 rounded-[40px] p-8 border border-gray-100 shadow-sm shadow-black/5">
            {!otpSent ? (
              <View>
                <View className="flex-row items-center justify-between mb-6">
                  <Text className="text-xl font-black text-black">Captain Login</Text>
                  <ShieldCheck size={24} color="#EAB308" strokeWidth={2.5} />
                </View>
                
                <View className="flex-row items-center bg-white border-2 border-gray-100 rounded-3xl overflow-hidden px-5 py-1 mb-8 focus:border-yellow-400">
                  <Text className="text-lg font-black text-gray-400 pr-4 border-r border-gray-100">+91</Text>
                  <TextInput
                    className="flex-1 px-4 py-4 text-lg font-black text-black"
                    placeholder="Mobile Number"
                    placeholderTextColor="#D1D5DB"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={sendOTP}
                  disabled={loading}
                  className={`rounded-3xl py-6 flex-row items-center justify-center shadow-xl ${
                    loading ? 'bg-gray-200' : 'bg-black shadow-black/20'
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text className="text-white text-lg font-black uppercase tracking-widest mr-3">Get Started</Text>
                      <ArrowRight size={20} color="white" strokeWidth={3} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-xl font-black text-black">Verify Identity</Text>
                  <CheckCircle2 size={24} color="#22C55E" strokeWidth={2.5} />
                </View>
                <Text className="text-sm font-bold text-gray-400 mb-8">Sent to +91 {phone}</Text>

                <View className="flex-row justify-between mb-10">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <View
                      key={idx}
                      className={`w-10 h-14 rounded-2xl border-2 items-center justify-center ${
                        otp[idx] ? 'border-yellow-400 bg-white' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <Text className="text-xl font-black text-black">{otp[idx] ?? ''}</Text>
                    </View>
                  ))}
                </View>

                <TextInput
                  className="absolute opacity-0"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus
                />

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={verifyOTP}
                  disabled={loading}
                  className={`rounded-3xl py-6 items-center shadow-xl ${
                    loading ? 'bg-gray-200' : 'bg-yellow-400 shadow-yellow-400/20'
                  }`}
                >
                  {loading ? (
                    <ActivityIndicator color="black" />
                  ) : (
                    <Text className="text-black text-lg font-black uppercase tracking-widest">Verify & Go Online</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-8 items-center"
                  onPress={() => {
                    setOtpSent(false);
                    setOtp('');
                  }}
                >
                  <Text className="text-sm font-black text-gray-400 uppercase tracking-widest underline">Edit Phone Number</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer */}
          <View className="mt-auto items-center">
            <Text className="text-[10px] text-center text-gray-400 font-black uppercase tracking-widest leading-5 px-10">
              By logging in, you agree to our{' '}
              <Text className="text-yellow-600">Captain Terms</Text> and{' '}
              <Text className="text-yellow-600">Earning Policies</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
