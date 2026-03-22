import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import { ArrowLeft, Info } from 'lucide-react-native';
import { createRideRequest } from '../../../services/rideService';

const { height } = Dimensions.get('window');
const FARE_STEPS = [0, 25, 50, 75, 100];

const SetPriceScreen = ({ navigation, route }: any) => {
  const { pickup, drop, distanceKm, pickupCoords, dropCoords, vehicle, maxFare } = route.params;
  const [fareStep, setFareStep] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleFindRiders = async () => {
    if (!pickupCoords || !dropCoords) {
      Alert.alert('Error', 'Location coordinates are missing');
      return;
    }

    try {
      setLoading(true);
      const { rideId } = await createRideRequest({
        pickupLocation: {
          latitude: pickupCoords.latitude,
          longitude: pickupCoords.longitude,
          address: pickup,
        },
        dropLocation: {
          latitude: dropCoords.latitude,
          longitude: dropCoords.longitude,
          address: drop,
        },
        vehicleType: vehicle.label,
        maxFare,
        distanceKm,
      });

      navigation.navigate('UserBids', {
        rideId,
        from: pickup,
        to: drop,
        maxFare,
        vehicleType: vehicle.label,
        distanceKm,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create ride request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.headerOverlay}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="black" />
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          
          <Text style={styles.sheetTitle}>Set Your Price</Text>

          <View style={styles.fareCard}>
            <View style={styles.fareHeader}>
              <View>
                <Text style={styles.fareTitle}>Drivers will bid around this</Text>
                <Text style={styles.fareSubtitle}>Choose your fare multiplier</Text>
              </View>
              <TouchableOpacity style={styles.infoButton}>
                <Info size={20} color="white" />
              </TouchableOpacity>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>₹{maxFare}</Text>
              <Text style={styles.priceLabel}>Recommended Max Fare</Text>
            </View>

            <View style={styles.stepContainer}>
              {FARE_STEPS.map((step, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.85}
                  onPress={() => setFareStep(idx)}
                  style={[
                    styles.stepButton,
                    fareStep === idx ? styles.stepButtonActive : styles.stepButtonInactive
                  ]}
                >
                  <Text style={[
                    styles.stepText,
                    fareStep === idx ? { color: 'black' } : { color: 'white' }
                  ]}>
                    {idx === 0 ? 'SAVER' : idx === 4 ? 'FAST' : idx === 2 ? 'FAIR' : `+${step}%`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleFindRiders}
            disabled={loading}
            style={[
              styles.ctaButton,
              loading ? { backgroundColor: '#E5E7EB' } : { backgroundColor: '#EAB308' }
            ]}
          >
            {loading ? (
              <ActivityIndicator color="black" />
            ) : (
              <Text style={styles.ctaText}>Request Ride • ₹{maxFare}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  headerOverlay: { position: 'absolute', top: 0, left: 20, zIndex: 10 },
  backButton: { backgroundColor: 'white', width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, marginTop: 20 },
  scrollContent: { flex: 1, marginTop: height * 0.12 },
  sheet: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 20, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.15, shadowRadius: 20 },
  sheetHandle: { width: 48, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  sheetTitle: { fontSize: 28, fontWeight: '900', color: 'black', marginBottom: 24 },
  fareCard: { backgroundColor: '#111827', borderRadius: 32, padding: 24, marginBottom: 32 },
  fareHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  fareTitle: { color: 'white', fontSize: 20, fontWeight: '900' },
  fareSubtitle: { color: '#9CA3AF', fontSize: 12, fontWeight: '600', marginTop: 2 },
  infoButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 12 },
  priceContainer: { backgroundColor: '#EAB308', borderRadius: 24, paddingVertical: 24, alignItems: 'center', marginBottom: 24 },
  priceText: { fontSize: 50, fontWeight: '900', color: 'black' },
  priceLabel: { fontSize: 11, color: 'rgba(0,0,0,0.5)', fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  stepContainer: { flexDirection: 'row', gap: 8 },
  stepButton: { flex: 1, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  stepButtonActive: { backgroundColor: 'white', borderColor: 'white' },
  stepButtonInactive: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.1)' },
  stepText: { fontSize: 11, fontWeight: '900' },
  ctaButton: { height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#EAB308', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12 },
  ctaText: { fontSize: 18, fontWeight: '900', color: 'black', textTransform: 'uppercase', letterSpacing: 1 },
});

export default SetPriceScreen;
