// API Endpoints Configuration (matching backend routes)
// Note: Base URL already includes /api/v1, so endpoints are relative paths
export const API_ENDPOINTS = {
  // Orders (both forward and reverse)
  ORDERS: '/order',
  CREATE_FORWARD_ORDER: '/order/forward',
  CREATE_REVERSE_ORDER: '/order/reverse',
  CREATE_REVERSE_ORDER_EXISTING: '/order/reverse/existing',
  CREATE_BULK_FORWARD_ORDERS: '/order/forward/bulk',
  MANIFEST_ORDERS: '/order/forward/manifest',
  CANCEL_ORDER: (orderId: string) => `/order/cancel/${orderId}`,

  // Pickup Requests
  PICKUP_REQUESTS: '/pickup',
  CREATE_PICKUP_REQUEST: '/pickup',

  // Shipping Labels
  SHIPPING_LABEL: '/shipping-label',

  // Warehouses
  WAREHOUSES: '/warehouse',

  // Tracking
  TRACKING: '/tracking',

  // Pincode Serviceability
  PINCODE_SERVICEABILITY: '/pincode-serviceablity',

  // Authentication
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  PROFILE: '/auth/profile',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// API Response Types
export type ApiSuccessResponse<T = Record<string, unknown>> = {
  success: true;
  data: T;
  message: string;
};

export type ApiErrorResponse = {
  success: false;
  error: string;
  message: string;
  statusCode: number;
};

export type ApiResponse<T = Record<string, unknown>> = ApiSuccessResponse<T> | ApiErrorResponse;

// Common API Headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const;

// Request Timeout (in milliseconds)
export const REQUEST_TIMEOUT = 30000; // 30 seconds

// Retry Configuration
export const RETRY_CONFIG = {
  retries: 3,
  retryDelay: 1000, // 1 second
  retryCondition: (error: { response?: { status: number } }) => {
    // Retry on network errors or 5xx status codes
    return !error.response || (error.response.status >= 500 && error.response.status <= 599);
  },
} as const;