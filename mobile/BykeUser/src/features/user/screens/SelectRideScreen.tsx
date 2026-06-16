import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {GOOGLE_PLACES_API_KEY} from '../../../config/env';
import {VEHICLE_TYPES} from '../../../data/mockData';
import {ArrowLeft, Navigation, Clock} from 'lucide-react-native';
import {colors, darkMapStyle, getVehicleImage} from '../../../theme';
import CardGradient from '../../../components/CardGradient';

const {height} = Dimensions.get('window');

const SelectRideScreen = ({navigation, route}: any) => {
  const {pickup, drop, distanceKm, pickupCoords, dropCoords} = route.params;
  const [selectedVehicle, setSelectedVehicle] = useState('auto');

  const getBaseFareForVehicle = (v: any) => {
    if (!v) {
      return Math.round(15 * distanceKm);
    }
    const perKm = Number(v.baseMin) / 18;
    return Math.max(Math.round(perKm * distanceKm), 30);
  };

  const vehicle = VEHICLE_TYPES.find(v => v.id === selectedVehicle);
  const baseFare = getBaseFareForVehicle(vehicle);
  const maxFare = baseFare + 80;

  const handleVehicleSelect = (v: any) => {
    setSelectedVehicle(v.id);
    navigation.navigate('SetPrice', {
      pickup,
      drop,
      distanceKm,
      pickupCoords,
      dropCoords,
      vehicle: v,
      maxFare: getBaseFareForVehicle(v) + 80,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        {pickupCoords && dropCoords ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFill}
            initialRegion={{
              latitude: (pickupCoords.latitude + dropCoords.latitude) / 2,
              longitude: (pickupCoords.longitude + dropCoords.longitude) / 2,
              latitudeDelta:
                Math.abs(pickupCoords.latitude - dropCoords.latitude) * 1.8,
              longitudeDelta:
                Math.abs(pickupCoords.longitude - dropCoords.longitude) * 1.8,
            }}
            customMapStyle={darkMapStyle}>
            <Marker coordinate={pickupCoords} title="Pickup">
              <View style={styles.pickupMarker}>
                <View style={styles.pickupMarkerDot} />
              </View>
            </Marker>
            <Marker coordinate={dropCoords} title="Drop">
              <View style={styles.dropMarker}>
                <View style={styles.dropMarkerDot} />
              </View>
            </Marker>
            <MapViewDirections
              origin={pickupCoords}
              destination={dropCoords}
              apikey={GOOGLE_PLACES_API_KEY}
              strokeWidth={5}
              strokeColor={colors.accent}
              optimizeWaypoints={true}
            />
          </MapView>
        ) : (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        )}
      </View>

      <SafeAreaView style={styles.headerOverlay}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
      </SafeAreaView>

      <View style={styles.overlayContainer}>
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />

          <Text style={styles.sheetTitle}>Choose a ride</Text>

          <View style={styles.routeCard}>
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, {backgroundColor: colors.success}]} />
              <Text style={styles.routeText} numberOfLines={1}>
                {pickup}
              </Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeRow}>
              <View style={[styles.routeDot, {backgroundColor: colors.danger}]} />
              <Text style={styles.routeText} numberOfLines={1}>
                {drop}
              </Text>
            </View>

            <View style={styles.routeStats}>
              <Navigation size={14} color={colors.textSub} />
              <Text style={styles.statText}>{distanceKm} km</Text>
              <View style={styles.statDivider} />
              <Clock size={14} color={colors.textSub} />
              <Text style={styles.statText}>
                ~{Math.round(distanceKm * 1.4)} min
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 12}}>
            {VEHICLE_TYPES.map(v => {
              const active = selectedVehicle === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  activeOpacity={0.85}
                  onPress={() => setSelectedVehicle(v.id)}
                  style={[
                    styles.vehicleRow,
                    active ? styles.vehicleRowActive : styles.vehicleRowInactive,
                  ]}>
                  <CardGradient radius={16} />
                  <View style={styles.vehicleThumb}>
                    <Image
                      source={getVehicleImage(v.id)}
                      style={styles.vehicleImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleLabel}>{v.label}</Text>
                    <Text style={styles.vehicleDesc} numberOfLines={1}>
                      {v.desc} · {v.etaMin} min away
                    </Text>
                  </View>
                  <Text style={styles.vehiclePrice}>
                    ₹{getBaseFareForVehicle(v)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.confirmBtn}
              onPress={() => vehicle && handleVehicleSelect(vehicle)}>
              <Text style={styles.confirmBtnText}>
                Choose {vehicle?.label || 'Ride'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, position: 'relative'},
  mapContainer: {...StyleSheet.absoluteFillObject},
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
  },
  headerOverlay: {position: 'absolute', top: 0, left: 20, zIndex: 10},
  backButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 8,
    marginTop: 20,
  },
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.65,
    zIndex: 5,
  },
  scrollContent: {flex: 1, backgroundColor: 'transparent'},
  sheet: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 14,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -10},
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  sheetHandle: {
    width: 48,
    height: 6,
    backgroundColor: colors.borderStrong,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 24,
  },
  routeCard: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  routeRow: {flexDirection: 'row', alignItems: 'center'},
  routeDot: {width: 10, height: 10, borderRadius: 5, marginRight: 16},
  routeText: {flex: 1, fontSize: 16, fontWeight: '700', color: colors.text},
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.borderStrong,
    marginLeft: 4,
    marginVertical: 4,
  },
  routeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 16,
  },
  statText: {marginLeft: 8, fontSize: 13, fontWeight: '900', color: colors.textSub},
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.borderStrong,
    marginHorizontal: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textMute,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginBottom: 10,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  vehicleRowActive: {borderColor: colors.accent},
  vehicleRowInactive: {borderColor: 'transparent'},
  vehicleThumb: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  vehicleImage: {width: 54, height: 54},
  vehicleInfo: {flex: 1},
  vehicleLabel: {fontSize: 16, fontWeight: '800', color: colors.text},
  vehicleDesc: {
    fontSize: 12,
    color: colors.textMute,
    fontWeight: '600',
    marginTop: 3,
  },
  vehiclePrice: {fontSize: 17, fontWeight: '900', color: colors.text, marginLeft: 10},
  footer: {
    paddingTop: 12,
    paddingBottom: 28,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmBtn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.onAccent,
    letterSpacing: 0.3,
  },
  pickupMarker: {
    backgroundColor: '#22C55E',
    padding: 4,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'white',
  },
  pickupMarkerDot: {
    width: 6,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 3,
  },
  dropMarker: {
    backgroundColor: '#EF4444',
    padding: 4,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: 'white',
  },
  dropMarkerDot: {
    width: 6,
    height: 6,
    backgroundColor: 'white',
    borderRadius: 3,
  },
});

export default SelectRideScreen;
