import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pickupService } from '../../services/orderService';

export interface PickupRequest {
  id: string;
  pickup_time: string;
  pickup_date: string;
  expected_package_count?: number;
  pickup_address_id: string;
  pickup_address?: {
    id: string;
    warehouse_name: string;
    phone: string;
    email?: string;
    pickup_address: string;
    pickup_city: string;
    pickup_state: string;
    pickup_pincode: string;
    pickup_country: string;
    return_address: string;
    return_city: string;
    return_state: string;
    return_pincode: string;
    return_country: string;
  };
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePickupRequestPayload {
  pickup_time: string;
  pickup_date: string;
  pickup_address_id: string;
  expected_package_count?: number;
}

export interface PickupRequestsResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: PickupRequest[];
  metadata: {
    total_items: number;
    current_page: number;
    items_per_page: number;
    total_pages: number;
  };
}

export interface PickupRequestResponse {
  success: boolean;
  status_code: number;
  message?: string;
  data: PickupRequest;
}

interface PickupState {
  pickupRequests: PickupRequest[];
  currentPickupRequest: PickupRequest | null;
  loading: boolean;
  error: string | null;
  metadata: {
    total_items: number;
    current_page: number;
    items_per_page: number;
    total_pages: number;
  };
}

const initialState: PickupState = {
  pickupRequests: [],
  currentPickupRequest: null,
  loading: false,
  error: null,
  metadata: {
    total_items: 0,
    current_page: 1,
    items_per_page: 50,
    total_pages: 0,
  },
};

// Async thunks for API calls

// Create Pickup Request
export const createPickupRequest = createAsyncThunk(
  'pickup/createPickupRequest',
  async (data: CreatePickupRequestPayload, { rejectWithValue }) => {
    try {
      const response = await pickupService.createPickupRequest(data);
      console.log("Pickup request response:", response);
      return response as PickupRequestResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create pickup request'
      );
    }
  }
);

// Get Pickup Requests with pagination
export const getPickupRequests = createAsyncThunk(
  'pickup/getPickupRequests',
  async (
    params: {
      page?: number;
      offset?: number;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await pickupService.getPickupRequests(
        params.page || 1,
        params.offset || 50
      );
      return response as PickupRequestsResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch pickup requests'
      );
    }
  }
);

const pickupSlice = createSlice({
  name: 'pickup',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPickupRequest: (state) => {
      state.currentPickupRequest = null;
    },
  },
  extraReducers: (builder) => {
    // Create Pickup Request
    builder
      .addCase(createPickupRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPickupRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPickupRequest = action.payload.data;
        // Add to pickup requests list if it's not already there
        const existingIndex = state.pickupRequests.findIndex(
          (request) => request.id === action.payload.data.id
        );
        if (existingIndex === -1) {
          state.pickupRequests.unshift(action.payload.data);
        } else {
          state.pickupRequests[existingIndex] = action.payload.data;
        }
      })
      .addCase(createPickupRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Pickup Requests
    builder
      .addCase(getPickupRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPickupRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.pickupRequests = action.payload.data;
        state.metadata = action.payload.metadata;
      })
      .addCase(getPickupRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentPickupRequest,
} = pickupSlice.actions;

export default pickupSlice.reducer;
