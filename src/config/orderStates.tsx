import React from 'react';
import { OrderState, ReverseOrderState, StateConfig, Order, ReverseOrder } from '../types/orders';

// Cell renderer functions for forward orders
export const renderOrderIdCell = (order: Order) => (
  <div className="flex flex-col">
    <span className="font-medium text-gray-900 dark:text-white">{order.orderId}</span>
    {order.awb && <span className="text-sm text-gray-500">{order.awb}</span>}
  </div>
);

export const renderOrderIdWithRiskCell = (order: Order) => (
  <div className="flex flex-col">
    <span className="font-medium text-gray-900 dark:text-white">{order.orderId}</span>
    {order.awb && <span className="text-sm text-gray-500">{order.awb}</span>}
    {/* Add risk chip logic here */}
  </div>
);

export const renderAddressesCell = (order: Order) => (
  <div className="flex flex-col space-y-1">
    <div className="text-sm">
      <span className="font-medium">Pickup:</span> {order.addresses?.pickup}
    </div>
    <div className="text-sm">
      <span className="font-medium">Delivery:</span> {order.addresses?.delivery}
    </div>
  </div>
);

export const renderProductDetailsCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.productDetails || 'N/A'}
  </div>
);

export const renderPackagingDetailsCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.packagingDetails || 'N/A'}
  </div>
);

export const renderDeliveryDetailsCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.deliveryDetails || 'N/A'}
  </div>
);

export const renderManifestDateCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.manifestedAt ? new Date(order.manifestedAt).toLocaleDateString() : 'N/A'}
  </div>
);

export const renderTransportZoneCell = (order: Order) => (
  <div className="flex flex-col">
    <span className="text-sm">{order.transportMode}</span>
    <span className="text-xs text-gray-500">{order.zone}</span>
  </div>
);

export const renderPaymentModeCell = (order: Order) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    {order.paymentMode}
  </span>
);

export const renderStatusCell = (order: Order) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
    {order.status}
  </span>
);

export const renderDateCell = (order: Order, field: keyof Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order[field] ? new Date(order[field] as string).toLocaleDateString() : 'N/A'}
  </div>
);

export const renderLastUpdateCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.lastUpdate ? new Date(order.lastUpdate).toLocaleString() : 'N/A'}
  </div>
);

export const renderDeliveredWeightCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.deliveredWeight ? `${order.deliveredWeight} kg` : 'N/A'}
  </div>
);

// Cell renderer functions for reverse orders
export const renderReverseOrderIdCell = (data: Record<string, unknown>) => {
  const order = data as Order;
  return (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900 dark:text-white">{order.order_id}</span>
      {order.awb_number && <span className="text-sm text-gray-500">{order.awb_number}</span>}
    </div>
  );
};

export const renderAwbOrderIdCell = (order: ReverseOrder) => (
  <div className="flex flex-col">
    <span className="font-medium text-gray-900 dark:text-white">{order.awb_number || 'N/A'}</span>
    <span className="text-sm text-gray-500">{order.order_id}</span>
  </div>
);

export const renderOrderDateCell = (order: ReverseOrder) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
  </div>
);

export const renderPackageDetailsCell = (order: ReverseOrder) => (
  <div className="flex flex-col text-sm text-gray-900 dark:text-white">
    <span>Weight: {order.package_weight ? `${order.package_weight}kg` : 'N/A'}</span>
    {(order.package_length && order.package_breadth && order.package_height) && (
      <span>Dims: {order.package_length}x{order.package_breadth}x{order.package_height}cm</span>
    )}
  </div>
);

export const renderPickupReturnAddressCell = (order: ReverseOrder) => (
  <div className="flex flex-col space-y-1">
    <div className="text-sm">
      <span className="font-medium">Pickup:</span> {order.pickup_address?.warehouse_name || order.consignee_city}
    </div>
    <div className="text-sm">
      <span className="font-medium">Return:</span> {order.pickup_address?.return_city || 'N/A'}
    </div>
  </div>
);

export const renderTransportModeCell = (order: ReverseOrder) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.shipment_mode}
  </div>
);

export const renderOrderPriceCell = (order: ReverseOrder) => (
  <div className="text-sm font-medium text-gray-900 dark:text-white">
    {order.cod_amount ? `₹${order.cod_amount}` : 'N/A'}
  </div>
);

