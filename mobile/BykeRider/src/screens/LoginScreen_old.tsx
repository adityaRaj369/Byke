import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp, verifyOtp } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';

const LoginScreen = ({ navigation }: any) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoadingState] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);
  const dispatch = useDispatch();

  const sendOTP = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoadingState(true);
    try {
      setOtpSent(true);
      Alert.alert('Demo Mode', 'Enter any 6-digit code as OTP (e.g., 123456)');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send OTP');
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
      const mockToken = `demo_rider_${phone}_${Date.now()}`;
      
      const response = await api.post('/auth/rider/verify-firebase-token', {
        idToken: mockToken,
        fullName: `Rider ${phone.slice(-4)}`
      });

      const { accessToken, userId } = response.data;
      
      await AsyncStorage.setItem('riderToken', accessToken);
      
      // Check if rider profile exists, if not create one
      try {
        const profileResponse = await api.get('/rider/profile');
        dispatch(loginSuccess({ 
          rider: { 
            id: userId, 
            name: profileResponse.data.fullName || `Rider ${phone.slice(-4)}`, 
            phone: `+91${phone}`,
            status: profileResponse.data.status
          }, 
          token: accessToken 
        }));
      } catch (profileError: any) {
        if (profileError.response?.status === 400) {
          try {
            const riderData = {
              fullName: `Rider ${phone.slice(-4)}`,
              vehicleType: 'MOTORCYCLE',
              vehicleNumber: 'DL01AB1234',
              licenseNumber: 'DL123456789',
              aadharNumber: '123456789012'
            };
            
            await api.post('/rider/apply', riderData);
            
            dispatch(loginSuccess({ 
              rider: { 
                id: userId, 
                name: `Rider ${phone.slice(-4)}`, 
                phone: `+91${phone}`,
                status: 'PENDING'
              }, 
              token: accessToken 
            }));
          } catch (applyError: any) {
            console.error('Rider Apply Error:', applyError);
            Alert.alert('Error', 'Failed to create rider profile');
            return;
          }
        } else {
          console.error('Profile Fetch Error:', profileError);
          Alert.alert('Error', 'Failed to fetch rider profile');
          return;
        }
      }
      
      Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Error', error.response?.data || error.message || 'Login failed');
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>BYKE Rider</Text>
        <Text style={styles.subtitle}>Start earning with BYKE</Text>

        {!otpSent ? (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneContainer}>
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                placeholder="Enter 10-digit number"
                value={phone}
                onChangeText={setPhone}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={sendOTP}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Sending...' : 'Send OTP'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Enter OTP</Text>
            <Text style={styles.otpInfo}>OTP sent to +91{phone}</Text>
            <TextInput
              style={styles.otpInput}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={verifyOTP}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setOtpSent(false);
                setOtp('');
              }}
            >
              <Text style={styles.resendText}>Change Number</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 48,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  countryCode: {
    fontSize: 16,
    color: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#d1d5db',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    color: '#374151',
  },
  otpInfo: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  otpInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#fff',
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    color: '#374151',
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#059669',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    color: '#059669',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default LoginScreen;
