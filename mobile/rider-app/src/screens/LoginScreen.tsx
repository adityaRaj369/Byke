import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp, verifyOtp } from '../store/slices/authSlice';
import { fetchRiderProfile } from '../store/slices/riderSlice';
import { AppDispatch, RootState } from '../store';

const LoginScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);
  
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    let interval: any;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const handleSendOtp = async () => {
    if (mobileNumber.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
      return;
    }

    try {
      await dispatch(sendOtp(mobileNumber)).unwrap();
      setOtpSent(true);
      setTimer(60);
      Alert.alert('Success', 'OTP sent to your mobile number');
    } catch (error: any) {
      Alert.alert('Error', error);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      await dispatch(verifyOtp({ mobileNumber, otp })).unwrap();
      const profile = await dispatch(fetchRiderProfile()).unwrap();
      
      if (profile.status === 'PENDING') {
        navigation.replace('Documents');
      } else if (!profile.user) {
        navigation.replace('RiderApplication');
      } else {
        navigation.replace('Home');
      }
    } catch (error: any) {
      Alert.alert('Error', error);
    }
  };

  return (
    <View className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-gray-900 mb-2">Welcome to BYKE</Text>
      <Text className="text-gray-600 mb-8">Rider App - Start earning today</Text>

      {!otpSent ? (
        <>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
            placeholder="Mobile Number"
            keyboardType="phone-pad"
            maxLength={10}
            value={mobileNumber}
            onChangeText={setMobileNumber}
          />
          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-4 items-center"
            onPress={handleSendOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Send OTP</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 mb-4 text-base"
            placeholder="Enter 6-digit OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity
            className="bg-blue-600 rounded-lg py-4 items-center mb-4"
            onPress={handleVerifyOtp}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-semibold text-base">Verify OTP</Text>
            )}
          </TouchableOpacity>
          
          {timer > 0 ? (
            <Text className="text-center text-gray-600">
              Resend OTP in {timer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleSendOtp}>
              <Text className="text-center text-blue-600 font-semibold">Resend OTP</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <View className="mt-8 bg-blue-50 rounded-lg p-4">
        <Text className="text-blue-900 font-semibold mb-2">🏍️ Why Join BYKE?</Text>
        <Text className="text-blue-800 text-sm mb-1">• Just ₹500/month - No commission per ride</Text>
        <Text className="text-blue-800 text-sm mb-1">• Keep 100% of your earnings</Text>
        <Text className="text-blue-800 text-sm mb-1">• Flexible working hours</Text>
        <Text className="text-blue-800 text-sm">• Rides, Errands & Parcel delivery</Text>
      </View>
    </View>
  );
};

export default LoginScreen;
