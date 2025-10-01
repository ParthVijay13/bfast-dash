import apiClient from '../lib/axios';
import {
  Order,
  PickupRequest,
  OrderType,
  OrderStatus,
  ApiResponse,
  CreateForwardOrderPayload,
  CreateReverseOrderPayload,
  CreatePickupRequestPayload,
  Address
} from '../types/orders';
import { API_ENDPOINTS } from '../config/apiEndpoints';

// Orders API Service
export const orderService = {
  // Get orders with filters and pagination
  getOrders: async (
    orderType: OrderType = 'FORWARD',
    filters: Record<string, string | number> = {},
    page: number = 1,
    offset: number = 50
  ): Promise<ApiResponse<Order[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      offset: offset.toString(),
      order_type: orderType,
      ...Object.entries(filters).reduce((acc, [key, value]) => {
        if (value) {
          acc[key] = value.toString();
        }
        return acc;
      }, {} as Record<string, string>)
    });

    const response = await apiClient.get<ApiResponse<Order[]>>(
      `${API_ENDPOINTS.ORDERS}?${params.toString()}`
    );
    return response.data;
  },

  // Create new forward order
  createForwardOrder: async (
    orderData: CreateForwardOrderPayload,
    manifest: boolean = false
  ): Promise<ApiResponse<Order>> => {
    const params = manifest ? '?manifest=yes' : '';
    const response = await apiClient.post<ApiResponse<Order>>(
      `${API_ENDPOINTS.CREATE_FORWARD_ORDER}${params}`,
      orderData
    );
    return response.data;
  },

  // Create new reverse order
  createReverseOrder: async (orderData: CreateReverseOrderPayload): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      API_ENDPOINTS.CREATE_REVERSE_ORDER,
      orderData
    );
    return response.data;
  },

  // Create reverse order on existing forward order
  createReverseOrderOnExisting: async (
    forwardOrderId: string,
    reverseData: Partial<CreateReverseOrderPayload>
  ): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      API_ENDPOINTS.CREATE_REVERSE_ORDER_EXISTING,
      { forward_order_id: forwardOrderId, ...reverseData }
    );
    return response.data;
  },

  // Create bulk forward orders
  createBulkForwardOrders: async (orders: CreateForwardOrderPayload[]): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.post<ApiResponse<Order[]>>(
      API_ENDPOINTS.CREATE_BULK_FORWARD_ORDERS,
      { orders }
    );
    return response.data;
  },

  // Manifest orders
  manifestOrders: async (orderIds: string[]): Promise<ApiResponse<{ successful: Order[]; failed: any[] }>> => {
    const response = await apiClient.post<ApiResponse<{ successful: Order[]; failed: any[] }>>(
      API_ENDPOINTS.MANIFEST_ORDERS,
      { order_ids: orderIds }
    );
    return response.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await apiClient.post<ApiResponse<Order>>(
      API_ENDPOINTS.CANCEL_ORDER(orderId)
    );
    return response.data;
  }
};

// Pickup Requests Service
export const pickupService = {
  // Get all pickup requests
  getPickupRequests: async (
    page: number = 1,
    offset: number = 50
  ): Promise<ApiResponse<PickupRequest[]>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      offset: offset.toString()
    });

    const response = await apiClient.get<ApiResponse<PickupRequest[]>>(
      `${API_ENDPOINTS.PICKUP_REQUESTS}?${params.toString()}`
    );
    console.log("response in the pickup service ",response);
    return response.data;
  },

  // Create pickup request
  createPickupRequest: async (data: CreatePickupRequestPayload): Promise<ApiResponse<PickupRequest>> => {
    const response = await apiClient.post<ApiResponse<PickupRequest>>(
      API_ENDPOINTS.CREATE_PICKUP_REQUEST,
      data
    );
    return response.data;
  }
};

// Warehouse/Address Service
export const warehouseService = {
  // Get user's warehouse addresses
  getWarehouses: async (): Promise<ApiResponse<Address[]>> => {
    const response = await apiClient.get<ApiResponse<Address[]>>(
      API_ENDPOINTS.WAREHOUSES
    );
    return response.data;
  }
};

// Tracking Service
export const trackingService = {
  // Track order by AWB
  trackOrder: async (awb: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      `${API_ENDPOINTS.TRACKING}/${awb}`
    );
    return response.data;
  }
};

// Pincode Service
export const pincodeService = {
  // Check pincode serviceability
  checkServiceability: async (pincode: string): Promise<ApiResponse<{
    serviceable: boolean;
    estimated_days?: number;
    zone?: string;
  }>> => {
    const response = await apiClient.get<ApiResponse<{
      serviceable: boolean;
      estimated_days?: number;
      zone?: string;
    }>>(`${API_ENDPOINTS.PINCODE_SERVICEABILITY}/${pincode}`);
    return response.data;
  }
};

// Authentication Service
export const authService = {
  // Login
  login: async (email: string, password: string): Promise<ApiResponse<{
    user: any;
    token: string;
  }>> => {
    const response = await apiClient.post<ApiResponse<{
      user: any;
      token: string;
    }>>(API_ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  // Register
  register: async (userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
  }): Promise<ApiResponse<any>> => {
    const response = await apiClient.post<ApiResponse<any>>(
      API_ENDPOINTS.REGISTER,
      userData
    );
    return response.data;
  },

  // Get profile
  getProfile: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get<ApiResponse<any>>(
      API_ENDPOINTS.PROFILE
    );
    return response.data;
  }
};

// Helper functions for frontend
export const orderUtils = {
  // Map backend OrderStatus to frontend display states
  mapStatusToState: (status: OrderStatus, orderType: OrderType): string => {
    if (orderType === 'REVERSE') {
      const reverseStateMap: Record<OrderStatus, string> = {
        'PENDING': 'pending',
        'MANIFESTED': 'ready_to_ship',
        'READY_FOR_PICKUP': 'ready_for_pickup',
        'IN_TRANSIT': 'in_transit',
        'DELIVERED': 'delivered',
        'CANCELLED': 'cancelled'
      };
      return reverseStateMap[status] || 'pending';
    }

    const forwardStateMap: Record<OrderStatus, string> = {
      'PENDING': 'pending',
      'MANIFESTED': 'ready_to_ship',
      'READY_FOR_PICKUP': 'ready_for_pickup',
      'IN_TRANSIT': 'in_transit',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled'
    };
    return forwardStateMap[status] || 'pending';
  },

  // Filter orders by status
  filterOrdersByStatus: (orders: Order[], status?: OrderStatus): Order[] => {
    if (!status) return orders;
    return orders.filter(order => order.status === status);
  },

  // Get orders by type and status
  getOrdersByState: async (
    orderType: OrderType,
    status?: OrderStatus,
    page: number = 1,
    offset: number = 50
  ): Promise<ApiResponse<Order[]>> => {
    const filters: Record<string, string | number> = {};
    if (status) {
      filters.status = status;
    }

    return orderService.getOrders(orderType, filters, page, offset);
  }
};