export const renderManifestedOnCell = (order: ReverseOrder) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.status === 'MANIFESTED' ? new Date(order.updated_at).toLocaleDateString() : 'N/A'}
  </div>
);

export const renderInitiatedOnCell = (order: ReverseOrder) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
  </div>
);

export const renderNoOfItemsCell = (order: ReverseOrder) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.order_items?.length || 0}
  </div>
);

export const renderDeliveryAttemptsCell = (order: ReverseOrder) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.deliveryAttempts || 0}
  </div>
);

export const renderDeliveredDateCell = (order: ReverseOrder) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.deliveredDate ? new Date(order.deliveredDate).toLocaleDateString() : 'N/A'}
  </div>
);

export const renderCustomerDetailsCell = (order: ReverseOrder) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.customerDetails || 'N/A'}
  </div>
);

export const renderDeliveryConfirmationCell = (order: ReverseOrder) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.deliveryConfirmation || 'N/A'}
  </div>
);

export const renderPaymentStatusCell = (order: ReverseOrder) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
    {order.paymentStatus}
  </span>
);

export const renderReversePaymentModeCell = (order: ReverseOrder) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    {order.payment_mode}
  </span>
);

export const renderCancelledDateCell = (order: ReverseOrder) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.cancelledDate ? new Date(order.cancelledDate).toLocaleDateString() : 'N/A'}
  </div>
);

