# BYKE Platform - Complete Requirements & Implementation Plan

## Overview
BYKE is a two-wheeler ride-hailing platform with OTP-only authentication, dynamic bidding, real-time tracking, and subscription-based rider model.

---

## Phase 1: Core Authentication & User Management (DONE)
- ✅ Firebase Phone OTP (real SMS via byke-app-31cb3)
- ✅ JWT token generation and refresh
- ✅ User role differentiation (USER/RIDER)
- ✅ Device/session tracking

---

## Phase 2: Ride Request & Bidding System (IN PROGRESS)

### 2.1 Backend Domain Models
**RideRequest**
- id, userId, pickupLocation, dropoffLocation, pickupCoords, dropoffCoords
- serviceType (RIDE/ERRAND/PARCEL), maxFare, estimatedDistance, estimatedDuration
- status (PENDING, ACCEPTED, COMPLETED, CANCELLED)
- createdAt, acceptedAt, completedAt
- biddingWindowSeconds (default 45)

**Bid**
- id, rideRequestId, riderId, bidAmount, vehicleId
- status (PENDING, ACCEPTED, REJECTED, EXPIRED)
- createdAt, expiresAt
- timerPercent (calculated from expiry)

**Trip**
- id, rideRequestId, bidId, userId, riderId
- status (ACCEPTED, RIDER_ARRIVING, ARRIVED, IN_PROGRESS, COMPLETED, CANCELLED)
- pickupTime, dropoffTime, actualDistance, actualFare
- riderLocation (lat/lng), userLocation (lat/lng) - updated in real-time
- rating, review

**Vehicle**
- id, riderId, vehicleType (BIKE/AUTO/CAB/SHARE), vehicleNumber, registrationDoc
- status (ACTIVE/INACTIVE), verificationStatus

**Rider**
- id, userId, totalRides, rating, isVerified, isTopRated, isWomenPreferred
- availabilityStatus (ONLINE/OFFLINE), currentLocation (lat/lng)
- subscriptionStatus, subscriptionExpiryDate

**Payment**
- id, tripId, userId, riderId, amount, paymentMethod, status (PENDING/SUCCESS/FAILED)
- platformFee, riderEarnings

**Rating**
- id, tripId, fromUserId, toRiderId, rating (1-5), review, createdAt

### 2.2 Backend REST APIs

#### Ride Endpoints
```
POST   /api/rides                    - Create ride request
GET    /api/rides/{id}               - Get ride details
GET    /api/rides/user/{userId}      - Get user's ride history
PUT    /api/rides/{id}/cancel        - Cancel ride
```

#### Bid Endpoints
```
GET    /api/rides/{id}/bids          - Get all bids for a ride
POST   /api/bids                     - Rider place bid
PUT    /api/bids/{id}/accept         - User accept bid
PUT    /api/bids/{id}/reject         - User reject bid
```

#### Trip Endpoints
```
GET    /api/trips/{id}               - Get trip details
PUT    /api/trips/{id}/status        - Update trip status (rider arriving, started, completed)
GET    /api/trips/{id}/location      - Get real-time rider location
PUT    /api/trips/{id}/location      - Update rider location (WebSocket preferred)
POST   /api/trips/{id}/rating        - Rate trip
```

#### Rider Endpoints
```
GET    /api/riders/available         - Get available ride requests (for riders)
PUT    /api/riders/status            - Toggle online/offline
PUT    /api/riders/location          - Update current location
GET    /api/riders/{id}              - Get rider profile (rating, verification, etc.)
```

#### Payment Endpoints
```
POST   /api/payments                 - Initiate payment
GET    /api/payments/{id}            - Get payment status
GET    /api/wallet/{userId}          - Get wallet balance
```

### 2.3 Real-Time Features
- **WebSocket** for:
  - Rider receiving new ride requests
  - User receiving live bids with timer updates
  - Trip status updates (rider arriving, started, completed)
  - Driver location updates (lat/lng every 5 seconds)
- **Redis Pub/Sub** for:
  - Bid expiry notifications
  - Trip status broadcasts
  - Notification queue

---

## Phase 3: Mobile App - User Flow

