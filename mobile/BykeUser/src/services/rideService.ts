import api from '../config/api';

export interface RideRequest {
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  vehicleType: string;
  maxFare: number;
  distanceKm: number;
}

export interface Bid {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone: string;
  rating: number;
  totalRides: number;
  vehicleType: string;
  vehicleNumber: string;
  bidAmount: number;
  etaMinutes: number;
  isVerified: boolean;
  profilePhoto?: string;
}

export interface Ride {
  id: string;
  userId: string;
  riderId?: string;
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  vehicleType: string;
  status: 'PENDING' | 'ACCEPTED' | 'RIDER_ARRIVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  fare?: number;
  maxFare: number;
  distanceKm: number;
  createdAt: string;
  updatedAt: string;
}

export const createRideRequest = async (request: RideRequest): Promise<{ rideId: string }> => {
  try {
    const response = await api.post('/rides/request', {
      pickupLatitude: request.pickupLocation.latitude,
      pickupLongitude: request.pickupLocation.longitude,
      pickupAddress: request.pickupLocation.address,
      dropLatitude: request.dropLocation.latitude,
      dropLongitude: request.dropLocation.longitude,
      dropAddress: request.dropLocation.address,
      vehicleType: request.vehicleType,
      maxFare: request.maxFare,
      distanceKm: request.distanceKm,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating ride request:', error);
    throw new Error(error.response?.data?.message || 'Failed to create ride request');
  }
};

export const getRideBids = async (rideId: string): Promise<Bid[]> => {
  try {
    const response = await api.get(`/rides/${rideId}/bids`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching bids:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch bids');
  }
};

export const acceptBid = async (rideId: string, bidId: string): Promise<Ride> => {
  try {
    const response = await api.post(`/rides/${rideId}/bids/${bidId}/accept`);
    return response.data;
  } catch (error: any) {
    console.error('Error accepting bid:', error);
    throw new Error(error.response?.data?.message || 'Failed to accept bid');
  }
};

export const getRideDetails = async (rideId: string): Promise<Ride> => {
  try {
    const response = await api.get(`/rides/${rideId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ride details:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch ride details');
  }
};

export const cancelRide = async (rideId: string, reason?: string): Promise<void> => {
  try {
    await api.post(`/rides/${rideId}/cancel`, { reason });
  } catch (error: any) {
    console.error('Error cancelling ride:', error);
    throw new Error(error.response?.data?.message || 'Failed to cancel ride');
  }
};

export const getRideHistory = async (): Promise<Ride[]> => {
  try {
    const response = await api.get('/rides/history');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching ride history:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch ride history');
  }
};

export const rateRide = async (
  rideId: string,
  rating: number,
  feedback?: string
): Promise<void> => {
  try {
    await api.post(`/rides/${rideId}/rate`, { rating, feedback });
  } catch (error: any) {
    console.error('Error rating ride:', error);
    throw new Error(error.response?.data?.message || 'Failed to rate ride');
  }
};
