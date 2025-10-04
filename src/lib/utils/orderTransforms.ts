import { Order as BackendOrder } from '../slices/orderSlice';

// Frontend Order interface matching the table expectations
export interface FrontendOrder {
  id: string;
  orderId: string;
  awb?: string;
  status: string;
  paymentMode: string;
  transportMode: string;
  zone?: string;
  manifestedAt?: string;
  createdAt: string;
  updatedAt: string;
  deliveredOn?: string;
  cancelledAt?: string;
  returnedOn?: string;
  estimatedDeliveryDate?: string;
  promisedDeliveryDate?: string;
  lastUpdate?: string;
  deliveredWeight?: number;
  productDetails?: string;
  packagingDetails?: string;
  deliveryDetails?: string;
  addresses?: {
    pickup: string;
    delivery: string;
  };
  pickupAddress?: {
    id: string;
    warehouse_name: string;
    phone: string;
    email?: string;
    pickup_address: string;
    pickup_city: string;
    pickup_state: string;
    pickup_pincode: string;
    pickup_country: string;
  };
}

// Transform backend order to frontend format
export const transformBackendOrderToFrontend = (backendOrder: BackendOrder): FrontendOrder => {
  // Create product details from order items
  const productDetails = backendOrder.order_items && backendOrder.order_items.length > 0
    ? backendOrder.order_items
        .map(item => `${item.item_name} (${item.category}) - ₹${item.price}`)
        .join(', ')
    : 'N/A';

  // Create packaging details from package dimensions
  const packagingDetails = backendOrder.package_weight || backendOrder.package_length
    ? `${backendOrder.package_weight || 0}kg, ${backendOrder.package_length || 0}×${backendOrder.package_breadth || 0}×${backendOrder.package_height || 0}cm`
    : 'N/A';

  // Create addresses object
  const addresses = {
    pickup: backendOrder.pickup_address
      ? `${backendOrder.pickup_address.pickup_address}, ${backendOrder.pickup_address.pickup_city}, ${backendOrder.pickup_address.pickup_state} - ${backendOrder.pickup_address.pickup_pincode}`
      : 'N/A',
    delivery: `${backendOrder.consignee_address_line_1}${backendOrder.consignee_address_line_2 ? ', ' + backendOrder.consignee_address_line_2 : ''}, ${backendOrder.consignee_city}, ${backendOrder.consignee_state} - ${backendOrder.consignee_pincode}`
  };

  // Determine manifested date based on status
  const manifestedAt = backendOrder.status !== 'PENDING' && backendOrder.status !== 'CANCELLED'
    ? backendOrder.updated_at
    : undefined;

  return {
    id: backendOrder.id,
    orderId: backendOrder.order_id,
    awb: backendOrder.awb_number,
    status: backendOrder.status,
    paymentMode: backendOrder.payment_mode,
    transportMode: backendOrder.shipment_mode,
    manifestedAt,
    createdAt: backendOrder.created_at,
    updatedAt: backendOrder.updated_at,
    lastUpdate: backendOrder.updated_at,
    productDetails,
    packagingDetails,
    deliveryDetails: `${backendOrder.consignee_name}, ${backendOrder.consignee_phone}`,
    addresses,
    pickupAddress: backendOrder.pickup_address,
    // Status-specific date mappings
    ...(backendOrder.status === 'DELIVERED' && { deliveredOn: backendOrder.updated_at }),
    ...(backendOrder.status === 'CANCELLED' && { cancelledAt: backendOrder.updated_at }),
  };
};

// Transform array of backend orders
export const transformBackendOrdersToFrontend = (backendOrders: BackendOrder[]): FrontendOrder[] => {
  return backendOrders.map(transformBackendOrderToFrontend);
};