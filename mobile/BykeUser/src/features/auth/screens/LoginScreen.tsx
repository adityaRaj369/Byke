import React, { useState, useRef } from 'react';
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
  Dimensions,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { loginSuccess, setLoading } from '../../../store/slices/authSlice';
import { AppDispatch } from '../../../store';
import api from '../../../config/api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_PROFILE_KEY } from '../../../constants/storageKeys';
import { ArrowRight, ShieldCheck, Bike, CheckCircle2, User, ChevronLeft } from 'lucide-react-native';
import { API_BASE_URL } from '../../../config/env';
console.log('API_BASE_URL runtime:', API_BASE_URL);
const { width, height } = Dimensions.get('window');

type Role = 'user' | 'rider';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoadingState] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);
  const [role, setRole] = useState<Role>('user');
  const dispatch = useDispatch<AppDispatch>();
  const otpInputRef = useRef<TextInput>(null);

  const persistSession = async (token: string, refreshToken: string | undefined, userPayload: object) => {
    const entries: [string, string][] = [
      [TOKEN_KEY, token],
      [USER_PROFILE_KEY, JSON.stringify(userPayload)],
    ];
    if (refreshToken) {
      entries.push([REFRESH_TOKEN_KEY, refreshToken]);
    }
    await AsyncStorage.multiSet(entries);
  };

  const sendOTP = async () => {
    if (!phone || phone.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoadingState(true);
    try {
      console.log('Attempting to send OTP to:', '+91' + phone);

      const confirmationResult = await auth().signInWithPhoneNumber('+91' + phone);
      console.log('Firebase confirmation received:', confirmationResult.verificationId);

      setConfirmation(confirmationResult);
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent to your phone number via SMS');
    } catch (error: any) {
      console.error('OTP Send Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);

      let errorMessage = 'Failed to send OTP';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.code === 'auth/configuration-not-found') {
        errorMessage = 'Firebase configuration error. Please contact support.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoadingState(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    if (!confirmation) {
      Alert.alert('Error', 'Session expired. Please send OTP again');
      return;
    }

    setLoadingState(true);
    dispatch(setLoading(true));

    try {
      console.log('Verifying OTP with Firebase...');
      const userCredential = await confirmation.confirm(otp);

      console.log('Firebase OTP verified, getting ID token...');
      const idToken = await userCredential.user.getIdToken();

      console.log('Sending ID token to backend...');
      const endpoint = role === 'rider' ? '/auth/rider/verify-firebase-token' : '/auth/verify-firebase-token';
      const response = await api.post(endpoint, {
        idToken,
        mobileNumber: `+91${phone}`,
        fullName: `User ${phone.slice(-4)}`,
      });

      const { accessToken, refreshToken, userId } = response.data;

      const userPayload = {
        id: userId,
        name: `User ${phone.slice(-4)}`,
        phone: `+91${phone}`,
        role,
      };

      await persistSession(accessToken, refreshToken, userPayload);
      dispatch(loginSuccess({ user: userPayload, token: accessToken, refreshToken }));
      Alert.alert('Success', 'Login successful!');
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.code === 'ERR_NETWORK' || !error.response) {
        Alert.alert(
          'Network Error',
          `Cannot connect to server at ${API_BASE_URL}. Please check if your phone can access this URL in a browser.`
        );
      } else {
        Alert.alert('Error', error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoadingState(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgGraphic} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.content}>
            {otpSent && (
              <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.backButton}>
                <ChevronLeft size={28} color="black" strokeWidth={3} />
              </TouchableOpacity>
            )}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Bike size={50} color="black" strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>BYKE</Text>
              <Text style={styles.subtitle}>India's Fastest Bike Taxi App</Text>
            </View>
            <View style={styles.card}>
              {!otpSent ? (
                <View>
                  <Text style={styles.cardTitle}>Login or Signup</Text>
                  <Text style={styles.cardSubtitle}>Get moving with BYKE</Text>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.countryCode}>+91</Text>
                    <View style={styles.divider} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter Mobile Number"
                      placeholderTextColor="#9CA3AF"
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
                    style={[styles.mainButton, loading && { opacity: 0.7 }]}
                  >
                    {loading ? <ActivityIndicator color="black" /> : <Text style={styles.buttonText}>PROCEED</Text>}
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.cardTitle}>Verify Details</Text>
                  <Text style={styles.cardSubtitle}>OTP sent to +91 {phone}</Text>
                  <TouchableOpacity 
                    activeOpacity={1} 
                    onPress={() => otpInputRef.current?.focus()}
                    style={styles.otpGrid}
                  >
                    {Array.from({ length: 6 }).map((_, idx) => (
                      <View key={idx} style={[styles.otpBox, otp[idx] ? styles.otpBoxFilled : null]}>
                        <Text style={styles.otpText}>{otp[idx] ?? ''}</Text>
                      </View>
                    ))}
                  </TouchableOpacity>
                  <TextInput
                    ref={otpInputRef}
                    style={styles.hiddenInput}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                  <TouchableOpacity activeOpacity={0.9} onPress={verifyOTP} disabled={loading} style={styles.mainButton}>
                    {loading ? <ActivityIndicator color="black" /> : <Text style={styles.buttonText}>VERIFY & LOGIN</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.resendLink} onPress={sendOTP}>
                    <Text style={styles.resendText}>Resend OTP</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            {!otpSent && (
              <View style={styles.roleContainer}>
                <TouchableOpacity onPress={() => setRole('user')} style={[styles.roleButton, role === 'user' && styles.roleButtonActive]}>
                  <User size={20} color={role === 'user' ? 'black' : '#6B7280'} />
                  <Text style={[styles.roleButtonText, role === 'user' && styles.roleButtonTextActive]}>Passenger</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setRole('rider')} style={[styles.roleButton, role === 'rider' && styles.roleButtonActive]}>
                  <Bike size={20} color={role === 'rider' ? 'black' : '#6B7280'} />
                  <Text style={[styles.roleButtonText, role === 'rider' && styles.roleButtonTextActive]}>Captain</Text>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.footer}>
              <Text style={styles.legalText}>
                By continuing, you agree to our <Text style={styles.link}>Terms</Text> & <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  bgGraphic: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.45, backgroundColor: '#FFDD00', borderBottomLeftRadius: 60, borderBottomRightRadius: 60 },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 20, left: 20, zIndex: 10 },
  headerSection: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 100, height: 100, backgroundColor: 'white', borderRadius: 30, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10 },
  title: { fontSize: 48, fontWeight: '900', color: 'black', marginTop: 16, letterSpacing: -2 },
  subtitle: { fontSize: 14, fontWeight: '700', color: 'black', opacity: 0.6, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: 'white', borderRadius: 32, padding: 32, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardTitle: { fontSize: 24, fontWeight: '900', color: 'black', marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24, fontWeight: '600' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 16, height: 64, marginBottom: 20 },
  countryCode: { fontSize: 18, fontWeight: '900', color: 'black' },
  divider: { width: 1, height: 24, backgroundColor: '#D1D5DB', marginHorizontal: 16 },
  input: { flex: 1, fontSize: 18, fontWeight: '700', color: 'black' },
  mainButton: { backgroundColor: '#FFDD00', height: 64, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5 },
  buttonText: { fontSize: 16, fontWeight: '900', color: 'black', letterSpacing: 1 },
  otpGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  otpBox: { width: width * 0.11, height: 56, backgroundColor: '#F9FAFB', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  otpBoxFilled: { borderColor: '#FFDD00', backgroundColor: '#FFFBEB' },
  otpText: { fontSize: 20, fontWeight: '900', color: 'black' },
  hiddenInput: { position: 'absolute', opacity: 0, width: 0, height: 0 },
  resendLink: { alignItems: 'center', marginTop: 20 },
  resendText: { color: '#3B82F6', fontWeight: '700', fontSize: 14 },
  roleContainer: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 20, padding: 6, marginTop: 24, alignSelf: 'center' },
  roleButton: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16 },
  roleButtonActive: { backgroundColor: '#FFDD00' },
  roleButtonText: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginLeft: 8 },
  roleButtonTextActive: { color: 'black' },
  footer: { marginTop: 'auto', alignItems: 'center', paddingVertical: 20 },
  legalText: { fontSize: 11, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 },
  link: { color: '#6B7280', fontWeight: '700', textDecorationLine: 'underline' },
});

export default LoginScreen;
