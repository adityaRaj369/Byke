import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  SafeAreaView, StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { useDispatch } from 'react-redux';
import { loginSuccess, setLoading, registrationRequired } from '../../../store/slices/authSlice';
import { AppDispatch } from '../../../store';
import api from '../../../config/api';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_PROFILE_KEY } from '../../../constants/storageKeys';
import { Bike, ChevronLeft } from 'lucide-react-native';
import { API_BASE_URL } from '../../../config/env';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoadingState] = useState(false);
  const [confirmation, setConfirmation] = useState<any>(null);
  const dispatch = useDispatch<AppDispatch>();
  const otpInputRef = useRef<TextInput>(null);

  const sendOTP = async () => {
    if (!phone || phone.length !== 10) { Alert.alert('Error', 'Please enter a valid 10-digit phone number'); return; }
    setLoadingState(true);
    try {
      const confirmationResult = await auth().signInWithPhoneNumber('+91' + phone);
      setConfirmation(confirmationResult);
      setOtpSent(true);
    } catch (error: any) {
      let msg = 'Failed to send OTP';
      if (error.code === 'auth/invalid-phone-number') msg = 'Invalid phone number format';
      else if (error.code === 'auth/too-many-requests') msg = 'Too many requests. Please try again later';
      else if (error.message) msg = error.message;
      Alert.alert('Error', msg);
    } finally { setLoadingState(false); }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) { Alert.alert('Error', 'Please enter a valid 6-digit OTP'); return; }
    if (!confirmation) { Alert.alert('Error', 'Session expired. Please send OTP again'); return; }
    setLoadingState(true);
    dispatch(setLoading(true));
    try {
      const userCredential = await confirmation.confirm(otp);
      const idToken = await userCredential.user.getIdToken();
      const response = await api.post('/auth/verify-firebase-token', {
        idToken, mobileNumber: `+91${phone}`, fullName: `User ${phone.slice(-4)}`,
      });
      const { accessToken, refreshToken, userId, isNewUser, fullName, profilePhotoUrl } = response.data;
      if (isNewUser) {
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        if (refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        dispatch(registrationRequired({ token: accessToken, refreshToken, userId: String(userId), phone: `+91${phone}` }));
      } else {
        const userPayload = { id: String(userId), name: fullName || `User ${phone.slice(-4)}`, phone: `+91${phone}`, profilePhoto: profilePhotoUrl || undefined, role: 'user' as const };
        await AsyncStorage.multiSet([[TOKEN_KEY, accessToken], ...(refreshToken ? [[REFRESH_TOKEN_KEY, refreshToken]] as [string,string][] : []), [USER_PROFILE_KEY, JSON.stringify(userPayload)]]);
        dispatch(loginSuccess({ user: userPayload, token: accessToken, refreshToken }));
      }
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) Alert.alert('Network Error', `Cannot connect to server at ${API_BASE_URL}.`);
      else Alert.alert('Error', error.response?.data?.message || 'Login failed');
    } finally { setLoadingState(false); dispatch(setLoading(false)); }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          {otpSent && (
            <TouchableOpacity onPress={() => { setOtpSent(false); setOtp(''); }} style={styles.backBtn}>
              <ChevronLeft size={28} color="black" strokeWidth={3} />
            </TouchableOpacity>
          )}
          <View style={styles.brand}>
            <View style={styles.logoBox}><Bike size={50} color="black" strokeWidth={2.5} /></View>
            <Text style={styles.appName}>BYKE</Text>
            <Text style={styles.tagline}>India's Fastest Bike Taxi App</Text>
          </View>
          <View style={styles.card}>
            {!otpSent ? (
              <>
                <Text style={styles.cardTitle}>Login or Signup</Text>
                <Text style={styles.cardSub}>Get moving with BYKE</Text>
                <View style={styles.phoneRow}>
                  <Text style={styles.cc}>+91</Text>
                  <View style={styles.divider} />
                  <TextInput style={styles.phoneInput} placeholder="Enter Mobile Number" placeholderTextColor="#9CA3AF" keyboardType="number-pad" maxLength={10} value={phone} onChangeText={setPhone} />
                </View>
                <TouchableOpacity onPress={sendOTP} disabled={loading} style={[styles.btn, loading && { opacity: 0.6 }]}>
                  {loading ? <ActivityIndicator color="black" /> : <Text style={styles.btnText}>PROCEED</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>Verify OTP</Text>
                <Text style={styles.cardSub}>Sent to +91 {phone}</Text>
                <TouchableOpacity activeOpacity={1} onPress={() => otpInputRef.current?.focus()} style={styles.otpGrid}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <View key={i} style={[styles.otpBox, otp[i] ? styles.otpFilled : null]}>
                      <Text style={styles.otpChar}>{otp[i] ?? ''}</Text>
                    </View>
                  ))}
                </TouchableOpacity>
                <TextInput ref={otpInputRef} style={styles.hidden} value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} autoFocus />
                <TouchableOpacity onPress={verifyOTP} disabled={loading} style={[styles.btn, loading && { opacity: 0.6 }]}>
                  {loading ? <ActivityIndicator color="black" /> : <Text style={styles.btnText}>VERIFY & LOGIN</Text>}
                </TouchableOpacity>
                <TouchableOpacity onPress={sendOTP} style={styles.resend}>
                  <Text style={styles.resendText}>Resend OTP</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flex: 1, paddingHorizontal: 28, justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 16, left: 0, padding: 8, zIndex: 10 },
  brand: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 90, height: 90, borderRadius: 30, backgroundColor: '#EAB308', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#EAB308', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  appName: { fontSize: 42, fontWeight: '900', color: 'black', letterSpacing: -1 },
  tagline: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginTop: 4 },
  card: { backgroundColor: 'white', borderRadius: 32, padding: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 6 },
  cardTitle: { fontSize: 22, fontWeight: '900', color: 'black', marginBottom: 4 },
  cardSub: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', marginBottom: 24 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 20 },
  cc: { fontSize: 16, fontWeight: '900', color: '#374151', paddingHorizontal: 16, paddingVertical: 18 },
  divider: { width: 1, height: 28, backgroundColor: '#E5E7EB' },
  phoneInput: { flex: 1, fontSize: 16, fontWeight: '700', color: 'black', paddingHorizontal: 16, paddingVertical: 18 },
  btn: { backgroundColor: '#EAB308', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '900', color: 'black', letterSpacing: 1 },
  otpGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  otpBox: { width: 44, height: 56, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center' },
  otpFilled: { borderColor: '#EAB308', backgroundColor: '#FFFBEB' },
  otpChar: { fontSize: 22, fontWeight: '900', color: 'black' },
  hidden: { position: 'absolute', opacity: 0 },
  resend: { alignItems: 'center', marginTop: 16 },
  resendText: { fontSize: 14, color: '#6B7280', fontWeight: '700' },
});

export default LoginScreen;
