# Byke User Mobile App

React Native mobile application for Byke users to book rides, errands, and parcel deliveries.

## Tech Stack

- **Framework:** React Native 0.73
- **Language:** TypeScript
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **State Management:** Redux Toolkit
- **Navigation:** React Navigation
- **Maps:** React Native Maps
- **Real-time:** Socket.IO Client
- **Storage:** AsyncStorage
- **Push Notifications:** Firebase Cloud Messaging

## Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio (for Android)
- Xcode (for iOS, macOS only)

## Installation

```bash
# Install dependencies
npm install

# iOS only - install pods
cd ios && pod install && cd ..
```

## Configuration

Create a `.env` file in the root:

```env
API_BASE_URL=http://localhost:8080/api
WS_BASE_URL=ws://localhost:8080/ws
GOOGLE_MAPS_API_KEY=your-google-maps-key
```

## Running the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## Project Structure

```
src/
├── components/       # Reusable UI components
├── screens/         # Screen components
├── navigation/      # Navigation configuration
├── store/          # Redux store and slices
├── services/       # API services
├── config/         # App configuration
├── utils/          # Utility functions
└── types/          # TypeScript types
```

## Key Features

### Authentication
- OTP-based login
- JWT token management
- Auto token refresh

### Booking Flow
1. Select service type (Ride/Errand/Parcel)
2. Enter pickup and drop locations
3. View estimated fare
4. Receive bids from riders
5. Select preferred rider
6. Track ride in real-time
7. Rate and review

### Real-time Features
- Live bid updates via WebSocket
- Real-time rider location tracking
- Push notifications for booking updates

### Maps Integration
- Google Maps for location selection
- Autocomplete for address search
- Live tracking with polyline routes
- ETA calculations

## Build for Production

### Android

```bash
# Generate release APK
cd android
./gradlew assembleRelease

# Generate AAB for Play Store
./gradlew bundleRelease
```

### iOS

```bash
# Open Xcode
open ios/UserApp.xcworkspace

# Select Product > Archive
# Follow App Store submission process
```

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## Troubleshooting

### Metro bundler issues
```bash
npm start -- --reset-cache
```

### Android build issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS build issues
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

## License

Proprietary - All rights reserved
