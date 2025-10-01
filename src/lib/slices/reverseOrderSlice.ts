import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiRequest } from '../api';
import { ReverseOrder, ApiResponse, ReverseOrderState, OrderStatus } from '../../types/orders';

interface ReverseOrderSliceState {
  orders: ReverseOrder[];
  currentOrder: ReverseOrder | null;
  loading: boolean;
  error: string | null;
  metadata: {
    total_items: number;
    current_page: number;
    items_per_page: number;
    total_pages: number;
  };
  stateCounts: Record<ReverseOrderState, number>;
  countsLoading: boolean;
}

const initialState: ReverseOrderSliceState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  metadata: {
    total_items: 0,
    current_page: 1,
    items_per_page: 50,
    total_pages: 0,
  },
  stateCounts: {
    pending: 0,
    ready_for_pickup: 0,
    in_transit: 0,
    out_for_delivery: 0,
    delivered: 0,
    cancelled: 0,
    all_shipments: 0,
  },
  countsLoading: false,
};

// Async thunks for reverse order API calls

// Get Reverse Orders with pagination and filters
export const getReverseOrders = createAsyncThunk(
  'reverseOrders/getOrders',
  async (
    params: {
      page?: number;
      offset?: number;
      query?: string;
      status?: string;
      payment_mode?: string;
      date_range?: string;
      transport_mode?: string;
      return_location?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const queryParams = {
        ...params,
        order_type: 'REVERSE',
      };

      const response = await apiRequest.get<ApiResponse<ReverseOrder[]>>('/order', { params: queryParams });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch reverse orders';
      return rejectWithValue(errorMessage);
    }
  }
);

// Get Reverse Orders by specific state
export const getReverseOrdersByState = createAsyncThunk(
  'reverseOrders/getOrdersByState',
  async (
    params: {
      state: ReverseOrderState;
      page?: number;
      offset?: number;
      query?: string;
      filters?: Record<string, string | number | boolean>;
    },
    { rejectWithValue }
  ) => {
    try {
      const { state, page = 1, offset = 50, query, filters = {} } = params;

      // Map frontend state to backend status
      const statusMap: Record<ReverseOrderState, OrderStatus | undefined> = {
        pending: 'PENDING',
        ready_for_pickup: 'READY_FOR_PICKUP',
        in_transit: 'IN_TRANSIT',
        out_for_delivery: 'IN_TRANSIT', // Backend currently tracks in-transit states together
        delivered: 'DELIVERED',
        cancelled: 'CANCELLED',
        all_shipments: undefined,
      };

      const queryParams = {
        page,
        offset,
        order_type: 'REVERSE',
        ...(statusMap[state] && { status: statusMap[state] }),
        ...(query && { query }),
        ...filters,
      };

      const response = await apiRequest.get<ApiResponse<ReverseOrder[]>>('/order', { params: queryParams });
      return response.data;
    } catch (error: unknown) {
      let errorMessage = 'Failed to fetch reverse orders by state';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'code' in error) {
        const axiosError = error as { code?: string; response?: { data?: { message?: string } } };
        if (axiosError.code === 'ECONNREFUSED' || axiosError.code === 'NETWORK_ERROR') {
          errorMessage = 'Unable to connect to server. Please check your connection and try again.';
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        }
      }
      return rejectWithValue(errorMessage);
    }
  }
);

