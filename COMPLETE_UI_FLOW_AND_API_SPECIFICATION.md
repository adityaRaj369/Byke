# BYKE - Complete UI Flow & API Specification
## Rapido-Style Feature Implementation Plan

**Last Updated:** March 14, 2026  
**Purpose:** Complete screen-by-screen UI flow with exact API calls for User App, Rider App, and Admin Dashboard

---

## Table of Contents
1. [Current Backend API Inventory](#current-backend-api-inventory)
2. [Missing APIs Required](#missing-apis-required)
3. [User App - Complete UI Flow](#user-app-complete-ui-flow)
4. [Rider App - Complete UI Flow](#rider-app-complete-ui-flow)
5. [Admin Dashboard - Complete UI Flow](#admin-dashboard-complete-ui-flow)
6. [WebSocket Integration](#websocket-integration)
7. [Implementation Priority](#implementation-priority)

---

## Current Backend API Inventory

### Authentication APIs ✅
- `POST /api/auth/send-otp` - Send OTP to mobile
- `POST /api/auth/verify-otp` - Verify OTP for user login
- `POST /api/auth/rider/verify-otp` - Verify OTP for rider login
- `POST /api/auth/verify-firebase-token` - User Firebase token verification
- `POST /api/auth/rider/verify-firebase-token` - Rider Firebase token verification

### Booking APIs ✅
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/{id}` - Get booking details
- `GET /api/bookings/user/my-bookings` - Get user's bookings
- `GET /api/bookings/rider/my-bookings` - Get rider's bookings
- `PATCH /api/bookings/{id}/status` - Update booking status
- `POST /api/bookings/{id}/cancel` - Cancel booking
- `POST /api/bookings/{id}/rate` - Rate booking

### Bidding APIs ✅
- `POST /api/bids` - Place bid on booking
- `GET /api/bids/booking/{bookingId}` - Get all bids for booking
- `POST /api/bids/{bidId}/accept` - Accept a bid
- `POST /api/bids/broadcast/{bookingId}` - Broadcast booking to nearby riders

### Rider APIs ✅
- `POST /api/rider/apply` - Submit rider application
- `GET /api/rider/profile` - Get rider profile
- `PATCH /api/rider/documents` - Update document URLs
- `PATCH /api/rider/location` - Update rider location
- `PATCH /api/rider/status` - Update rider availability status
- `GET /api/rider/nearby` - Get nearby available riders

### Payment APIs ✅ (Currently Free Tier)
- `POST /api/payments/create-subscription` - Create subscription (auto-free)
- `POST /api/payments/confirm-subscription` - Confirm subscription
- `GET /api/payments/subscription-status` - Get subscription status
- `POST /api/payments/webhook/stripe` - Stripe webhook handler

### Complaint APIs ✅
- `POST /api/complaints` - Create complaint
- `GET /api/complaints/my-complaints` - Get user's complaints
- `GET /api/complaints/open` - Get open complaints (admin)
- `POST /api/complaints/{id}/resolve` - Resolve complaint

### File Upload APIs ✅
- `POST /api/upload/document` - Upload document
- `POST /api/upload/profile-photo` - Upload profile photo
- `POST /api/upload/vehicle-photo` - Upload vehicle photo

### Admin APIs ✅
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/riders/pending` - Pending rider applications
- `POST /api/admin/riders/{riderId}/approve` - Approve rider
- `POST /api/admin/riders/{riderId}/reject` - Reject rider
- `GET /api/admin/riders/active` - Get active riders
- `GET /api/admin/bookings/active` - Get active bookings

---

## Missing APIs Required

### 🔴 Critical Missing APIs

#### 1. User Profile Management
**Why needed:** Users need to view/edit their profile, saved addresses, preferences

```java
// UserController.java - NEW
GET /api/user/profile - Get current user profile
PATCH /api/user/profile - Update user profile (name, email, photo)
POST /api/user/addresses - Add saved address
GET /api/user/addresses - Get saved addresses
DELETE /api/user/addresses/{id} - Delete saved address
PATCH /api/user/addresses/{id} - Update saved address
```

#### 2. Booking Search & Filters
**Why needed:** Users need to filter/search their booking history

```java
// BookingController.java - ADD
GET /api/bookings/user/history?status={status}&serviceType={type}&page={page} - Paginated history with filters
GET /api/bookings/user/active - Get only active bookings for user
```

#### 3. Rider Earnings & Stats
**Why needed:** Riders need to see earnings, ride stats, performance metrics

```java
// RiderController.java - ADD
GET /api/rider/earnings/today - Today's earnings summary
GET /api/rider/earnings/week - This week's earnings
GET /api/rider/earnings/month - This month's earnings
GET /api/rider/stats - Ride stats (total rides, rating, acceptance rate)
GET /api/rider/earnings/history?startDate={date}&endDate={date} - Earnings history
```

#### 4. Live Tracking & ETA
**Why needed:** Real-time rider location during ride, ETA updates

```java
// BookingController.java - ADD
GET /api/bookings/{id}/live-location - Get rider's current location for active booking
PATCH /api/bookings/{id}/eta - Update ETA (called by rider app)
```

#### 5. In-App Chat/Messages
**Why needed:** User-Rider communication during booking

```java
// ChatController.java - NEW
POST /api/bookings/{bookingId}/messages - Send message
GET /api/bookings/{bookingId}/messages - Get chat history
```

#### 6. SOS & Emergency
**Why needed:** Safety feature - panic button

```java
// EmergencyController.java - NEW
POST /api/bookings/{bookingId}/sos - Trigger SOS
GET /api/bookings/{bookingId}/sos-status - Check SOS status
POST /api/bookings/{bookingId}/emergency-contacts - Add emergency contact
```

#### 7. Promo Codes & Referrals
**Why needed:** User acquisition and retention

```java
// PromoController.java - NEW
POST /api/promo/apply - Apply promo code to booking
GET /api/user/referral-code - Get user's referral code
POST /api/user/referral/apply - Apply referral code
GET /api/user/referral/earnings - Get referral earnings
```

#### 8. Notifications Management
**Why needed:** View notification history, manage preferences

```java
// NotificationController.java - NEW
GET /api/notifications - Get user notifications (paginated)
PATCH /api/notifications/{id}/read - Mark as read
PATCH /api/notifications/read-all - Mark all as read
GET /api/notifications/unread-count - Get unread count
PATCH /api/user/notification-preferences - Update notification settings
```

#### 9. Fare Estimation (Before Booking)
**Why needed:** Show estimated fare before creating booking

```java
// BookingController.java - ADD
POST /api/bookings/estimate-fare - Calculate fare estimate
// Body: { serviceType, distance, duration, pickupLat, pickupLng, dropLat, dropLng }
```

#### 10. Rider Availability Toggle with Validation
**Why needed:** Better control over going online/offline

```java
// RiderController.java - ADD
POST /api/rider/go-online - Go online (validates subscription, documents)
POST /api/rider/go-offline - Go offline
GET /api/rider/online-status - Check if can go online
```

---

## User App - Complete UI Flow

### 📱 Screen 1: Splash Screen
**Purpose:** App initialization, check auth status

**On Load:**
1. Check if `accessToken` exists in secure storage
2. If yes → validate token → navigate to Home
3. If no → navigate to Onboarding

**APIs:**
- None (local check only)

---

### 📱 Screen 2: Onboarding/Welcome
**Purpose:** First-time user introduction

**UI Elements:**
- Swipeable slides explaining app features
- "Get Started" button

**On "Get Started":**
- Navigate to Login Screen

**APIs:**
- None

---

### 📱 Screen 3: Login (Phone Number)
**Purpose:** OTP-based authentication

**UI Elements:**
- Phone number input (+91 prefix)
- "Send OTP" button

**Flow:**
1. User enters phone number
2. Tap "Send OTP"
3. **API Call:**
   ```
   POST /api/auth/send-otp
   Body: { "mobileNumber": "9876543210" }
   ```
4. Navigate to OTP Screen

**Validation:**
- 10-digit number required

---

### 📱 Screen 4: OTP Verification
**Purpose:** Verify OTP and login

**UI Elements:**
- 6-digit OTP input
- "Verify" button
- "Resend OTP" link (30s timer)

**Flow:**
1. User enters OTP
2. Tap "Verify"
3. **API Call:**
   ```
   POST /api/auth/verify-otp
   Body: { 
     "mobileNumber": "9876543210",
     "otpCode": "123456",
     "fullName": "User Name" // optional, for first-time users
   }
   Response: {
     "accessToken": "...",
     "refreshToken": "...",
     "userId": 123,
     "role": "USER"
   }
   ```
4. Save tokens to secure storage
5. Navigate to Home Screen

**On "Resend OTP":**
- Call `POST /api/auth/send-otp` again

---

### 📱 Screen 5: Home Screen (Map View)
**Purpose:** Main booking interface with live map

**UI Elements:**
- **Full-screen Google Map**
- **Service type tabs:** Ride | Errand | Parcel
- **Pickup location card** (bottom sheet)
  - "Where to pick up?" with current location icon
  - Saved addresses quick access
- **User profile icon** (top-left)
- **Notifications bell** (top-right) with badge

**On Load:**
1. Get user's current location (GPS)
2. Center map on current location
3. **API Call (load nearby riders):**
   ```
   GET /api/rider/nearby?latitude={lat}&longitude={lng}&radius=5.0
   Response: [ { riderId, currentLatitude, currentLongitude, ... } ]
   ```
4. Show rider markers on map
5. **API Call (unread notifications):**
   ```
   🔴 MISSING: GET /api/notifications/unread-count
   ```

**On Tap Map (Set Pickup):**
1. Drop pin on map
2. Reverse geocode to get address (Google Maps SDK)
3. Update pickup card with address
4. Show "Confirm Pickup" button

**On "Confirm Pickup":**
- Navigate to Drop Location Screen

**On Tap Profile Icon:**
- Navigate to Profile Screen

**On Tap Notifications:**
- Navigate to Notifications Screen

---

### 📱 Screen 6: Drop Location Screen
**Purpose:** Select drop location on map

**UI Elements:**
- Full-screen map with pickup pin already set
- "Where to drop?" search bar
- Saved addresses list
- Map with draggable drop pin

**Flow:**
1. User taps map or searches address
2. Drop pin placed
3. **Calculate route on map** (Google Directions API - client side)
4. Show distance & duration
5. **API Call (Fare Estimate):**
   ```
   🔴 MISSING: POST /api/bookings/estimate-fare
   Body: {
     "serviceType": "RIDE",
     "pickupLatitude": 12.9716,
     "pickupLongitude": 77.5946,
     "dropLatitude": 12.9352,
     "dropLongitude": 77.6245,
     "estimatedDistance": 8.3,
     "estimatedDuration": 20
   }
   Response: {
     "baseFare": 40,
     "distanceFare": 83,
     "totalFare": 123,
     "currency": "INR"
   }
   ```
6. Show fare estimate in bottom sheet
7. "Confirm Booking" button

**On "Confirm Booking":**
- If service type is **Errand** → Navigate to Errand Details Screen
- If service type is **Parcel** → Navigate to Parcel Details Screen
- If service type is **Ride** → Create booking directly

---

### 📱 Screen 7: Errand Details Screen
**Purpose:** Collect errand-specific information

**UI Elements:**
- "What do you need?" text input (description)
- "Items to buy/collect" multi-line input
- "Estimated budget" input (₹)
- "Confirm" button

**On "Confirm":**
- Proceed to Create Booking

---

### 📱 Screen 8: Parcel Details Screen
**Purpose:** Collect parcel-specific information

**UI Elements:**
- "Parcel description" input
- "Weight (kg)" input
- "Recipient name" input
- "Recipient phone" input
- "Confirm" button

**On "Confirm":**
- Proceed to Create Booking

---

### 📱 Screen 9: Booking Confirmation & Bidding
**Purpose:** Create booking and show live bids

**On Screen Load:**
1. **API Call (Create Booking):**
   ```
   POST /api/bookings
   Body: {
     "serviceType": "RIDE",
     "pickupAddress": "MG Road, Bangalore",
     "pickupLatitude": 12.9716,
     "pickupLongitude": 77.5946,
     "dropAddress": "Koramangala, Bangalore",
     "dropLatitude": 12.9352,
     "dropLongitude": 77.6245,
     "estimatedDistance": 8.3,
     "estimatedDuration": 20,
     // For ERRAND:
     "errandDescription": "...",
     "errandItemsList": "...",
     "estimatedBudget": 500,
     // For PARCEL:
     "parcelDescription": "...",
     "parcelWeight": 2.5,
     "recipientName": "...",
     "recipientPhone": "..."
   }
   Response: {
     "id": 456,
     "status": "BIDDING",
     "biddingEndTime": "2026-03-14T15:45:00",
     ...
   }
   ```

2. **WebSocket Subscribe:**
   ```
   STOMP Connect: ws://localhost:8080/ws
   Subscribe: /topic/booking/456/bids
   Subscribe: /topic/user/123/notifications
   ```

3. **API Call (Broadcast to Riders):**
   ```
   POST /api/bids/broadcast/456
   ```

**UI Elements:**
- "Finding riders..." animation
- Timer showing bidding window countdown
- Live bid cards appearing:
  - Rider photo, name, rating
  - Bid amount
  - ETA to pickup
  - "Accept" button
- "Cancel Booking" button

**On Bid Received (WebSocket):**
- Add bid card to list
- Sort by bid amount (lowest first)

**On "Accept Bid":**
1. **API Call:**
   ```
   POST /api/bids/{bidId}/accept
   ```
2. Navigate to Ride Tracking Screen

**On "Cancel Booking":**
1. **API Call:**
   ```
   POST /api/bookings/456/cancel?reason=User%20cancelled&byUser=true
   ```
2. Navigate back to Home

**Fallback (if no bids):**
- After bidding window expires, show "No riders available" message
- Option to retry or cancel

---

### 📱 Screen 10: Ride Tracking Screen
**Purpose:** Live tracking of rider and ride progress

**On Load:**
1. **API Call (Get Booking Details):**
   ```
   GET /api/bookings/456
   ```
2. **WebSocket Subscribe:**
   ```
   Subscribe: /topic/user/123/notifications
   ```
3. Start polling for live location:
   ```
   🔴 MISSING: GET /api/bookings/456/live-location
   Response: {
     "riderLatitude": 12.9700,
     "riderLongitude": 77.5950,
     "lastUpdated": "2026-03-14T15:50:00"
   }
   ```
   Poll every 5 seconds

**UI Elements:**
- **Map showing:**
  - Pickup pin
  - Drop pin
  - Rider's live location marker (moving)
  - Route polyline
- **Bottom sheet with:**
  - Rider info card:
    - Photo, name, rating
    - Vehicle details
    - Phone call button
    - Chat button
  - Booking status badge:
    - "Rider on the way" (ACCEPTED)
    - "Rider arrived" (RIDER_ARRIVED)
    - "Ride in progress" (IN_PROGRESS)
  - ETA to pickup / drop
  - Fare amount
- **SOS button** (top-right, red)
- **Cancel button** (if status allows)

**On Status Change (WebSocket notification):**
- Update UI based on new status
- Show notification toast

**On "Call Rider":**
- Initiate phone call using device dialer

**On "Chat":**
- Navigate to Chat Screen

**On "SOS":**
1. **API Call:**
   ```
   🔴 MISSING: POST /api/bookings/456/sos
   Body: { "reason": "Emergency" }
   ```
2. Show SOS confirmation dialog
3. Notify emergency contacts

**On "Cancel":**
1. Show confirmation dialog
2. **API Call:**
   ```
   POST /api/bookings/456/cancel?reason=User%20cancelled&byUser=true
   ```
3. Navigate to Home

**When Ride Completes (status = COMPLETED):**
- Navigate to Rating Screen

---

### 📱 Screen 11: Chat Screen
**Purpose:** In-app messaging with rider

**On Load:**
1. **API Call:**
   ```
   🔴 MISSING: GET /api/bookings/456/messages
   Response: [
     { "id": 1, "senderId": 123, "message": "On my way", "timestamp": "..." },
     ...
   ]
   ```

**UI Elements:**
- Chat message list (WhatsApp-style)
- Message input box
- Send button
- Quick replies: "Where are you?", "Waiting", "Thank you"

**On Send Message:**
1. **API Call:**
   ```
   🔴 MISSING: POST /api/bookings/456/messages
   Body: { "message": "I'm at the gate" }
   ```
2. Add message to chat list

**Real-time Updates:**
- WebSocket subscription for new messages (can reuse booking notifications)

---

### 📱 Screen 12: Rating Screen
**Purpose:** Rate rider after ride completion

**UI Elements:**
- Ride summary card (pickup, drop, fare, duration)
- Rider photo & name
- Star rating (1-5)
- Review text input (optional)
- "Submit" button
- "Skip" link

**On "Submit":**
1. **API Call:**
   ```
   POST /api/bookings/456/rate
   Query params:
     userRating=5
     userReview=Great%20ride!
   ```
2. Show "Thank you" message
3. Navigate to Home

**On "Skip":**
- Navigate to Home

---

### 📱 Screen 13: Booking History
**Purpose:** View past bookings

**On Load:**
1. **API Call:**
   ```
   🔴 MISSING: GET /api/bookings/user/history?page=0&size=20&status=COMPLETED
   Response: {
     "content": [ { booking1 }, { booking2 }, ... ],
     "totalPages": 5,
     "currentPage": 0
   }
   ```

**UI Elements:**
- Filter tabs: All | Completed | Cancelled
- Service type filter: All | Ride | Errand | Parcel
- Booking cards showing:
  - Date & time
  - Pickup → Drop
  - Fare
  - Status badge
  - "View Details" button

**On Tap Booking:**
- Navigate to Booking Detail Screen

**On Scroll to Bottom:**
- Load next page (pagination)

---

### 📱 Screen 14: Booking Detail Screen
**Purpose:** View detailed booking information

**On Load:**
1. **API Call:**
   ```
   GET /api/bookings/456
   ```

**UI Elements:**
- Map showing route
- Booking info:
  - Booking ID
  - Date & time
  - Service type
  - Pickup & drop addresses
  - Distance & duration
  - Fare breakdown
  - Status
- Rider info (if assigned):
  - Photo, name, rating
  - Vehicle details
- Rating & review (if completed)
- "Report Issue" button
- "Book Again" button

**On "Report Issue":**
- Navigate to Complaint Screen (pre-filled with booking ID)

**On "Book Again":**
- Navigate to Home with pre-filled pickup/drop

---

### 📱 Screen 15: Profile Screen
**Purpose:** User profile management

**On Load:**
1. **API Call:**
   ```
   🔴 MISSING: GET /api/user/profile
   Response: {
     "id": 123,
     "fullName": "John Doe",
     "mobileNumber": "+919876543210",
     "email": "john@example.com",
     "profilePhotoUrl": "...",
     "totalBookings": 45,
     "averageRating": 4.8
   }
   ```

**UI Elements:**
- Profile photo (editable)
- Name, phone, email
- Stats: Total rides, Rating
- Menu items:
  - **My Bookings** → Booking History Screen
  - **Saved Addresses** → Saved Addresses Screen
  - **Payments & Wallet** → Payments Screen
  - **Referrals** → Referral Screen
  - **Notifications** → Notifications Screen
  - **Help & Support** → Support Screen
  - **Settings** → Settings Screen
  - **Logout**

**On "Edit Profile":**
1. Allow editing name, email
2. **API Call:**
   ```
   🔴 MISSING: PATCH /api/user/profile
   Body: { "fullName": "...", "email": "..." }
   ```

**On "Change Photo":**
1. Pick image from gallery
2. **API Call:**
   ```
   POST /api/upload/profile-photo
   Body: multipart file
   Response: "https://s3.../photo.jpg"
   ```
3. **API Call:**
   ```
   🔴 MISSING: PATCH /api/user/profile
   Body: { "profilePhotoUrl": "https://..." }
   ```

---

### 📱 Screen 16: Saved Addresses Screen
**Purpose:** Manage saved addresses (Home, Work, etc.)

**On Load:**
1. **API Call:**
   ```
   🔴 MISSING: GET /api/user/addresses
   Response: [
     { "id": 1, "label": "Home", "address": "...", "latitude": ..., "longitude": ... },
     { "id": 2, "label": "Work", "address": "...", "latitude": ..., "longitude": ... }
   ]
   ```

**UI Elements:**
- Address cards with label, address, edit/delete icons
- "Add New Address" button

**On "Add New Address":**
1. Show map picker or search
2. **API Call:**
   ```
   🔴 MISSING: POST /api/user/addresses
   Body: {
     "label": "Home",
     "address": "123 Main St",
     "latitude": 12.9716,
     "longitude": 77.5946
   }
   ```

**On "Edit Address":**
1. **API Call:**
   ```
   🔴 MISSING: PATCH /api/user/addresses/1
   Body: { "label": "Office", ... }
   ```

**On "Delete Address":**
1. **API Call:**
   ```
   🔴 MISSING: DELETE /api/user/addresses/1
   ```

---

### 📱 Screen 17: Notifications Screen
**Purpose:** View all notifications

**On Load:**
1. **API Call:**
   ```
   🔴 MISSING: GET /api/notifications?page=0&size=50
   Response: {
     "content": [
       { "id": 1, "title": "Ride completed", "message": "...", "read": false, "timestamp": "..." },
       ...
     ]
   }
   ```

**UI Elements:**
- Notification list (grouped by date)
- Unread indicator (blue dot)
- "Mark all as read" button

**On Tap Notification:**
1. **API Call:**
   ```
   🔴 MISSING: PATCH /api/notifications/1/read
   ```
2. Navigate to relevant screen (booking detail, etc.)

**On "Mark All as Read":**
1. **API Call:**
   ```
   🔴 MISSING: PATCH /api/notifications/read-all
   ```

---

### 📱 Screen 18: Referral Screen
**Purpose:** Referral program

**On Load:**
1. **API Call:**
   ```
   🔴 MISSING: GET /api/user/referral-code
   Response: { "code": "JOHN123", "referralCount": 5, "earnings": 250 }
   ```

**UI Elements:**
- Referral code (large, copyable)
- "Share" button
- Stats: Friends referred, Earnings
- "How it works" section

**On "Share":**
- Native share dialog with referral code & link

---

### 📱 Screen 19: Complaint/Support Screen
**Purpose:** File complaints or get help

**UI Elements:**
- Complaint type dropdown (Safety, Ride Issue, Payment, Other)
- Description text area
- Related booking selector (optional)
- "Submit" button

**On "Submit":**
1. **API Call:**
   ```
   POST /api/complaints
   Query params:
     complaintType=RIDE_ISSUE
     description=Rider%20was%20rude
     bookingId=456
   ```
2. Show confirmation message
3. Navigate back

**View My Complaints:**
1. **API Call:**
   ```
   GET /api/complaints/my-complaints
   ```

---

## Rider App - Complete UI Flow

### 📱 Screen 1-4: Splash, Onboarding, Login, OTP
**Same as User App, but:**
- Use `POST /api/auth/rider/verify-otp` instead
- Response will have `role: "RIDER"`

---

### 📱 Screen 5: Rider Onboarding Check
**Purpose:** Check if rider profile exists

**On Load:**
1. **API Call:**
   ```
   GET /api/rider/profile
   ```
2. **If 404 (no profile):**
   - Navigate to Rider Application Screen
3. **If 200 (profile exists):**
   - Check `status` field:
     - `PENDING` → Navigate to Pending Approval Screen
     - `APPROVED` but no subscription → Navigate to Subscription Screen
     - `ACTIVE` → Navigate to Rider Home Screen
     - `BANNED` → Show banned message

---

### 📱 Screen 6: Rider Application Form
**Purpose:** Collect rider details for KYC

**UI Elements (Multi-step form):**

**Step 1: Personal Details**
- Full name (pre-filled from auth)
- Date of birth (date picker)
- Gender (dropdown)
- Home address (map picker or text)

**Step 2: Vehicle Details**
- Vehicle type (dropdown: Bike, Scooter)
- Make (text)
- Model (text)
- Year (number)
- Registration number (text)
- Color (text)

**Step 3: Bank Details**
- Account number (text)
- IFSC code (text)
- Account holder name (text)

**On "Submit Application":**
1. **API Call:**
   ```
   POST /api/rider/apply
   Body: {
     "dateOfBirth": "1990-01-01",
     "gender": "MALE",
     "homeAddress": "...",
     "vehicleType": "BIKE",
     "vehicleMake": "Honda",
     "vehicleModel": "Activa",
     "vehicleYear": 2020,
     "vehicleRegistrationNumber": "KA01AB1234",
     "vehicleColor": "Black",
     "bankAccountNumber": "1234567890",
     "bankIfscCode": "HDFC0001234",
     "bankAccountHolderName": "John Doe"
   }
   Response: { "id": 789, "status": "PENDING", ... }
   ```
2. Navigate to Document Upload Screen

---

### 📱 Screen 7: Document Upload Screen
**Purpose:** Upload KYC documents

**UI Elements:**
- Document checklist:
  - ✅ Driving License
  - ✅ Aadhaar Card
  - ✅ PAN Card
  - ✅ Vehicle RC
  - ✅ Vehicle Insurance
  - ✅ Vehicle PUC
  - ✅ Vehicle Photo
  - ✅ Selfie with Vehicle

**For Each Document:**
1. User taps "Upload"
2. Pick image from camera/gallery
3. **API Call:**
   ```
   POST /api/upload/document
   Body: multipart file
   Response: "https://s3.../document.jpg"
   ```
4. Store URL locally
5. Mark as uploaded (green checkmark)

**On "Submit All Documents":**
1. **API Call:**
   ```
   PATCH /api/rider/documents
   Body: {
     "drivingLicenseUrl": "https://...",
     "aadharCardUrl": "https://...",
     "panCardUrl": "https://...",
     "vehicleRcUrl": "https://...",
     "vehicleInsuranceUrl": "https://...",
     "vehiclePucUrl": "https://...",
     "vehiclePhotoUrl": "https://...",
     "selfieWithVehicleUrl": "https://..."
   }
   ```
2. Navigate to Pending Approval Screen

---

### 📱 Screen 8: Pending Approval Screen
**Purpose:** Waiting for admin approval

**UI Elements:**
- "Application Under Review" message
- Estimated review time (24-48 hours)
- "Check Status" button
- "Contact Support" button

**On "Check Status":**
1. **API Call:**
   ```
   GET /api/rider/profile
   ```
2. If `status` changed to `APPROVED`:
   - Navigate to Subscription Screen
3. If still `PENDING`:
   - Show "Still under review" message

---

### 📱 Screen 9: Subscription Screen
**Purpose:** Activate rider subscription (currently free)

**UI Elements:**
- Subscription plan card:
  - "₹500/month" (crossed out)
  - "FREE for limited time"
  - Features list
- "Activate Subscription" button

**On "Activate Subscription":**
1. **API Call:**
   ```
   POST /api/payments/create-subscription
   Response: { "clientSecret": "FREE_SUBSCRIPTION_ACTIVATED" }
   ```
2. **API Call:**
   ```
   POST /api/payments/confirm-subscription?paymentIntentId=FREE
   ```
3. Show success message
4. Navigate to Rider Home Screen

---

### 📱 Screen 10: Rider Home Screen (Map View)
**Purpose:** Main rider interface - go online, see bookings

**On Load:**
1. Get current location
2. **API Call:**
   ```
   GET /api/rider/profile
   ```
3. **API Call:**
   ```
   🔴 MISSING: GET /api/rider/online-status
   Response: {
     "canGoOnline": true,
     "reason": null, // or "Subscription expired", "Documents pending"
     "currentStatus": "INACTIVE"
   }
   ```
4. **WebSocket Connect:**
   ```
   STOMP Connect: ws://localhost:8080/ws
   Subscribe: /topic/rider/{riderId}/bookings
   Subscribe: /topic/user/{userId}/notifications
   ```

**UI Elements:**
- **Full-screen map** showing rider's current location
- **Online/Offline toggle** (large, prominent)
  - Green when online, gray when offline
- **Top bar:**
  - Earnings today (₹XXX)
  - Rating (4.8 ⭐)
  - Menu icon
- **Bottom sheet (when offline):**
  - "Go Online to start receiving bookings"
  - Today's stats: Rides, Earnings, Hours
- **Bottom sheet (when online):**
  - "You're online - waiting for bookings"
  - Active bookings count
  - "View Active Bookings" button

**On Toggle Online:**
1. If going online:
   ```
   🔴 MISSING: POST /api/rider/go-online
   Response: { "success": true, "status": "AVAILABLE" }
   ```
   Or use existing:
   ```
   PATCH /api/rider/status?status=AVAILABLE
   ```
2. Start location updates (every 10 seconds):
   ```
   PATCH /api/rider/location?latitude={lat}&longitude={lng}
   ```

**On Toggle Offline:**
1. **API Call:**
   ```
   🔴 MISSING: POST /api/rider/go-offline
   Or: PATCH /api/rider/status?status=INACTIVE
   ```
2. Stop location updates

**On New Booking Notification (WebSocket):**
- Show booking request popup (overlay)

---

### 📱 Screen 11: Booking Request Popup
**Purpose:** Show incoming booking request

**Triggered by:** WebSocket message on `/topic/rider/{riderId}/bookings`

**UI Elements (Modal/Bottom Sheet):**
- Booking details:
  - Service type badge (Ride/Errand/Parcel)
  - Pickup address
  - Drop address
  - Distance & estimated duration
  - Suggested fare (from booking.estimatedFare)
- Map preview showing pickup & drop
- Countdown timer (e.g., 30 seconds to respond)
- Bid amount input (pre-filled with suggested fare)
- "Place Bid" button
- "Reject" button

**On "Place Bid":**
1. **API Call:**
   ```
   POST /api/bids?bookingId=456&bidAmount=120
   Response: { "id": 999, "status": "PENDING", ... }
   ```
2. Show "Bid placed! Waiting for user to accept" message
3. Close popup
4. Add to "Pending Bids" list

**On "Reject":**
- Close popup
- No API call needed

**On Timer Expires:**
- Auto-close popup

---

### 📱 Screen 12: Active Bookings Screen
**Purpose:** View all active/pending bookings

**On Load:**
1. **API Call:**
   ```
   GET /api/bookings/rider/my-bookings
   Filter client-side for: status IN (ACCEPTED, RIDER_ARRIVED, IN_PROGRESS)
   ```

**UI Elements:**
- Tabs: Active | Pending Bids | Completed
- Booking cards showing:
  - Booking ID
  - Status badge
  - Pickup → Drop
  - Fare
  - "View Details" button

**On Tap Booking:**
- Navigate to Ride Detail Screen

---

### 📱 Screen 13: Ride Detail Screen (Rider Side)
**Purpose:** Manage active ride

**On Load:**
1. **API Call:**
   ```
   GET /api/bookings/456
   ```

**UI Elements:**
- **Map showing:**
  - Pickup pin
  - Drop pin
  - Rider's current location
  - Route to pickup (if not started) or to drop (if in progress)
  - User's location (if available)
- **Bottom sheet:**
  - User info:
    - Name, photo, rating
    - Phone number
    - "Call User" button
    - "Chat" button
  - Booking details:
    - Pickup & drop addresses
    - Fare
    - Service type specific details
  - **Action buttons (based on status):**
    - If `ACCEPTED`: "I've Arrived" button
    - If `RIDER_ARRIVED`: "Start Ride" button
    - If `IN_PROGRESS`: "Complete Ride" button
  - "Cancel Booking" button (with reason)
  - Navigation button (open in Google Maps)

**On "I've Arrived":**
1. **API Call:**
   ```
   PATCH /api/bookings/456/status?status=RIDER_ARRIVED
   ```
2. Update UI

**On "Start Ride":**
1. **API Call:**
   ```
   PATCH /api/bookings/456/status?status=IN_PROGRESS
   ```
2. Update UI
3. Start showing route to drop location

**On "Complete Ride":**
1. **API Call:**
   ```
   PATCH /api/bookings/456/status?status=COMPLETED
   ```
2. Navigate to Rating Screen (rate user)

**On "Cancel Booking":**
1. Show reason input dialog
2. **API Call:**
   ```
   POST /api/bookings/456/cancel?reason=Vehicle%20breakdown&byUser=false
   ```
3. Navigate back to Rider Home

**On "Navigate":**
- Open Google Maps with destination coordinates

**On "Call User":**
- Initiate phone call

**On "Chat":**
- Navigate to Chat Screen (same as user app)

**Background Location Updates:**
- While ride is active, send location every 5 seconds:
  ```
  PATCH /api/rider/location?latitude={lat}&longitude={lng}
  ```

---

### 📱 Screen 14: Earnings Screen
**Purpose:** View earnings and stats

**On Load:**
1. **API Calls:**
   ```
   🔴 MISSING: GET /api/rider/earnings/today
   Response: { "totalEarnings": 450, "ridesCompleted": 8, "hours": 6.5 }
   
   🔴 MISSING: GET /api/rider/earnings/week
   Response: { "totalEarnings": 2500, "ridesCompleted": 45, "days": 5 }
   
   🔴 MISSING: GET /api/rider/earnings/month
   Response: { "totalEarnings": 12000, "ridesCompleted": 180, "days": 22 }
   
   🔴 MISSING: GET /api/rider/stats
   Response: {
     "totalRides": 450,
     "averageRating": 4.7,
     "acceptanceRate": 92.5,
     "cancellationRate": 2.1,
     "totalEarnings": 45000
   }
   ```

**UI Elements:**
- Tabs: Today | This Week | This Month
- Earnings summary card:
  - Total earnings (large)
  - Rides completed
  - Hours online
- Earnings chart (bar/line graph)
- Stats cards:
  - Average rating
  - Acceptance rate
  - Cancellation rate
- "View Detailed History" button

**On "View Detailed History":**
1. **API Call:**
   ```
   🔴 MISSING: GET /api/rider/earnings/history?startDate=2026-03-01&endDate=2026-03-14&page=0
   Response: {
     "content": [
       { "bookingId": 456, "date": "...", "fare": 120, "serviceType": "RIDE" },
       ...
     ]
   }
   ```

---

### 📱 Screen 15: Rider Profile Screen
**Purpose:** View/edit rider profile

**On Load:**
1. **API Call:**
   ```
   GET /api/rider/profile
   ```

**UI Elements:**
- Profile photo
- Name, phone
- Vehicle details
- Documents status (all uploaded ✅)
- Stats:
  - Total rides
  - Rating
  - Member since
- Menu items:
  - **My Bookings** → Booking History
  - **Earnings** → Earnings Screen
  - **Documents** → Document Management Screen
  - **Subscription** → Subscription Status Screen
  - **Bank Details** → Bank Details Screen
  - **Help & Support** → Support Screen
  - **Settings** → Settings Screen
  - **Logout**

---

### 📱 Screen 16: Subscription Status Screen
**Purpose:** View subscription details

**On Load:**
1. **API Call:**
   ```
   GET /api/payments/subscription-status
   Response: "ACTIVE"
   ```
2. **API Call:**
   ```
   GET /api/rider/profile
   // Check subscriptionStartDate, subscriptionEndDate, subscriptionActive
   ```

**UI Elements:**
- Subscription status badge (Active/Expired)
- Plan details (₹500/month - currently FREE)
- Valid from - Valid until
- "Renew Subscription" button (if expired)
- Payment history

---

## Admin Dashboard - Complete UI Flow

### 🖥️ Screen 1: Login
**Purpose:** Admin authentication

**Same as User/Rider login but:**
- Admin users created manually in DB with `role: ADMIN`
- After login, check `role === "ADMIN"`, else show error

---

### 🖥️ Screen 2: Dashboard Overview
**Purpose:** High-level platform stats

**On Load:**
1. **API Call:**
   ```
   GET /api/admin/dashboard
   Response: {
     "totalUsers": 5000,
     "totalRiders": 800,
     "activeRiders": 120,
     "pendingRiders": 15,
     "todayBookings": 450,
     "activeBookings": 23,
     "todayRevenue": 0 // currently free
   }
   ```

**UI Elements:**
- Stat cards:
  - Total Users
  - Total Riders
  - Active Riders (clickable → Active Riders Screen)
  - Pending Approvals (clickable → Pending Riders Screen)
  - Today's Bookings
  - Active Bookings (clickable → Active Bookings Screen)
  - Today's Revenue
- Charts:
  - Bookings over time
  - Rider growth
- Quick actions:
  - "View Pending Riders"
  - "View Active Bookings"
  - "View Complaints"

---

### 🖥️ Screen 3: Pending Rider Approvals
**Purpose:** Review and approve/reject riders

**On Load:**
1. **API Call:**
   ```
   GET /api/admin/riders/pending
   Response: [ { rider1 }, { rider2 }, ... ]
   ```

**UI Elements:**
- Table/List of pending riders:
  - Rider ID
  - Name
  - Phone
  - Applied date
  - "View Details" button

**On "View Details":**
- Navigate to Rider Detail Screen

---

### 🖥️ Screen 4: Rider Detail Screen (Admin)
**Purpose:** Review rider application

**On Load:**
1. **API Call:**
   ```
   GET /api/rider/profile (using rider's userId)
   // Or create: GET /api/admin/riders/{riderId}
   ```

**UI Elements:**
- Personal details section
- Vehicle details section
- Bank details section
- Documents section (with image previews):
  - Driving License
  - Aadhaar
  - PAN
  - Vehicle RC
  - Insurance
  - PUC
  - Vehicle Photo
  - Selfie with Vehicle
- "Approve" button (green)
- "Reject" button (red) with reason input

**On "Approve":**
1. **API Call:**
   ```
   POST /api/admin/riders/{riderId}/approve
   ```
2. Show success message
3. Navigate back to Pending Riders list

**On "Reject":**
1. Show reason input dialog
2. **API Call:**
   ```
   POST /api/admin/riders/{riderId}/reject?reason=Incomplete%20documents
   ```
3. Navigate back

---

### 🖥️ Screen 5: Active Riders Screen
**Purpose:** View all active riders

**On Load:**
1. **API Call:**
   ```
   GET /api/admin/riders/active
   ```

**UI Elements:**
- Table with:
  - Rider ID
  - Name
  - Phone
  - Rating
  - Total Rides
  - Status (Online/Offline)
  - "View Details" button

---

### 🖥️ Screen 6: Active Bookings Screen
**Purpose:** Monitor live bookings

**On Load:**
1. **API Call:**
   ```
   GET /api/admin/bookings/active
   ```

**UI Elements:**
- Real-time booking list:
  - Booking ID
  - User name
  - Rider name
  - Status
  - Pickup → Drop
  - Started time
  - "View Details" button

---

### 🖥️ Screen 7: Complaints Management
**Purpose:** Handle user complaints

**On Load:**
1. **API Call:**
   ```
   GET /api/complaints/open
   ```

**UI Elements:**
- Complaint list:
  - Complaint ID
  - Type
  - User name
  - Against (rider name if applicable)
  - Booking ID (link)
  - Date
  - Status (Open/Resolved)
  - "View Details" button

**On "View Details":**
- Show full complaint with description
- "Resolve" button with resolution input

**On "Resolve":**
1. **API Call:**
   ```
   POST /api/complaints/{id}/resolve?resolution=Refund%20processed
   ```

---

## WebSocket Integration

### Connection Setup
```typescript
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const socket = new SockJS('http://localhost:8080/ws');
const stompClient = Stomp.over(socket);

stompClient.connect({}, (frame) => {
  console.log('Connected: ' + frame);
  
  // Subscribe to topics
  stompClient.subscribe('/topic/user/123/notifications', (message) => {
    const notification = JSON.parse(message.body);
    // Handle notification
  });
  
  stompClient.subscribe('/topic/booking/456/bids', (message) => {
    const bid = JSON.parse(message.body);
    // Handle new bid
  });
});
```

### Topics

**User App:**
- `/topic/user/{userId}/notifications` - General notifications (ride status updates, etc.)
- `/topic/booking/{bookingId}/bids` - Live bids for a booking

**Rider App:**
- `/topic/rider/{riderId}/bookings` - New booking requests
- `/topic/user/{userId}/notifications` - General notifications

---

## Missing APIs - Implementation Priority

### 🔴 Priority 1 (Critical for MVP)
1. **User Profile APIs**
   - `GET /api/user/profile`
   - `PATCH /api/user/profile`
   
2. **Fare Estimation**
   - `POST /api/bookings/estimate-fare`
   
3. **Notifications**
   - `GET /api/notifications`
   - `GET /api/notifications/unread-count`
   - `PATCH /api/notifications/{id}/read`
   
4. **Rider Earnings**
   - `GET /api/rider/earnings/today`
   - `GET /api/rider/stats`

### 🟡 Priority 2 (Important for UX)
5. **Saved Addresses**
   - `GET /api/user/addresses`
   - `POST /api/user/addresses`
   - `PATCH /api/user/addresses/{id}`
   - `DELETE /api/user/addresses/{id}`
   
6. **Live Location Tracking**
   - `GET /api/bookings/{id}/live-location`
   
7. **Booking History with Filters**
   - `GET /api/bookings/user/history` (with pagination & filters)

### 🟢 Priority 3 (Nice to Have)
8. **In-App Chat**
   - `GET /api/bookings/{bookingId}/messages`
   - `POST /api/bookings/{bookingId}/messages`
   
9. **SOS/Emergency**
   - `POST /api/bookings/{bookingId}/sos`
   
10. **Referrals**
    - `GET /api/user/referral-code`
    - `POST /api/user/referral/apply`

---

## Implementation Checklist

### Backend Tasks
- [ ] Create `UserController` with profile & address endpoints
- [ ] Add fare estimation endpoint to `BookingController`
- [ ] Create `NotificationController` with read/unread management
- [ ] Add earnings endpoints to `RiderController`
- [ ] Add live location endpoint to `BookingController`
- [ ] Create `ChatController` for in-app messaging
- [ ] Create `EmergencyController` for SOS features
- [ ] Add pagination & filters to booking history
- [ ] Create `PromoController` for referrals

### Frontend Tasks (User App)
- [ ] Implement map-based pickup/drop selection
- [ ] Integrate Google Maps SDK
- [ ] WebSocket connection for live bids
- [ ] Live ride tracking with rider location
- [ ] Rating & review UI
- [ ] Booking history with filters
- [ ] Profile management
- [ ] Saved addresses CRUD
- [ ] Notifications center
- [ ] In-app chat (if implemented)

### Frontend Tasks (Rider App)
- [ ] Rider onboarding flow
- [ ] Document upload with camera
- [ ] Map-based home screen
- [ ] Online/offline toggle with location updates
- [ ] Booking request popup
- [ ] Active ride management
- [ ] Earnings dashboard
- [ ] Profile & subscription management

### Frontend Tasks (Admin Dashboard)
- [ ] Dashboard with stats
- [ ] Rider approval workflow
- [ ] Document verification UI
- [ ] Active bookings monitor
- [ ] Complaints management

---

## Next Steps

1. **Review this specification** with your team
2. **Prioritize missing APIs** based on your launch timeline
3. **Implement Priority 1 APIs** first (user profile, fare estimation, notifications, rider earnings)
4. **Build UI screens** in parallel following this flow
5. **Test end-to-end flows** for each user journey
6. **Add real-time features** (WebSocket, live tracking)
7. **Polish UX** (animations, error handling, loading states)

---

**Document Version:** 1.0  
**Last Updated:** March 14, 2026