### 3.1 Post-Login Navigation
```
Home Screen
├── Map with current location
├── Search destination (with recent/popular places)
├── Select vehicle type (Bike/Auto/Cab/Share)
├── Confirm ride request
│
Bids Screen
├── Live bids list with timer
├── Rider cards (rating, verification, vehicle, ETA)
├── Accept/Reject bid
│
Trip Tracking Screen
├── Real-time map with driver location
├── Trip status timeline (rider arriving → arrived → in progress → completed)
├── Contact rider (call/chat)
├── SOS button
├── Share trip
├── Cancel trip
│
History & Profile
├── Past rides
├── Ratings & reviews
├── Wallet & payments
├── Settings
```

### 3.2 UI Components to Integrate
- Copy screens from `RideBidFull/src/screens/user/` into BykeUser app
- Wire mock data to real API calls
- Add WebSocket listeners for bid updates and trip tracking
- Implement proper error handling and loading states

---

## Phase 4: Mobile App - Rider Flow

### 4.1 Rider App Structure
```
Home Screen (Available Requests)
├── List of ride requests with quick bid buttons
├── Request details (from/to, distance, max fare, current bids)
│
Bid Placement Screen
├── Slider for bid amount (min/max based on distance)
├── Quick bid chips
├── Passenger details
├── Confirm bid
│
Active Trip Screen
├── Pickup/dropoff info
├── Status buttons (Arrived → Start Trip → End Trip)
├── Earnings summary
├── Passenger contact
│
Trip History & Earnings
├── Completed trips
├── Total earnings
├── Subscription status
├── Ratings
```

### 4.2 Rider App Setup
- Create new React Native app: `mobile/BykeRider`
- Reuse auth logic from BykeUser
- Implement bidding and trip management screens
- Real-time location updates to backend

---

## Phase 5: Payments & Wallet

### 5.1 Payment Flow
1. User completes trip
2. Backend calculates fare: `baseFare + distanceFare + surgePricing`
3. Platform fee deducted (e.g., 20%)
4. Rider earnings calculated
5. Payment processed via Razorpay/Stripe
6. Wallet updated

### 5.2 Subscription Model
- Riders pay ₹500/month flat
- No per-ride commission
- Subscription status checked on every bid placement

---

## Phase 6: Advanced Features

### 6.1 SOS & Safety
- SOS button in trip tracking screen
- Sends location + trip details to emergency contacts
- Backend logs SOS events

### 6.2 Notifications
- Firebase Cloud Messaging (FCM) for:
  - New ride requests (riders)
  - New bids (users)
  - Trip status updates
  - Payment confirmations

### 6.3 Ratings & Reviews
- After trip completion, user rates rider (1-5 stars)
- Rider rates user
- Reviews stored and displayed on profiles
- Top-rated badge for riders with avg rating > 4.8

### 6.4 Admin Dashboard
- Monitor active rides
- View SOS alerts
- Dispute resolution
- Analytics (rides/day, avg fare, platform revenue)

---

## Phase 7: Deployment & DevOps

### 7.1 Backend Deployment
- Fix Firebase credentials (byke-app-31cb3) in GitHub Secrets
- Update EC2 IP to stable hostname (DuckDNS/Cloudflare)
- Enable HTTPS with Let's Encrypt
- Set up monitoring (CloudWatch/ELK)

### 7.2 Mobile Deployment
- Build release APKs for both BykeUser and BykeRider
- Update API base URL to stable hostname
- Publish to Google Play Store (beta testing first)

---

## Implementation Order
1. **Week 1**: Backend models + ride/bid/trip APIs
2. **Week 2**: Real-time WebSocket integration
3. **Week 3**: User mobile app (home → bids → tracking)
4. **Week 4**: Rider mobile app (requests → bidding → trips)
5. **Week 5**: Payments, wallet, subscription
6. **Week 6**: SOS, notifications, ratings
7. **Week 7**: Testing, bug fixes, deployment

---

## Success Criteria
- ✅ User can request ride, receive bids, accept, and track in real-time
- ✅ Rider can see requests, place bids, manage trips
- ✅ Payments processed correctly with proper fare calculation
- ✅ Real-time location updates every 5 seconds
- ✅ Bid timers work accurately (45-second window)
- ✅ SOS and notifications functional
- ✅ Zero crashes on production devices
- ✅ Sub-2-second API response times