// Get counts for all reverse order states
export const getReverseOrderCounts = createAsyncThunk(
  'reverseOrders/getCounts',
  async () => {
    try {
      const states: ReverseOrderState[] = [
        'pending',
        'ready_for_pickup',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'cancelled'
      ];

      const statusMap: Record<ReverseOrderState, string | undefined> = {
        pending: 'PENDING',
        ready_for_pickup: 'READY_FOR_PICKUP',
        in_transit: 'IN_TRANSIT',
        out_for_delivery: 'IN_TRANSIT',
        delivered: 'DELIVERED',
        cancelled: 'CANCELLED',
        all_shipments: undefined,
      };

      // Fetch counts for each state in parallel
      const countPromises = states.map(async (state) => {
        try {
          const response = await apiRequest.get<ApiResponse<ReverseOrder[]>>('/order', {
            params: {
              page: 1,
              offset: 1,
              order_type: 'REVERSE',
              status: statusMap[state],
            }
          });
          
          return { state, count: response.data.metadata?.total_items || 0 };
        } catch {
          return { state, count: 0 };
        }
      });

      // Get total count for all_shipments
      const allShipmentsPromise = apiRequest.get<ApiResponse<ReverseOrder[]>>('/order', {
        params: {
          page: 1,
          offset: 1,
          order_type: 'REVERSE',
        }
      }).then(response => ({
        state: 'all_shipments' as ReverseOrderState,
        count: response.data.metadata?.total_items || 0
      })).catch(() => ({
        state: 'all_shipments' as ReverseOrderState,
        count: 0
      }));

      const results = await Promise.all([...countPromises, allShipmentsPromise]);

      const counts: Record<ReverseOrderState, number> = {
        pending: 0,
        ready_for_pickup: 0,
        in_transit: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0,
        all_shipments: 0,
      };

      results.forEach(({ state, count }) => {
        counts[state] = count;
      });

      return counts;
    } catch (error: unknown) {
      // For counts, we don't want to show errors to user, just log and return empty counts
      console.warn('Failed to fetch reverse order counts:', error);
      return {
        pending: 0,
        ready_for_pickup: 0,
        in_transit: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0,
        all_shipments: 0,
      };
    }
  }
);

// Cancel Reverse Order
export const cancelReverseOrder = createAsyncThunk(
  'reverseOrders/cancel',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await apiRequest.post(`/order/cancel/${orderId}`);
      return { orderId, data: response.data };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel reverse order';
      return rejectWithValue(errorMessage);
    }
  }
);

// Manifest Reverse Orders
export const manifestReverseOrders = createAsyncThunk(
  'reverseOrders/manifest',
  async (orderIds: string[], { rejectWithValue }) => {
    try {
      const response = await apiRequest.post('/order/reverse/manifest', {
        order_ids: orderIds
      });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to manifest reverse orders';
      return rejectWithValue(errorMessage);
    }
  }
);

const reverseOrderSlice = createSlice({
  name: 'reverseOrders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: string; awb_number?: string }>) => {
      const { orderId, status, awb_number } = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].status = status;
        if (awb_number) {
          state.orders[orderIndex].awb_number = awb_number;
        }
      }
    },
    setCurrentOrder: (state, action: PayloadAction<ReverseOrder>) => {
      state.currentOrder = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Get Reverse Orders
    builder
      .addCase(getReverseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReverseOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        if (action.payload.metadata) {
          state.metadata = action.payload.metadata;
        }
      })
      .addCase(getReverseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Reverse Orders by State
    builder
      .addCase(getReverseOrdersByState.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getReverseOrdersByState.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        if (action.payload.metadata) {
          state.metadata = action.payload.metadata;
        }
      })
      .addCase(getReverseOrdersByState.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Reverse Order Counts
    builder
      .addCase(getReverseOrderCounts.pending, (state) => {
        state.countsLoading = true;
      })
      .addCase(getReverseOrderCounts.fulfilled, (state, action) => {
        state.countsLoading = false;
        state.stateCounts = action.payload;
      })
      .addCase(getReverseOrderCounts.rejected, (state) => {
        state.countsLoading = false;
        // Don't set error for counts as it's not critical
      });

    // Cancel Reverse Order
    builder
      .addCase(cancelReverseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelReverseOrder.fulfilled, (state, action) => {
        state.loading = false;
        const orderIndex = state.orders.findIndex((order) => order.id === action.payload.orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'CANCELLED' as OrderStatus;
        }
      })
      .addCase(cancelReverseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Manifest Reverse Orders
    builder
      .addCase(manifestReverseOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(manifestReverseOrders.fulfilled, (state, action) => {
        state.loading = false;
        // Update successful orders with new status and AWB numbers
        const payload = action.payload as { data?: { successful?: Array<{ id: string; status: string; awb_number?: string }> } };
        if (payload.data?.successful) {
          payload.data.successful.forEach((successfulOrder) => {
            const orderIndex = state.orders.findIndex((order) => order.id === successfulOrder.id);
            if (orderIndex !== -1) {
              state.orders[orderIndex].status = successfulOrder.status as OrderStatus;
              if (successfulOrder.awb_number) {
                state.orders[orderIndex].awb_number = successfulOrder.awb_number;
              }
            }
          });
        }
      })
      .addCase(manifestReverseOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearCurrentOrder,
  updateOrderStatus,
  setCurrentOrder,
} = reverseOrderSlice.actions;

export default reverseOrderSlice.reducer;
