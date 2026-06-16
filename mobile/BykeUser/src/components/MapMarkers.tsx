import React, {useEffect, useRef, useState} from 'react';
import {Animated, Image, StyleSheet, View} from 'react-native';
import {Marker, MarkerAnimated, AnimatedRegion} from 'react-native-maps';
import {colors, getVehicleImage, userMarkerImage} from '../theme';

type Coord = {latitude: number; longitude: number};

/**
 * Compass bearing (0-360°) from point A to point B — same maths Uber/Zomato
 * use to make the moving vehicle face its direction of travel.
 */
export function getBearing(a: Coord, b: Coord): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * A 3D vehicle marker that smoothly glides between location updates and faces
 * its direction of travel (Rapido / Uber / Zomato style).
 *
 * - Position is interpolated natively via AnimatedRegion.timing (the "running"
 *   glide between discrete GPS pings).
 * - `rotates`: set TRUE for a top-down vehicle icon (it will spin to the travel
 *   bearing like Zomato's scooter). Leave FALSE for 3/4-perspective renders —
 *   they read best flipped left/right instead of rotated.
 */
export function ApproachingVehicleMarker({
  coordinate,
  vehicleId,
  size = 68,
  zIndex = 9,
  rotates = false,
  duration = 4500,
}: {
  coordinate: Coord;
  vehicleId?: string;
  size?: number;
  zIndex?: number;
  rotates?: boolean;
  duration?: number;
}) {
  const region = useRef(
    new AnimatedRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current;
  const prev = useRef<Coord>(coordinate);
  const [facingLeft, setFacingLeft] = useState(false);
  const [heading, setHeading] = useState(0);
  const [tracks, setTracks] = useState(true);

  useEffect(() => {
    const next = {
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    };

    const moved =
      Math.abs(next.latitude - prev.current.latitude) > 1e-7 ||
      Math.abs(next.longitude - prev.current.longitude) > 1e-7;

    if (moved) {
      if (rotates) {
        setHeading(getBearing(prev.current, next));
      } else {
        setFacingLeft(next.longitude < prev.current.longitude);
      }
    }
    prev.current = next;

    // Smoothly glide to the new position (the continuous "running" motion).
    region
      .timing({
        latitude: next.latitude,
        longitude: next.longitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
        duration,
        useNativeDriver: false,
      } as any)
      .start();

    // Re-render the marker bitmap briefly so the move/rotation is reflected.
    setTracks(true);
    const t = setTimeout(() => setTracks(false), duration + 400);
    return () => clearTimeout(t);
  }, [coordinate.latitude, coordinate.longitude, region, rotates, duration]);

  const imgTransform = rotates
    ? [{rotate: `${heading}deg`}]
    : facingLeft
    ? [{scaleX: -1}]
    : [];

  return (
    <MarkerAnimated
      coordinate={region as any}
      anchor={{x: 0.5, y: 0.62}}
      flat={rotates}
      tracksViewChanges={tracks}
      zIndex={zIndex}>
      <View style={[styles.vehicleWrap, {width: size, height: size + 12}]}>
        <Image
          source={getVehicleImage(vehicleId)}
          resizeMode="contain"
          style={[styles.vehicleImg, {width: size, height: size}, {transform: imgTransform}]}
        />
        {!rotates && <View style={styles.groundShadow} />}
      </View>
    </MarkerAnimated>
  );
}

/**
 * The user's own location marker — a 3D badge (assets/icons/user.png) sitting
 * on a soft pulsing halo. Drop in your own user.png to rebrand; no code change.
 */
export function UserLocationMarker({
  coordinate,
  size = 46,
  zIndex = 8,
}: {
  coordinate: Coord;
  size?: number;
  zIndex?: number;
}) {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [pulse]);

  const haloScale = pulse.interpolate({inputRange: [0, 1], outputRange: [0.6, 2.2]});
  const haloOpacity = pulse.interpolate({inputRange: [0, 1], outputRange: [0.35, 0]});

  return (
    <Marker
      coordinate={coordinate}
      anchor={{x: 0.5, y: 0.5}}
      flat
      tracksViewChanges={false}
      zIndex={zIndex}>
      <View style={[styles.userWrap, {width: size * 2.4, height: size * 2.4}]}>
        <Animated.View
          style={[
            styles.userHalo,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              opacity: haloOpacity,
              transform: [{scale: haloScale}],
            },
          ]}
        />
        <Image
          source={userMarkerImage}
          resizeMode="contain"
          style={{width: size, height: size}}
        />
      </View>
    </Marker>
  );
}

const styles = StyleSheet.create({
  vehicleWrap: {alignItems: 'center', justifyContent: 'flex-end'},
  vehicleImg: {},
  groundShadow: {
    position: 'absolute',
    bottom: 0,
    width: 26,
    height: 7,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  userWrap: {alignItems: 'center', justifyContent: 'center'},
  userHalo: {
    position: 'absolute',
    backgroundColor: colors.white,
  },
});

export default ApproachingVehicleMarker;
