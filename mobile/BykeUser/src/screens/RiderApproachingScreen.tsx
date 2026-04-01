import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  SafeAreaView,
  Alert,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Phone, MessageCircle, Navigation, User, Star, Clock } from 'lucide-react-native';
import api from '../config/api';
import { GOOGLE_PLACES_API_KEY } from '../config/env';

const RiderApproachingScreen = ({ route, navigation }: any) => {
  const { bookingId } = route.params;
  const mapRef = useRef<MapView>(null);
  const [booking, setBooking] = useState<any>(null);
  const [riderLocation, setRiderLocation] = useState<any>(null);
  const [eta, setEta] = useState<string>('Calculating...');
  const [otp, setOtp] = useState<string>('');

  useEffect(() => {
    fetchBookingDetails();
    const interval = setInterval(fetchBookingDetails, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (booking && riderLocation && mapRef.current) {
      const coordinates = [
        { latitude: riderLocation.latitude, longitude: riderLocation.longitude },
        { latitude: booking.pickupLatitude, longitude: booking.pickupLongitude },
      ];
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: { top: 100, right: 50, bottom: 400, left: 50 },
        animated: true,
      });
    }
  }, [booking, riderLocation]);

  const fetchBookingDetails = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      const bookingData = response.data;
      setBooking(bookingData);

      if (bookingData.status === 'RIDER_ARRIVED' && bookingData.verificationOtp) {
        setOtp(bookingData.verificationOtp);
      }

      if (bookingData.status === 'IN_PROGRESS') {
        navigation.replace('RideInProgress', { bookingId });
      }

      if (bookingData.status === 'COMPLETED') {
        navigation.replace('RatingScreen', { bookingId });
      }

      if (bookingData.rider?.currentLatitude && bookingData.rider?.currentLongitude) {
        setRiderLocation({
          latitude: bookingData.rider.currentLatitude,
          longitude: bookingData.rider.currentLongitude,
        });
      }
    } catch (error) {
      console.log('Error fetching booking:', error);
    }
  };

  const handleCall = () => {
    if (booking?.rider?.user?.mobileNumber) {
      Linking.openURL(`tel:${booking.rider.user.mobileNumber}`);
    }
  };

  const handleChat = () => {
    Alert.alert('Chat', 'Chat feature coming soon!');
  };

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/bookings/${bookingId}/cancel`, null, {
                params: { reason: 'User cancelled', byUser: true }
              });
              Alert.alert('Cancelled', 'Ride cancelled successfully.', [
                { text: 'OK', onPress: () => navigation.replace('Home') }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to cancel ride');
            }
          }
        }
      ]
    );
  };

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const isRiderArrived = booking.status === 'RIDER_ARRIVED';

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: booking.pickupLatitude,
          longitude: booking.pickupLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {riderLocation && (
          <Marker coordinate={riderLocation} title="Rider Location">
            <View style={styles.riderMarker}>
              <Navigation size={20} color="white" fill="white" />
            </View>
          </Marker>
        )}

        <Marker
          coordinate={{
            latitude: booking.pickupLatitude,
            longitude: booking.pickupLongitude,
          }}
          title="Your Pickup Location"
        >
          <View style={styles.pickupMarker}>
            <User size={24} color="white" />
          </View>
        </Marker>

        {riderLocation && (
          <MapViewDirections
            origin={riderLocation}
            destination={{
              latitude: booking.pickupLatitude,
              longitude: booking.pickupLongitude,
            }}
            apikey={GOOGLE_PLACES_API_KEY}
            strokeWidth={4}
            strokeColor="#3B82F6"
            onReady={(result) => {
              const minutes = Math.ceil(result.duration);
              setEta(`${minutes} min${minutes !== 1 ? 's' : ''}`);
            }}
          />
        )}
      </MapView>

      <SafeAreaView style={styles.topBar}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: isRiderArrived ? '#10B981' : '#F59E0B' }]} />
          <Text style={styles.statusText}>
            {isRiderArrived ? 'Rider Arrived' : 'Rider Approaching'}
          </Text>
        </View>
      </SafeAreaView>

      <View style={styles.bottomSheet}>
        {isRiderArrived && otp && (
          <View style={styles.otpCard}>
            <Text style={styles.otpLabel}>Share this OTP with Rider</Text>
            <Text style={styles.otpValue}>{otp}</Text>
            <Text style={styles.otpHint}>The rider will ask for this code to start the ride</Text>
          </View>
        )}

        <View style={styles.riderCard}>
          <View style={styles.riderAvatar}>
            <User size={32} color="#3B82F6" />
          </View>
          <View style={styles.riderInfo}>
            <Text style={styles.riderName}>{booking.rider?.user?.fullName || 'Rider'}</Text>
            <View style={styles.riderMeta}>
              <Star size={14} color="#EAB308" fill="#EAB308" />
              <Text style={styles.riderRating}>
                {booking.rider?.averageRating?.toFixed(1) || '5.0'}
              </Text>
              <Text style={styles.riderVehicle}>
                • {booking.rider?.vehicleModel || 'Two Wheeler'}
              </Text>
            </View>
            <Text style={styles.vehicleNumber}>{booking.rider?.vehicleNumber || 'DL01AB1234'}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCall}>
              <Phone size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { backgroundColor: '#10B981' }]} onPress={handleChat}>
              <MessageCircle size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {!isRiderArrived && (
          <View style={styles.etaCard}>
            <Clock size={20} color="#3B82F6" />
            <Text style={styles.etaLabel}>Estimated Arrival</Text>
            <Text style={styles.etaValue}>{eta}</Text>
          </View>
        )}

        <View style={styles.locationCard}>
          <View style={styles.locationDot} />
          <View style={styles.locationInfo}>
            <Text style={styles.locationLabel}>Pickup Location</Text>
            <Text style={styles.locationAddress}>{booking.pickupAddress}</Text>
          </View>
        </View>

        {booking.dropAddress && (
          <View style={styles.locationCard}>
            <View style={[styles.locationDot, { backgroundColor: '#EF4444' }]} />
            <View style={styles.locationInfo}>
              <Text style={styles.locationLabel}>Drop Location</Text>
              <Text style={styles.locationAddress}>{booking.dropAddress}</Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelRide}>
          <Text style={styles.cancelBtnText}>Cancel Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  riderMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  pickupMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  otpCard: {
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  otpLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  otpValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1E3A8A',
    letterSpacing: 12,
    marginBottom: 8,
  },
  otpHint: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3B82F6',
    textAlign: 'center',
  },
  riderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
  },
  riderAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  riderInfo: {
    flex: 1,
  },
  riderName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
    marginBottom: 4,
  },
  riderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  riderRating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
    marginLeft: 4,
  },
  riderVehicle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginLeft: 4,
  },
  vehicleNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3B82F6',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  etaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  etaLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginLeft: 12,
  },
  etaValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E3A8A',
  },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginTop: 4,
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    lineHeight: 20,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#DC2626',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default RiderApproachingScreen;
