import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, MapStyleElement } from 'react-native-maps';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../../store';
import { GOOGLE_PLACES_API_KEY } from '../../../config/env';
import { getCurrentLocation, reverseGeocode, requestLocationPermission } from '../../../services/locationService';
import { searchPlaces, getNearbyPlaces, PlaceResult } from '../../../services/placesService';
import { User, MapPin, Search, Clock, Navigation, X, Bike, Car, Package, LayoutGrid } from 'lucide-react-native';

const FALLBACK_LOCATION = 'Koramangala 5th Block, Bangalore';

const HomeScreen = ({ navigation }: any) => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(FALLBACK_LOCATION);
  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [popularPlaces, setPopularPlaces] = useState<PlaceResult[]>([]);
  const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    initializeLocation();
  }, []);

  useEffect(() => {
    if (searchText.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        searchPlacesDebounced();
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [searchText]);

  const initializeLocation = async () => {
    try {
      setLoading(true);
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Location permission is needed to find nearby places');
        return;
      }

      const coords = await getCurrentLocation();
      setCurrentCoords(coords);
      
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      setCurrentLocation(address);

      const nearby = await getNearbyPlaces(coords.latitude, coords.longitude);
      setPopularPlaces(nearby);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your location. Using default location.');
    } finally {
      setLoading(false);
    }
  };

  const searchPlacesDebounced = async () => {
    try {
      setSearchLoading(true);
      const results = await searchPlaces(searchText, currentCoords || undefined);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching places:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectPlace = (place: PlaceResult) => {
    if (!currentCoords) {
      Alert.alert('Error', 'Unable to get your current location');
      return;
    }

    const distance = calculateDistance(
      currentCoords.latitude,
      currentCoords.longitude,
      place.latitude,
      place.longitude
    );

    navigation.navigate('SelectRide', {
      pickup: currentLocation,
      pickupCoords: currentCoords,
      drop: place.address,
      dropCoords: { latitude: place.latitude, longitude: place.longitude },
      distanceKm: Math.round(distance * 10) / 10,
    });
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFillObject}>
        {currentCoords ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: currentCoords.latitude,
              longitude: currentCoords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={false}
            customMapStyle={mapStyle}
          >
            <Marker coordinate={currentCoords}>
              <View style={styles.userMarker}>
                <Navigation size={20} color="black" fill="black" />
              </View>
            </Marker>
          </MapView>
        ) : (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#EAB308" />
          </View>
        )}
      </View>

      <View style={styles.headerOverlay}>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <User size={24} color="black" />
        </TouchableOpacity>
        
        <View style={styles.locationBadge}>
          <View style={styles.locationDot} />
          <Text style={styles.locationText} numberOfLines={1}>
            {loading ? 'Locating...' : currentLocation}
          </Text>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          
          <Text style={styles.sheetTitle}>Where to go?</Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.searchBar}
            onPress={() => setShowSearch(true)}
          >
            <Search size={22} color="#6B7280" strokeWidth={2.5} />
            <Text style={styles.searchPlaceholder}>Enter destination...</Text>
          </TouchableOpacity>

          <View style={styles.serviceGrid}>
            {[
              { id: 'bike', label: 'Bike', icon: Bike, color: '#EAB308' },
              { id: 'auto', label: 'Auto', icon: Car, color: '#10B981' },
              { id: 'parcel', label: 'Parcel', icon: Package, color: '#3B82F6' },
              { id: 'more', label: 'More', icon: LayoutGrid, color: '#6B7280' },
            ].map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceItem}
                onPress={() => setShowSearch(true)}
              >
                <View 
                  style={[styles.serviceIcon, { backgroundColor: `${service.color}15` }]}
                >
                  <service.icon size={28} color={service.color} strokeWidth={2.5} />
                </View>
                <Text style={styles.serviceLabel}>{service.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Places</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={styles.loaderWrapper}>
                <ActivityIndicator color="#EAB308" />
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {popularPlaces.map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    onPress={() => handleSelectPlace(place)}
                    style={styles.placeCard}
                  >
                    <View style={styles.placeIcon}>
                      <Clock size={20} color="#EAB308" />
                    </View>
                    <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                    <Text style={styles.placeDist}>
                      {Math.round(calculateDistance(currentCoords?.latitude || 0, currentCoords?.longitude || 0, place.latitude, place.longitude) * 10) / 10} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </View>

      {showSearch && (
        <View style={styles.searchOverlay}>
          <View style={styles.searchHeader}>
            <TouchableOpacity onPress={() => setShowSearch(false)} style={styles.closeButton}>
              <X size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.searchTitle}>Search</Text>
          </View>

          <View style={styles.searchInputs}>
            <View style={styles.inputRow}>
              <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
              <TextInput
                style={styles.input}
                value={currentLocation}
                editable={false}
              />
            </View>

            <View style={[styles.inputRow, { backgroundColor: '#F3F4F6' }]}>
              <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
              <TextInput
                style={styles.input}
                placeholder="Where to?"
                placeholderTextColor="#9CA3AF"
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
            </View>
          </View>

          <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
            {searchLoading ? (
              <ActivityIndicator color="#EAB308" style={{ marginTop: 40 }} />
            ) : (
              searchResults.map((place) => (
                <TouchableOpacity
                  key={place.id}
                  style={styles.resultItem}
                  onPress={() => handleSelectPlace(place)}
                >
                  <View style={styles.resultIcon}>
                    <MapPin size={20} color="#6B7280" />
                  </View>
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName}>{place.name}</Text>
                    <Text style={styles.resultAddress} numberOfLines={1}>{place.address}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  loaderContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' },
  userMarker: { backgroundColor: '#EAB308', padding: 10, borderRadius: 25, borderWidth: 4, borderColor: 'white', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  headerOverlay: { position: 'absolute', top: 50, left: 24, right: 24, zIndex: 10, flexDirection: 'row', alignItems: 'center' },
  profileButton: { backgroundColor: 'white', padding: 12, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  locationBadge: { backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5, flexDirection: 'row', alignItems: 'center', flex: 1, marginLeft: 16 },
  locationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E', marginRight: 12 },
  locationText: { fontSize: 14, fontWeight: '700', color: '#1F2937', flex: 1 },
  bottomContainer: { flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: 'white', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40, elevation: 25, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  sheetHandle: { width: 48, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 32 },
  sheetTitle: { fontSize: 28, fontWeight: '900', color: 'black', marginBottom: 24 },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#F3F4F6', borderRadius: 24, paddingHorizontal: 24, paddingVertical: 20, marginBottom: 32 },
  searchPlaceholder: { marginLeft: 16, fontSize: 18, color: '#9CA3AF', fontWeight: '700' },
  serviceGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 40 },
  serviceItem: { alignItems: 'center' },
  serviceIcon: { width: 64, height: 64, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 8, elevation: 2 },
  serviceLabel: { fontSize: 12, fontWeight: '900', color: '#4B5563', textTransform: 'uppercase', letterSpacing: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 14, textTransform: 'uppercase', color: '#9CA3AF', fontWeight: '900' },
  seeAllText: { color: '#EAB308', fontWeight: '900' },
  loaderWrapper: { paddingVertical: 16 },
  horizontalScroll: { marginHorizontal: -8 },
  placeCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 24, marginHorizontal: 8, borderWidth: 1, borderColor: '#F3F4F6', alignItems: 'center', minWidth: 120 },
  placeIcon: { backgroundColor: 'white', padding: 12, borderRadius: 16, marginBottom: 12, elevation: 2 },
  placeName: { fontSize: 14, fontWeight: '900', color: 'black' },
  placeDist: { fontSize: 10, color: '#9CA3AF', fontWeight: '700', marginTop: 4 },
  searchOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'white', zIndex: 50, paddingTop: 50 },
  searchHeader: { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  closeButton: { padding: 8, marginLeft: -8 },
  searchTitle: { fontSize: 24, fontWeight: '900', color: 'black', marginLeft: 8 },
  searchInputs: { paddingHorizontal: 24 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: '#F3F4F6', marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  input: { flex: 1, height: 48, color: 'black', fontWeight: '700' },
  resultsScroll: { marginTop: 24, paddingHorizontal: 24 },
  resultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  resultIcon: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 16, marginRight: 16 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: '900', color: 'black' },
  resultAddress: { fontSize: 14, color: '#9CA3AF', fontWeight: '600', marginTop: 4 }
});

const mapStyle: MapStyleElement[] = [
  { "elementType": "geometry", "stylers": [{"color": "#212121"}] },
  { "elementType": "labels.icon", "stylers": [{"visibility": "off"}] },
  { "elementType": "labels.text.fill", "stylers": [{"color": "#757575"}] },
  { "elementType": "labels.text.stroke", "stylers": [{"color": "#212121"}] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{"color": "#757575"}] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{"color": "#2c2c2c"}] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{"color": "#000000"}] }
];

export default HomeScreen;
