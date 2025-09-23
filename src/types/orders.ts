import React from 'react';

// Backend constants matching
export type OrderStatus =
  | 'PENDING'
  | 'MANIFESTED'
  | 'READY_FOR_PICKUP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED';

export type OrderType = 'FORWARD' | 'REVERSE';

export type PaymentMode = 'COD' | 'Prepaid' | 'Pickup';

export type ShippingMode = 'Surface' | 'Express';

// Frontend display states (derived from backend statuses)
export type OrderState =
  | 'pending'
  | 'ready_to_ship' // MANIFESTED
  | 'ready_for_pickup'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'all_shipments';

export type ReverseOrderState =
  | 'pending'
  | 'ready_for_pickup'
  | 'in_transit'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'all_shipments';

export interface ColumnConfig {
  id: string;
  header: string;
  accessor: (data: Record<string, unknown>) => React.ReactNode;
  sortable: boolean;
  minWidth: number;
  hideOn?: ('sm' | 'md' | 'lg')[];
}

export interface FilterConfig {
  id: string;
  placeholder?: string;
  label?: string;
  kind?: 'range' | 'single';
  param: string;
  scope?: 'orders' | 'awbs';
  max?: number;
  optionsSource?: string;
}

export interface StateConfig {
  columns: ColumnConfig[];
  filters: FilterConfig[];
  rowActions: string[];
  defaultSort: {
    columnId: string;
    direction: 'asc' | 'desc';
  };
}

// Backend Order interface (matching Prisma schema)
export interface Order {
  id: string;
  order_id: string;
  awb_number?: string;

  // Consignee details
  consignee_name: string;
  consignee_phone: string;
  consingee_email?: string;
  consignee_address_line_1: string;
  consignee_address_line_2?: string;
  consignee_state: string;
  consignee_city: string;
  consignee_country: string;
  consignee_pincode: string;

  // Billing details
  same_billing_shipping: boolean;
  billing_address_line_1: string;
  billing_address_line_2?: string;
  billing_state: string;
  billing_city: string;
  billing_country: string;
  billing_pincode: string;

  // Package details
  package_weight?: number; // in kg
  package_length?: number; // in cm
  package_breadth?: number; // in cm
  package_height?: number; // in cm

  // Shipping options
  payment_mode: PaymentMode;
  cod_amount?: number;
  shipment_mode: ShippingMode;
  order_type: OrderType;

  // Status and other fields
  status: OrderStatus;
  reason_for_return?: string;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Relations
  user_id: string;
  pickup_address_id: string;

  // Populated relations
  user?: User;
  pickup_address?: Address;
  order_items?: OrderItem[];
  tracking?: Tracking;
}

// User interface (from backend)
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// Address interface (from backend)
export interface Address {
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
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Order Items interface (from backend)
export interface OrderItem {
  id: string;
  item_name: string;
  sku_code: string;
  category: string;
  product_image?: string;
  price: number;
  discount?: number;
  is_fragile?: boolean;
  order_id: string;
  created_at: string;
  updated_at: string;
}

// Pickup Request interface (from backend)
export interface PickupRequest {
  id: string;
  pickup_time: string;
  pickup_date: string;
  expected_package_count?: number;
  pickup_address_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  pickup_address?: Address;
}

// Tracking interface (from backend)
export interface Tracking {
  id: string;
  order_id: string;
  sender_name?: string;
  pickup_location?: string;
  origin?: string;
  destination?: string;
  charged_weight?: number;
  quantity?: string;
  ewaybill?: string;
  pickup_date?: string;
  pickedup_date?: string;
  first_attempt_date?: string;
  delivery_date?: string;
}

// Reverse Order is the same as Order but filtered by order_type = 'REVERSE'
export type ReverseOrder = Order;

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
  metadata?: {
    total_items: number;
    current_page: number;
    items_per_page: number;
    total_pages: number;
  };
}

// Create Order payload interfaces
export interface CreateForwardOrderPayload {
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
  payment_mode: PaymentMode;
  cod_amount?: number;
  shipment_mode: ShippingMode;
  order_items: Array<{
    item_name: string;
    sku_code: string;
    category: string;
    product_image?: string;
    price: number;
    discount?: number;
    is_fragile?: boolean;
  }>;
  pickup_address_id: string;
}

export interface CreateReverseOrderPayload extends CreateForwardOrderPayload {
  reason_for_return: string;
}

export interface CreatePickupRequestPayload {
  pickup_time: string;
  pickup_date: string;
  pickup_address_id: string;
  expected_package_count?: number;
}