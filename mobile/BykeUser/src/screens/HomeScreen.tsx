import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  Alert,
  Dimensions,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import Modal from 'react-native-modal';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [location, setLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090,
    latitudeDelta: 0.0122,
    longitudeDelta: 0.0121,
  });
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [isServiceModalVisible, setServiceModalVisible] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'BYKE needs access to your location to show nearby riders',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      setHasLocationPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        getCurrentLocation();
      }
    } else {
      setHasLocationPermission(true);
      getCurrentLocation();
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0122,
          longitudeDelta: 0.0121,
        });
      },
      (error) => {
        console.log('Location error:', error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  const serviceTypes = [
    { id: 'ride', title: 'Ride', icon: '🏍️', color: '#3b82f6' },
    { id: 'errand', title: 'Errand', icon: '🛒', color: '#10b981' },
    { id: 'parcel', title: 'Parcel', icon: '📦', color: '#f59e0b' },
  ];

  const handleServiceSelect = (serviceType: string) => {
    setServiceModalVisible(false);
    navigation.navigate('Booking', { serviceType, pickupLocation: location });
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Map */}
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={location}
        showsUserLocation={hasLocationPermission}
        showsMyLocationButton={false}
      >
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title="Your Location"
        />
      </MapView>

      {/* Floating Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.menuIcon}>👤</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.notificationIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Location Button */}
      <TouchableOpacity style={styles.myLocationButton} onPress={getCurrentLocation}>
        <Text style={styles.myLocationIcon}>📍</Text>
      </TouchableOpacity>

      {/* Bottom Card for "Where to?" */}
      <View style={styles.bottomCard}>
        <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'User'}</Text>
        <TouchableOpacity 
          style={styles.whereToButton}
          onPress={() => setServiceModalVisible(true)}
        >
          <Text style={styles.whereToText}>Where to?</Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('MyBookings')}>
            <View style={styles.quickActionIconContainer}>
              <Text style={styles.quickActionIcon}>📋</Text>
            </View>
            <Text style={styles.quickActionText}>Bookings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Services Modal (Bottom Sheet Alternative) */}
      <Modal
        isVisible={isServiceModalVisible}
        onBackdropPress={() => setServiceModalVisible(false)}
        onSwipeComplete={() => setServiceModalVisible(false)}
        swipeDirection={['down']}
        style={styles.modal}
        propagateSwipe
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Choose a Service</Text>
          <View style={styles.servicesGrid}>
            {serviceTypes.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItem}
                onPress={() => handleServiceSelect(service.id)}
              >
                <View style={[styles.serviceIconWrapper, { backgroundColor: `${service.color}15` }]}>
                  <Text style={styles.serviceEmoji}>{service.icon}</Text>
                </View>
                <Text style={styles.serviceName}>{service.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  menuIcon: {
    fontSize: 20,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  notificationIcon: {
    fontSize: 20,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 220,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  myLocationIcon: {
    fontSize: 20,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  whereToButton: {
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  whereToText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
  },
  quickAction: {
    alignItems: 'center',
    marginRight: 24,
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 20,
  },
  quickActionText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#cbd5e1',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
    textAlign: 'center',
  },
  servicesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceItem: {
    alignItems: 'center',
    flex: 1,
  },
  serviceIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceEmoji: {
    fontSize: 28,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
});

export default HomeScreen;
