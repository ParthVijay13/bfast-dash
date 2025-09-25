import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Types based on backend schema
export interface OrderItem {
  id: string;
  item_name: string;
  sku_code: string;
  category: string;
  product_image?: string;
  price: number;
  discount?: number;
  is_fragile?: boolean;
}

export interface Order {
  id: string;
  order_id: string;
  awb_number?: string;
  consignee_name: string;
  consignee_phone: string;
  consingee_email?: string;
  consignee_address_line_1: string;
  consignee_address_line_2?: string;
  consignee_state: string;
  consignee_city: string;
  consignee_country: string;
  consignee_pincode: string;
  same_billing_shipping: boolean;
  billing_address_line_1: string;
  billing_address_line_2?: string;
  billing_state: string;
  billing_city: string;
  billing_country: string;
  billing_pincode: string;
  package_weight?: number;
  package_length?: number;
  package_breadth?: number;
  package_height?: number;
  payment_mode: string;
  cod_amount?: number;
  shipment_mode: string;
  order_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  pickup_address: {
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
}

export interface CreateOrderRequest {
  order_id: string;
  consignee_name: string;
  consignee_phone: string;
  consingee_email?: string;
  consignee_address_line_1: string;
  consignee_address_line_2?: string;
  consignee_state: string;
  consignee_city: string;
  consignee_country: string;
  consignee_pincode: string;
  same_billing_shipping: boolean;
  billing_address_line_1: string;
  billing_address_line_2?: string;
  billing_state: string;
  billing_city: string;
  billing_country: string;
  billing_pincode: string;
  package_weight?: number;
  package_length?: number;
  package_breadth?: number;
  package_height?: number;
  payment_mode: string;
  cod_amount?: number;
  shipment_mode: string;
  order_items: Omit<OrderItem, 'id'>[];
  pickup_address_id: string;
}

export interface CreateReverseOrderRequest {
  order_id: string;
  consignee_name: string;
  consignee_phone: string;
  consingee_email?: string;
  consignee_address_line_1: string;
  consignee_address_line_2?: string;
  consignee_state: string;
  consignee_city: string;
  consignee_country: string;
  consignee_pincode: string;
  package_weight?: number;
  package_length?: number;
  package_breadth?: number;
  package_height?: number;
  reason_for_return: string;
  order_items: Omit<OrderItem, 'id'>[];
  pickup_address_id: string;
}

export interface OrdersResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: Order[];
  metadata: {
    total_items: number;
    current_page: number;
    items_per_page: number;
    total_pages: number;
  };
}

export interface OrderResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: Order;
}

export interface ManifestOrdersRequest {
  order_ids: string[];
}

export interface ManifestResponse {
  success: boolean;
  status_code: number;
  message: string;
  data: {
    successful: Array<{
      order_id: string;
      id: string;
      awb_number: string;
      status: string;
    }>;
    failed: Array<{
      order_id: string;
      id: string;
      error: string;
    }>;
    summary: {
      total_requested: number;
      successful_count: number;
      failed_count: number;
    };
  };
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  metadata: {
    total_items: number;
    current_page: number;
    items_per_page: number;
    total_pages: number;
  };
  manifestLoading: boolean;
  manifestError: string | null;
  lastManifestResult: ManifestResponse | null;
}

const initialState: OrderState = {
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
  manifestLoading: false,
  manifestError: null,
  lastManifestResult: null,
};

// Async thunks for API calls

// Create Forward Order (with optional manifest)
export const createForwardOrder = createAsyncThunk(
  'orders/createForward',
  async ({ orderData, manifest }: { orderData: CreateOrderRequest; manifest?: boolean }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/order/forward${manifest ? '?manifest=yes' : '?manifest=no'}`,
        orderData
      );
      return response.data as OrderResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create order'
      );
    }
  }
);

// Create Reverse Order
export const createReverseOrder = createAsyncThunk(
  'orders/createReverse',
  async (orderData: CreateReverseOrderRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/order/reverse', orderData);
      return response.data as OrderResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create reverse order'
      );
    }
  }
);

// Get Orders with pagination and filters
export const getOrders = createAsyncThunk(
  'orders/getOrders',
  async (
    params: {
      page?: number;
      offset?: number;
      query?: string;
      order_type?: string;
      status?: string;
      payment_mode?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get('/order', { params });
      return response.data as OrdersResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch orders'
      );
    }
  }
);

// Manifest Orders
export const manifestOrders = createAsyncThunk(
  'orders/manifest',
  async (data: ManifestOrdersRequest, { rejectWithValue }) => {
    try {
      const response = await api.post('/order/forward/manifest', data);
      return response.data as ManifestResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to manifest orders'
      );
    }
  }
);

// Cancel Order
export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/order/cancel/${orderId}`);
      return { orderId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to cancel order'
      );
    }
  }
);

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearManifestError: (state) => {
      state.manifestError = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearLastManifestResult: (state) => {
      state.lastManifestResult = null;
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
  },
  extraReducers: (builder) => {
    // Create Forward Order
    builder
      .addCase(createForwardOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createForwardOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
        // Add to orders list if it's not already there
        const existingOrderIndex = state.orders.findIndex(
          (order: Order) => order.id === action.payload.data.id
        );
        if (existingOrderIndex === -1) {
          state.orders.unshift(action.payload.data);
        } else {
          state.orders[existingOrderIndex] = action.payload.data;
        }
      })
      .addCase(createForwardOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Reverse Order
    builder
      .addCase(createReverseOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReverseOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
        // Add to orders list if it's not already there
        const existingOrderIndex = state.orders.findIndex(
          (order: Order) => order.id === action.payload.data.id
        );
        if (existingOrderIndex === -1) {
          state.orders.unshift(action.payload.data);
        } else {
          state.orders[existingOrderIndex] = action.payload.data;
        }
      })
      .addCase(createReverseOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get Orders
    builder
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.metadata = action.payload.metadata;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Manifest Orders
    builder
      .addCase(manifestOrders.pending, (state) => {
        state.manifestLoading = true;
        state.manifestError = null;
      })
      .addCase(manifestOrders.fulfilled, (state, action) => {
        state.manifestLoading = false;
        state.lastManifestResult = action.payload;

        // Update successful orders with new status and AWB numbers
        action.payload.data.successful.forEach((successfulOrder: { id: string; status: string; awb_number: string }) => {
          const orderIndex = state.orders.findIndex((order: Order) => order.id === successfulOrder.id);
          if (orderIndex !== -1) {
            state.orders[orderIndex].status = successfulOrder.status;
            state.orders[orderIndex].awb_number = successfulOrder.awb_number;
          }
        });
      })
      .addCase(manifestOrders.rejected, (state, action) => {
        state.manifestLoading = false;
        state.manifestError = action.payload as string;
      });

    // Cancel Order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const orderIndex = state.orders.findIndex((order: Order) => order.id === action.payload.orderId);
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'CANCELLED';
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  clearManifestError,
  clearCurrentOrder,
  clearLastManifestResult,
  updateOrderStatus,
} = orderSlice.actions;

export default orderSlice.reducer;