// Forward Orders Configuration
export const ORDER_STATE_CONFIG: Record<OrderState, StateConfig> = {
  pending: {
    columns: [
      {
        id: 'orderId',
        header: 'ORDER ID',
        accessor: renderOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'addresses',
        header: 'PICKUP AND DELIVERY ADDRESS',
        accessor: renderAddressesCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'productDetails',
        header: 'PRODUCT DETAILS',
        accessor: renderProductDetailsCell,
        sortable: false,
        minWidth: 200,
        hideOn: ['sm']
      },
      {
        id: 'packagingDetails',
        header: 'PACKAGING DETAILS',
        accessor: renderPackagingDetailsCell,
        sortable: false,
        minWidth: 150,
        hideOn: ['sm']
      },
      {
        id: 'deliveryDetails',
        header: 'DELIVERY DETAILS',
        accessor: renderDeliveryDetailsCell,
        sortable: false,
        minWidth: 150
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search up to 250 Orders', scope: 'orders', max: 250, param: 'search' },
      { id: 'date', label: 'Date Range', kind: 'range', param: 'date_range' },
      { id: 'select', label: 'Pickup Location', param: 'pickup_location', optionsSource: 'pickupLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Zone', param: 'zone', optionsSource: 'zones' },
      { id: 'select', label: 'More Filters', param: 'more', optionsSource: 'more' }
    ],
    rowActions: ['getAwb'],
    defaultSort: { columnId: 'orderId', direction: 'desc' }
  },

  ready_to_ship: {
    columns: [
      {
        id: 'orderAwb',
        header: 'ORDER ID AND AWB',
        accessor: renderOrderIdWithRiskCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'manifestedAt',
        header: 'MANIFESTED DATE',
        accessor: renderManifestDateCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'addresses',
        header: 'PICKUP AND DELIVERY ADDRESS',
        accessor: renderAddressesCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'transportZone',
        header: 'TRANSPORT MODE AND ZONE',
        accessor: renderTransportZoneCell,
        sortable: false,
        minWidth: 180,
        hideOn: ['sm']
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderPaymentModeCell,
        sortable: false,
        minWidth: 120,
        hideOn: ['sm']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search upto 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Manifested Date', kind: 'range', param: 'manifested_date' },
      { id: 'select', label: 'Pickup Location', param: 'pickup_location', optionsSource: 'pickupLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' },
      { id: 'select', label: 'More Filters', param: 'more', optionsSource: 'more' }
    ],
    rowActions: ['printLabel', 'addToPickup'],
    defaultSort: { columnId: 'manifestedAt', direction: 'desc' }
  },

  ready_for_pickup: {
    columns: [
      {
        id: 'orderAwb',
        header: 'ORDER ID AND AWB',
        accessor: renderOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'manifestedAt',
        header: 'MANIFESTED DATE',
        accessor: renderManifestDateCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'addresses',
        header: 'PICKUP AND DELIVERY ADDRESS',
        accessor: renderAddressesCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'transportZone',
        header: 'TRANSPORT MODE AND ZONE',
        accessor: renderTransportZoneCell,
        sortable: false,
        minWidth: 180,
        hideOn: ['sm']
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderPaymentModeCell,
        sortable: false,
        minWidth: 120,
        hideOn: ['sm']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search upto 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Manifested Date', kind: 'single', param: 'manifested_date' },
      { id: 'select', label: 'Pickup Location', param: 'pickup_location', optionsSource: 'pickupLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' },
      { id: 'select', label: 'More Filters', param: 'more', optionsSource: 'more' }
    ],
    rowActions: ['printLabel'],
    defaultSort: { columnId: 'manifestedAt', direction: 'desc' }
  },

  in_transit: {
    columns: [
      {
        id: 'orderAwb',
        header: 'ORDER ID & AWB',
        accessor: renderOrderIdCell,
        sortable: true,
        minWidth: 180
      },
      {
        id: 'addresses',
        header: 'ADDRESSES',
        accessor: renderAddressesCell,
        sortable: false,
        minWidth: 280,
        hideOn: ['sm']
      },
      {
        id: 'status',
        header: 'STATUS',
        accessor: renderStatusCell,
        sortable: true,
        minWidth: 120
      },
      {
        id: 'estimatedDeliveryDate',
        header: 'EST. DELIVERY',
        accessor: (order) => renderDateCell(order, 'estimatedDeliveryDate'),
        sortable: true,
        minWidth: 130,
        hideOn: ['sm']
      },
      {
        id: 'promisedDeliveryDate',
        header: 'PROMISED DATE',
        accessor: (order) => renderDateCell(order, 'promisedDeliveryDate'),
        sortable: true,
        minWidth: 130,
        hideOn: ['sm', 'md']
      },
      {
        id: 'lastUpdate',
        header: 'LAST UPDATE',
        accessor: renderLastUpdateCell,
        sortable: true,
        minWidth: 200,
        hideOn: ['sm', 'md', 'lg']
      },
      {
        id: 'transportZone',
        header: 'TRANSPORT & ZONE',
        accessor: renderTransportZoneCell,
        sortable: false,
        minWidth: 150,
        hideOn: ['sm', 'md', 'lg']
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT',
        accessor: renderPaymentModeCell,
        sortable: false,
        minWidth: 100,
        hideOn: ['sm', 'md', 'lg']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search upto 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'select', label: 'Shipment Status', param: 'shipment_status', optionsSource: 'shipmentStatuses' },
      { id: 'date', label: 'Estimated Delivery Date', kind: 'single', param: 'estimated_delivery_date' },
      { id: 'select', label: 'Pickup Location', param: 'pickup_location', optionsSource: 'pickupLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' }
    ],
    rowActions: ['cloneOrder', 'cancelShipment'],
    defaultSort: { columnId: 'estimatedDeliveryDate', direction: 'asc' }
  },

  rto_in_transit: {
    columns: [
      {
        id: 'orderAwb',
        header: 'ORDER ID AND AWB',
        accessor: renderOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'returnedOn',
        header: 'RETURNED ON',
        accessor: (order) => renderDateCell(order, 'returnedOn'),
        sortable: true,
        minWidth: 150
      },
      {
        id: 'state',
        header: 'STATE',
        accessor: renderStatusCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'addresses',
        header: 'PICKUP AND DELIVERY ADDRESS',
        accessor: renderAddressesCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'transportZone',
        header: 'TRANSPORT MODE AND ZONE',
        accessor: renderTransportZoneCell,
        sortable: false,
        minWidth: 180,
        hideOn: ['sm']
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderPaymentModeCell,
        sortable: false,
        minWidth: 120,
        hideOn: ['sm']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search upto 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Returned Date', kind: 'single', param: 'returned_date' },
      { id: 'select', label: 'Pickup Location', param: 'pickup_location', optionsSource: 'pickupLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' }
    ],
    rowActions: ['cloneOrder'],
    defaultSort: { columnId: 'returnedOn', direction: 'desc' }
  },

  delivered: {
    columns: [
      {
        id: 'orderAwb',
        header: 'ORDER ID AND AWB',
        accessor: renderOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'deliveredOn',
        header: 'DELIVERED ON',
        accessor: (order) => renderDateCell(order, 'deliveredOn'),
        sortable: true,
        minWidth: 150
      },
      {
        id: 'addresses',
        header: 'PICKUP AND DELIVERY ADDRESS',
        accessor: renderAddressesCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'transportZone',
        header: 'TRANSPORT MODE AND ZONE',
        accessor: renderTransportZoneCell,
        sortable: false,
        minWidth: 180,
        hideOn: ['sm']
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderPaymentModeCell,
        sortable: false,
        minWidth: 120,
        hideOn: ['sm']
      },
      {
        id: 'deliveredWeight',
        header: 'DELIVERED WEIGHT',
        accessor: renderDeliveredWeightCell,
        sortable: false,
        minWidth: 130,
        hideOn: ['sm']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search upto 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Delivered Date', kind: 'single', param: 'delivered_date' },
      { id: 'select', label: 'Pickup Location', param: 'pickup_location', optionsSource: 'pickupLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' }
    ],
    rowActions: ['printPOD', 'cloneOrder', 'initiateReturn'],
    defaultSort: { columnId: 'deliveredOn', direction: 'desc' }
  },

  cancelled: {
    columns: [
      {
        id: 'orderAwb',
        header: 'ORDER ID AND AWB',
        accessor: renderOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'cancelledAt',
        header: 'CANCELLED DATE',
        accessor: (order) => renderDateCell(order, 'cancelledAt'),
        sortable: true,
        minWidth: 150
      },
      {
        id: 'addresses',
        header: 'PICKUP AND DELIVERY ADDRESS',
        accessor: renderAddressesCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'transportZone',
        header: 'TRANSPORT MODE AND ZONE',
        accessor: renderTransportZoneCell,
        sortable: false,
        minWidth: 180,
        hideOn: ['sm']
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderPaymentModeCell,
        sortable: false,
        minWidth: 120,
        hideOn: ['sm']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search upto 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Cancelled Date', kind: 'single', param: 'cancelled_date' },
      { id: 'select', label: 'Pickup Location', param: 'pickup_location', optionsSource: 'pickupLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' }
    ],
    rowActions: ['cloneOrder'],
    defaultSort: { columnId: 'cancelledAt', direction: 'desc' }
  },

  all_shipments: {
    columns: [
      {
        id: 'orderAwb',
        header: 'ORDER ID AND AWB',
        accessor: renderOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'manifestedAt',
        header: 'MANIFESTED DATE',
        accessor: renderManifestDateCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'status',
        header: 'STATUS',
        accessor: renderStatusCell,
        sortable: true,
        minWidth: 120
      },
      {
        id: 'addresses',
        header: 'PICKUP AND DELIVERY ADDRESS',
        accessor: renderAddressesCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'transportZone',
        header: 'TRANSPORT MODE AND ZONE',
        accessor: renderTransportZoneCell,
        sortable: false,
        minWidth: 180,
        hideOn: ['sm']
      },
      {
        id: 'lastUpdate',
        header: 'LAST UPDATE',
        accessor: renderLastUpdateCell,
        sortable: true,
        minWidth: 200,
        hideOn: ['md']
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderPaymentModeCell,
        sortable: false,
        minWidth: 120,
        hideOn: ['sm']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search upto 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Manifested Date', kind: 'single', param: 'manifested_date' },
      { id: 'select', label: 'Shipment Status', param: 'shipment_status', optionsSource: 'shipmentStatuses' },
      { id: 'select', label: 'Pickup Location', param: 'pickup_location', optionsSource: 'pickupLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' }
    ],
    rowActions: ['cloneOrder'],
    defaultSort: { columnId: 'manifestedAt', direction: 'desc' }
  }
};

// Reverse Orders Configuration
export const REVERSE_ORDER_STATE_CONFIG: Record<ReverseOrderState, StateConfig> = {
  pending: {
    columns: [
      {
        id: 'orderId',
        header: 'ORDER ID',
        accessor: renderReverseOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'orderDate',
        header: 'ORDER DATE',
        accessor: renderOrderDateCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'packageDetails',
        header: 'PACKAGE DETAILS',
        accessor: renderPackageDetailsCell,
        sortable: false,
        minWidth: 200,
        hideOn: ['sm']
      },
      {
        id: 'addresses',
        header: 'PICKUP AND DELIVERY ADDRESS',
        accessor: renderPickupReturnAddressCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'transportMode',
        header: 'TRANSPORT MODE',
        accessor: renderTransportModeCell,
        sortable: false,
        minWidth: 150,
        hideOn: ['sm']
      },
      {
        id: 'orderPrice',
        header: 'ORDER PRICE',
        accessor: renderOrderPriceCell,
        sortable: true,
        minWidth: 120
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search up to 100 Orders', scope: 'orders', max: 100, param: 'search' },
      { id: 'date', label: 'Date Range', kind: 'range', param: 'date_range' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'More Filters', param: 'more', optionsSource: 'more' }
    ],
    rowActions: ['getAwb'],
    defaultSort: { columnId: 'orderDate', direction: 'desc' }
  },

  ready_for_pickup: {
    columns: [
      {
        id: 'awbOrderId',
        header: 'AWB AND ORDER ID',
        accessor: renderAwbOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'manifestedOn',
        header: 'MANIFESTED ON',
        accessor: renderManifestedOnCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'addresses',
        header: 'PICKUP AND RETURN ADDRESS',
        accessor: renderPickupReturnAddressCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderReversePaymentModeCell,
        sortable: false,
        minWidth: 120
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Manifested Date', kind: 'range', param: 'manifested_date' },
      { id: 'select', label: 'Return Location', param: 'return_location', optionsSource: 'returnLocations' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' }
    ],
    rowActions: ['printLabel', 'addToPickup'],
    defaultSort: { columnId: 'manifestedOn', direction: 'desc' }
  },

  in_transit: {
    columns: [
      {
        id: 'awbOrderId',
        header: 'AWB AND ORDER ID',
        accessor: renderAwbOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'initiatedOn',
        header: 'INITIATED ON',
        accessor: renderInitiatedOnCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'noOfItems',
        header: 'NO OF ITEMS',
        accessor: renderNoOfItemsCell,
        sortable: true,
        minWidth: 100,
        hideOn: ['sm']
      },
      {
        id: 'addresses',
        header: 'PICKUP AND RETURN ADDRESS',
        accessor: renderPickupReturnAddressCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'lastUpdate',
        header: 'LAST UPDATE',
        accessor: renderLastUpdateCell,
        sortable: true,
        minWidth: 200,
        hideOn: ['md']
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderReversePaymentModeCell,
        sortable: false,
        minWidth: 120,
        hideOn: ['sm']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Initiated Date', kind: 'range', param: 'initiated_date' },
      { id: 'select', label: 'Return Location', param: 'return_location', optionsSource: 'returnLocations' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' }
    ],
    rowActions: ['trackShipment', 'cloneOrder'],
    defaultSort: { columnId: 'lastUpdate', direction: 'desc' }
  },

  out_for_delivery: {
    columns: [
      {
        id: 'awbOrderId',
        header: 'AWB AND ORDER ID',
        accessor: renderAwbOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'initiatedOn',
        header: 'INITIATED ON',
        accessor: renderInitiatedOnCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'noOfItems',
        header: 'NO OF ITEMS',
        accessor: renderNoOfItemsCell,
        sortable: true,
        minWidth: 100,
        hideOn: ['sm']
      },
      {
        id: 'addresses',
        header: 'PICKUP AND RETURN ADDRESS',
        accessor: renderPickupReturnAddressCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'deliveryAttempts',
        header: 'DELIVERY ATTEMPTS',
        accessor: renderDeliveryAttemptsCell,
        sortable: true,
        minWidth: 150,
        hideOn: ['sm']
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderReversePaymentModeCell,
        sortable: false,
        minWidth: 120,
        hideOn: ['sm']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Initiated Date', kind: 'range', param: 'initiated_date' },
      { id: 'select', label: 'Return Location', param: 'return_location', optionsSource: 'returnLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' }
    ],
    rowActions: ['trackShipment', 'contactCustomer'],
    defaultSort: { columnId: 'deliveryAttempts', direction: 'desc' }
  },

  delivered: {
    columns: [
      {
        id: 'awbOrderId',
        header: 'AWB AND ORDER ID',
        accessor: renderAwbOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'deliveredDate',
        header: 'DELIVERED DATE',
        accessor: renderDeliveredDateCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'customerDetails',
        header: 'CUSTOMER DETAILS',
        accessor: renderCustomerDetailsCell,
        sortable: false,
        minWidth: 180,
        hideOn: ['sm']
      },
      {
        id: 'deliveryConfirmation',
        header: 'DELIVERY CONFIRMATION',
        accessor: renderDeliveryConfirmationCell,
        sortable: false,
        minWidth: 180,
        hideOn: ['sm']
      },
      {
        id: 'paymentStatus',
        header: 'PAYMENT STATUS',
        accessor: renderPaymentStatusCell,
        sortable: true,
        minWidth: 130
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Delivery Date', kind: 'range', param: 'delivery_date' },
      { id: 'select', label: 'Customer Location', param: 'customer_location', optionsSource: 'customerLocations' },
      { id: 'select', label: 'Payment Status', param: 'payment_status', optionsSource: 'paymentStatuses' }
    ],
    rowActions: ['printPOD', 'cloneOrder'],
    defaultSort: { columnId: 'deliveredDate', direction: 'desc' }
  },

  cancelled: {
    columns: [
      {
        id: 'awbOrderId',
        header: 'AWB AND ORDER ID',
        accessor: renderAwbOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'lastUpdate',
        header: 'LAST UPDATE',
        accessor: renderLastUpdateCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'addresses',
        header: 'PICKUP AND RETURN ADDRESS',
        accessor: renderPickupReturnAddressCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'cancelledDate',
        header: 'CANCELLED DATE',
        accessor: renderCancelledDateCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderReversePaymentModeCell,
        sortable: false,
        minWidth: 120,
        hideOn: ['sm']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Cancelled Date', kind: 'range', param: 'cancelled_date' },
      { id: 'select', label: 'Return Location', param: 'return_location', optionsSource: 'returnLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' }
    ],
    rowActions: ['cloneOrder'],
    defaultSort: { columnId: 'cancelledDate', direction: 'desc' }
  },

  all_shipments: {
    columns: [
      {
        id: 'awbOrderId',
        header: 'AWB AND ORDER ID',
        accessor: renderAwbOrderIdCell,
        sortable: true,
        minWidth: 200
      },
      {
        id: 'initiatedOn',
        header: 'INITIATED ON',
        accessor: renderInitiatedOnCell,
        sortable: true,
        minWidth: 150
      },
      {
        id: 'noOfItems',
        header: 'NO OF ITEMS',
        accessor: renderNoOfItemsCell,
        sortable: true,
        minWidth: 100,
        hideOn: ['sm']
      },
      {
        id: 'addresses',
        header: 'PICKUP AND RETURN ADDRESS',
        accessor: renderPickupReturnAddressCell,
        sortable: false,
        minWidth: 300
      },
      {
        id: 'transportMode',
        header: 'TRANSPORT MODE AND ZONE',
        accessor: renderTransportModeCell,
        sortable: false,
        minWidth: 180,
        hideOn: ['sm']
      },
      {
        id: 'lastUpdate',
        header: 'LAST UPDATE',
        accessor: renderLastUpdateCell,
        sortable: true,
        minWidth: 200,
        hideOn: ['md']
      },
      {
        id: 'paymentMode',
        header: 'PAYMENT MODE',
        accessor: renderReversePaymentModeCell,
        sortable: false,
        minWidth: 120,
        hideOn: ['sm']
      }
    ],
    filters: [
      { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs', max: 100, param: 'search' },
      { id: 'date', label: 'Initiated Date', kind: 'range', param: 'initiated_date' },
      { id: 'select', label: 'Shipment Status', param: 'shipment_status', optionsSource: 'shipmentStatuses' },
      { id: 'select', label: 'Return Location', param: 'return_location', optionsSource: 'returnLocations' },
      { id: 'select', label: 'Transport Mode', param: 'transport_mode', optionsSource: 'transportModes' },
      { id: 'select', label: 'Payment Mode', param: 'payment_mode', optionsSource: 'paymentModes' }
    ],
    rowActions: ['trackShipment', 'cloneOrder'],
    defaultSort: { columnId: 'initiatedOn', direction: 'desc' }
  }
};