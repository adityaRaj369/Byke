import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../config/api';

interface RiderState {
  profile: any | null;
  availableBookings: any[];
  activeBooking: any | null;
  earnings: any | null;
  isAvailable: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: RiderState = {
  profile: null,
  availableBookings: [],
  activeBooking: null,
  earnings: null,
  isAvailable: false,
  loading: false,
  error: null,
};

export const fetchRiderProfile = createAsyncThunk(
  'rider/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/rider/profile');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const applyAsRider = createAsyncThunk(
  'rider/apply',
  async (riderData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/rider/apply', riderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to apply');
    }
  }
);

export const updateDocuments = createAsyncThunk(
  'rider/updateDocuments',
  async (documents: any, { rejectWithValue }) => {
    try {
      const response = await api.patch('/rider/documents', documents);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update documents');
    }
  }
);

export const updateLocation = createAsyncThunk(
  'rider/updateLocation',
  async ({ latitude, longitude }: { latitude: number; longitude: number }, { rejectWithValue }) => {
    try {
      await api.patch('/rider/location', null, { params: { latitude, longitude } });
      return { latitude, longitude };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update location');
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'rider/updateAvailability',
  async (status: string, { rejectWithValue }) => {
    try {
      await api.patch('/rider/status', null, { params: { status } });
      return status;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const placeBid = createAsyncThunk(
  'rider/placeBid',
  async ({ bookingId, bidAmount }: { bookingId: number; bidAmount: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/bids', null, { params: { bookingId, bidAmount } });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to place bid');
    }
  }
);

const riderSlice = createSlice({
  name: 'rider',
  initialState,
  reducers: {
    setAvailableBookings: (state, action: PayloadAction<any[]>) => {
      state.availableBookings = action.payload;
    },
    addAvailableBooking: (state, action: PayloadAction<any>) => {
      state.availableBookings.unshift(action.payload);
    },
    setActiveBooking: (state, action: PayloadAction<any>) => {
      state.activeBooking = action.payload;
    },
    toggleAvailability: (state) => {
      state.isAvailable = !state.isAvailable;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRiderProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRiderProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchRiderProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(applyAsRider.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(updateDocuments.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.isAvailable = action.payload === 'AVAILABLE';
      });
  },
});

export const { setAvailableBookings, addAvailableBooking, setActiveBooking, toggleAvailability, clearError } = riderSlice.actions;
export default riderSlice.reducer;
