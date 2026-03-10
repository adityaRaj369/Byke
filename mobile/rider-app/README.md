# Byke Rider Mobile App

React Native mobile application for Byke riders to receive bookings, place bids, and complete rides.

## Features

### 🏠 Home Screen
- Availability toggle (Online/Offline)
- Real-time earnings dashboard
- Subscription status
- Quick access to all features

### 📋 Available Bookings
- Browse nearby booking requests
- Real-time booking notifications via WebSocket
- View booking details (pickup, drop, distance, fare)
- Filter by service type

### 💰 Bidding System
- Place competitive bids on bookings
- Adjustable bid amount with slider
- Min/max bid validation
- Edit bids before acceptance

### 🏍️ Active Ride Management
- Navigate to pickup location
- Mark arrival at pickup
- Start ride when user is ready
- Navigate to drop location
- Complete ride and collect payment

### 📄 Document Management
- Upload all required documents
- Camera and gallery integration
- Document verification status
- Replace/update documents

### 💵 Earnings Tracking
- Daily, weekly, monthly earnings
- Ride history with fare breakdown
- Subscription payment tracking

### 📱 Additional Features
- Background location tracking when available
- Push notifications for new bookings
- In-app navigation to Google Maps
- Call user directly from app
- Real-time ride status updates

## Tech Stack

- React Native 0.73
- TypeScript
- NativeWind (Tailwind CSS)
- Redux Toolkit
- React Navigation
- React Native Maps
- Socket.IO Client
- React Native Image Picker
- React Native Geolocation

## Installation

```bash
# Install dependencies
npm install

# iOS only - install pods
cd ios && pod install && cd ..
```

## Configuration

Create `.env` file:

```env
API_BASE_URL=http://localhost:8080/api
WS_BASE_URL=ws://localhost:8080/ws
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## Running

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Key Screens

1. **RiderHomeScreen** - Dashboard with availability toggle
2. **AvailableBookingsScreen** - Browse and bid on bookings
3. **PlaceBidScreen** - Place competitive bid with slider
4. **ActiveRideScreen** - Navigate and complete ride
5. **DocumentsScreen** - Upload and manage documents
6. **EarningsScreen** - Track income and ride history
7. **ProfileScreen** - Rider profile and settings

## Background Location

The app tracks rider location in the background when:
- Rider is marked as "Available"
- Location updates every 50 meters or 5 seconds
- Updates sent to backend for user tracking

## Permissions Required

- Location (Always) - For background tracking
- Camera - For document upload
- Photo Library - For document upload
- Notifications - For booking alerts

## Build for Production

### Android
```bash
cd android
./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### iOS
```bash
open ios/RiderApp.xcworkspace
# Product > Archive > Distribute
```

## License

Proprietary - All rights reserved
