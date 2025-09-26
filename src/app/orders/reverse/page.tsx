"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import DynamicTable from '../../../components/tables/DynamicTable';
import OrderStateSidebar from '../../../components/orders/OrderStateSidebar';
import OrderFilters from '../../../components/orders/OrderFilters';
import { ReverseOrderState, Order, OrderStatus } from '../../../types/orders';
import { orderUtils } from '../../../services/orderService';
import { PlusIcon, DownloadIcon } from '../../../icons';

// Custom hooks for debouncing
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Simple cell renderers for reverse orders
const renderReverseOrderIdCell = (order: Order) => (
  <div className="flex flex-col">
    <span className="font-medium text-gray-900 dark:text-white">{order.order_id}</span>
    {order.awb_number && <span className="text-sm text-gray-500">{order.awb_number}</span>}
  </div>
);

const renderOrderDateCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
  </div>
);

const renderPackageDetailsCell = (order: Order) => (
  <div className="flex flex-col text-sm text-gray-900 dark:text-white">
    <span>Weight: {order.package_weight ? `${order.package_weight}kg` : 'N/A'}</span>
    {(order.package_length && order.package_breadth && order.package_height) && (
      <span>Dims: {order.package_length}x{order.package_breadth}x{order.package_height}cm</span>
    )}
  </div>
);

const renderAddressCell = (order: Order) => (
  <div className="flex flex-col space-y-1">
    <div className="text-sm">
      <span className="font-medium">From:</span> {order.consignee_city}, {order.consignee_state}
    </div>
    <div className="text-sm">
      <span className="font-medium">To:</span> {order.pickup_address?.return_city || 'N/A'}
    </div>
  </div>
);

const renderTransportModeCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.shipment_mode}
  </div>
);

const renderOrderPriceCell = (order: Order) => (
  <div className="text-sm font-medium text-gray-900 dark:text-white">
    {order.cod_amount ? `₹${order.cod_amount}` : 'Prepaid'}
  </div>
);

const renderAwbOrderIdCell = (order: Order) => (
  <div className="flex flex-col">
    <span className="font-medium text-gray-900 dark:text-white">{order.awb_number || 'N/A'}</span>
    <span className="text-sm text-gray-500">{order.order_id}</span>
  </div>
);

const renderManifestedOnCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.status === 'MANIFESTED' ? new Date(order.updated_at).toLocaleDateString() : 'N/A'}
  </div>
);

const renderStatusCell = (order: Order) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
    order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
    order.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
    'bg-yellow-100 text-yellow-800'
  }`}>
    {order.status}
  </span>
);

const renderNoOfItemsCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.order_items?.length || 0}
  </div>
);

const renderLastUpdateCell = (order: Order) => (
  <div className="text-sm text-gray-900 dark:text-white">
    {order.updated_at ? new Date(order.updated_at).toLocaleString() : 'N/A'}
  </div>
);

// Configuration for reverse order states
const getReverseOrderStateConfig = (state: ReverseOrderState) => {
  console.log('🔄 Getting config for state:', state);

  const baseFilters = [
    { id: 'search', placeholder: 'Search up to 100 Orders', scope: 'orders' as const, max: 100, param: 'search' },
    { id: 'date', label: 'Date Range', kind: 'range' as const, param: 'date_range' },
    { id: 'select', label: 'Transport Mode', param: 'transport_mode' },
  ];

  const configs = {
    pending: {
      columns: [
        {
          id: 'orderId',
          header: 'ORDER ID',
          accessor: (data: any) => renderReverseOrderIdCell(data as Order),
          sortable: true,
          minWidth: 200
        },
        {
          id: 'orderDate',
          header: 'ORDER DATE',
          accessor: (data: any) => renderOrderDateCell(data as Order),
          sortable: true,
          minWidth: 150
        },
        {
          id: 'packageDetails',
          header: 'PACKAGE DETAILS',
          accessor: (data: any) => renderPackageDetailsCell(data as Order),
          sortable: false,
          minWidth: 200
        },
        {
          id: 'addresses',
          header: 'PICKUP AND DELIVERY ADDRESS',
          accessor: (data: any) => renderAddressCell(data as Order),
          sortable: false,
          minWidth: 300
        },
        {
          id: 'transportMode',
          header: 'TRANSPORT MODE',
          accessor: (data: any) => renderTransportModeCell(data as Order),
          sortable: false,
          minWidth: 150
        },
        {
          id: 'orderPrice',
          header: 'ORDER PRICE',
          accessor: (data: any) => renderOrderPriceCell(data as Order),
          sortable: true,
          minWidth: 120
        }
      ],
      filters: baseFilters,
      rowActions: ['getAwb'],
      defaultSort: { columnId: 'orderDate', direction: 'desc' as const }
    },
    ready_for_pickup: {
      columns: [
        {
          id: 'awbOrderId',
          header: 'AWB AND ORDER ID',
          accessor: (data: any) => renderAwbOrderIdCell(data as Order),
          sortable: true,
          minWidth: 200
        },
        {
          id: 'manifestedOn',
          header: 'MANIFESTED ON',
          accessor: (data: any) => renderManifestedOnCell(data as Order),
          sortable: true,
          minWidth: 150
        },
        {
          id: 'addresses',
          header: 'PICKUP AND RETURN ADDRESS',
          accessor: (data: any) => renderAddressCell(data as Order),
          sortable: false,
          minWidth: 300
        },
        {
          id: 'paymentMode',
          header: 'PAYMENT MODE',
          accessor: (data: any) => renderOrderPriceCell(data as Order),
          sortable: false,
          minWidth: 120
        }
      ],
      filters: [
        { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs' as const, max: 100, param: 'search' },
        { id: 'date', label: 'Manifested Date', kind: 'range' as const, param: 'manifested_date' },
        { id: 'select', label: 'Return Location', param: 'return_location' },
        { id: 'select', label: 'Payment Mode', param: 'payment_mode' }
      ],
      rowActions: ['printLabel', 'addToPickup'],
      defaultSort: { columnId: 'manifestedOn', direction: 'desc' as const }
    },
    in_transit: {
      columns: [
        {
          id: 'awbOrderId',
          header: 'AWB AND ORDER ID',
          accessor: (data: any) => renderAwbOrderIdCell(data as Order),
          sortable: true,
          minWidth: 200
        },
        {
          id: 'initiatedOn',
          header: 'INITIATED ON',
          accessor: (data: any) => renderOrderDateCell(data as Order),
          sortable: true,
          minWidth: 150
        },
        {
          id: 'noOfItems',
          header: 'NO OF ITEMS',
          accessor: (data: any) => renderNoOfItemsCell(data as Order),
          sortable: true,
          minWidth: 100
        },
        {
          id: 'addresses',
          header: 'PICKUP AND RETURN ADDRESS',
          accessor: (data: any) => renderAddressCell(data as Order),
          sortable: false,
          minWidth: 300
        },
        {
          id: 'lastUpdate',
          header: 'LAST UPDATE',
          accessor: (data: any) => renderLastUpdateCell(data as Order),
          sortable: true,
          minWidth: 200
        },
        {
          id: 'paymentMode',
          header: 'PAYMENT MODE',
          accessor: (data: any) => renderOrderPriceCell(data as Order),
          sortable: false,
          minWidth: 120
        }
      ],
      filters: [
        { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs' as const, max: 100, param: 'search' },
        { id: 'date', label: 'Initiated Date', kind: 'range' as const, param: 'initiated_date' },
        { id: 'select', label: 'Return Location', param: 'return_location' },
        { id: 'select', label: 'Payment Mode', param: 'payment_mode' }
      ],
      rowActions: ['trackShipment', 'cloneOrder'],
      defaultSort: { columnId: 'lastUpdate', direction: 'desc' as const }
    },
    out_for_delivery: {
      columns: [
        {
          id: 'awbOrderId',
          header: 'AWB AND ORDER ID',
          accessor: (data: any) => renderAwbOrderIdCell(data as Order),
          sortable: true,
          minWidth: 200
        },
        {
          id: 'initiatedOn',
          header: 'INITIATED ON',
          accessor: (data: any) => renderOrderDateCell(data as Order),
          sortable: true,
          minWidth: 150
        },
        {
          id: 'noOfItems',
          header: 'NO OF ITEMS',
          accessor: (data: any) => renderNoOfItemsCell(data as Order),
          sortable: true,
          minWidth: 100
        },
        {
          id: 'addresses',
          header: 'PICKUP AND RETURN ADDRESS',
          accessor: (data: any) => renderAddressCell(data as Order),
          sortable: false,
          minWidth: 300
        },
        {
          id: 'paymentMode',
          header: 'PAYMENT MODE',
          accessor: (data: any) => renderOrderPriceCell(data as Order),
          sortable: false,
          minWidth: 120
        }
      ],
      filters: baseFilters,
      rowActions: ['trackShipment', 'contactCustomer'],
      defaultSort: { columnId: 'initiatedOn', direction: 'desc' as const }
    },
    delivered: {
      columns: [
        {
          id: 'awbOrderId',
          header: 'AWB AND ORDER ID',
          accessor: (data: any) => renderAwbOrderIdCell(data as Order),
          sortable: true,
          minWidth: 200
        },
        {
          id: 'deliveredDate',
          header: 'DELIVERED DATE',
          accessor: (data: any) => renderOrderDateCell(data as Order),
          sortable: true,
          minWidth: 150
        },
        {
          id: 'addresses',
          header: 'PICKUP AND RETURN ADDRESS',
          accessor: (data: any) => renderAddressCell(data as Order),
          sortable: false,
          minWidth: 300
        },
        {
          id: 'status',
          header: 'STATUS',
          accessor: (data: any) => renderStatusCell(data as Order),
          sortable: true,
          minWidth: 120
        },
        {
          id: 'paymentMode',
          header: 'PAYMENT MODE',
          accessor: (data: any) => renderOrderPriceCell(data as Order),
          sortable: false,
          minWidth: 120
        }
      ],
      filters: [
        { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs' as const, max: 100, param: 'search' },
        { id: 'date', label: 'Delivery Date', kind: 'range' as const, param: 'delivery_date' },
        { id: 'select', label: 'Customer Location', param: 'customer_location' },
      ],
      rowActions: ['printPOD', 'cloneOrder'],
      defaultSort: { columnId: 'deliveredDate', direction: 'desc' as const }
    },
    cancelled: {
      columns: [
        {
          id: 'awbOrderId',
          header: 'AWB AND ORDER ID',
          accessor: (data: any) => renderAwbOrderIdCell(data as Order),
          sortable: true,
          minWidth: 200
        },
        {
          id: 'lastUpdate',
          header: 'LAST UPDATE',
          accessor: (data: any) => renderLastUpdateCell(data as Order),
          sortable: true,
          minWidth: 200
        },
        {
          id: 'addresses',
          header: 'PICKUP AND RETURN ADDRESS',
          accessor: (data: any) => renderAddressCell(data as Order),
          sortable: false,
          minWidth: 300
        },
        {
          id: 'status',
          header: 'STATUS',
          accessor: (data: any) => renderStatusCell(data as Order),
          sortable: true,
          minWidth: 120
        },
        {
          id: 'paymentMode',
          header: 'PAYMENT MODE',
          accessor: (data: any) => renderOrderPriceCell(data as Order),
          sortable: false,
          minWidth: 120
        }
      ],
      filters: [
        { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs' as const, max: 100, param: 'search' },
        { id: 'date', label: 'Cancelled Date', kind: 'range' as const, param: 'cancelled_date' },
        { id: 'select', label: 'Return Location', param: 'return_location' },
      ],
      rowActions: ['cloneOrder'],
      defaultSort: { columnId: 'lastUpdate', direction: 'desc' as const }
    },
    all_shipments: {
      columns: [
        {
          id: 'awbOrderId',
          header: 'AWB AND ORDER ID',
          accessor: (data: any) => renderAwbOrderIdCell(data as Order),
          sortable: true,
          minWidth: 200
        },
        {
          id: 'initiatedOn',
          header: 'INITIATED ON',
          accessor: (data: any) => renderOrderDateCell(data as Order),
          sortable: true,
          minWidth: 150
        },
        {
          id: 'noOfItems',
          header: 'NO OF ITEMS',
          accessor: (data: any) => renderNoOfItemsCell(data as Order),
          sortable: true,
          minWidth: 100
        },
        {
          id: 'addresses',
          header: 'PICKUP AND RETURN ADDRESS',
          accessor: (data: any) => renderAddressCell(data as Order),
          sortable: false,
          minWidth: 300
        },
        {
          id: 'status',
          header: 'STATUS',
          accessor: (data: any) => renderStatusCell(data as Order),
          sortable: true,
          minWidth: 120
        },
        {
          id: 'lastUpdate',
          header: 'LAST UPDATE',
          accessor: (data: any) => renderLastUpdateCell(data as Order),
          sortable: true,
          minWidth: 200
        },
        {
          id: 'paymentMode',
          header: 'PAYMENT MODE',
          accessor: (data: any) => renderOrderPriceCell(data as Order),
          sortable: false,
          minWidth: 120
        }
      ],
      filters: [
        { id: 'search', placeholder: 'Search up to 100 AWBs', scope: 'awbs' as const, max: 100, param: 'search' },
        { id: 'date', label: 'Initiated Date', kind: 'range' as const, param: 'initiated_date' },
        { id: 'select', label: 'Shipment Status', param: 'shipment_status' },
        { id: 'select', label: 'Return Location', param: 'return_location' },
        { id: 'select', label: 'Transport Mode', param: 'transport_mode' },
        { id: 'select', label: 'Payment Mode', param: 'payment_mode' }
      ],
      rowActions: ['trackShipment', 'cloneOrder'],
      defaultSort: { columnId: 'initiatedOn', direction: 'desc' as const }
    }
  };

  const config = configs[state] || configs.pending;
  console.log('📋 Returning config for state:', state, 'with columns:', config.columns.map(c => c.header));
  return config;
};


const ReverseOrdersPage: React.FC = () => {
  const router = useRouter();
  const [currentState, setCurrentState] = useState<ReverseOrderState>('pending');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    offset: 50,
    total: 0
  });

  // State configurations for sidebar - counts will be updated from API
  const [orderStates, setOrderStates] = useState([
    { key: 'pending' as ReverseOrderState, label: 'Pending', count: 0 },
    { key: 'ready_for_pickup' as ReverseOrderState, label: 'Ready for Pickup', count: 0 },
    { key: 'in_transit' as ReverseOrderState, label: 'In-Transit', count: 0 },
    { key: 'delivered' as ReverseOrderState, label: 'Delivered', count: 0 },
    { key: 'cancelled' as ReverseOrderState, label: 'Cancelled', count: 0 },
    { key: 'all_shipments' as ReverseOrderState, label: 'All Shipments', count: 0 }
  ]);

  const currentConfig = useMemo(() => getReverseOrderStateConfig(currentState), [currentState]);

  // Debounce filters
  const debouncedFilters = useDebounce(filters, 500);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let status: OrderStatus | undefined;

      // Map frontend state to backend status
      if (currentState !== 'all_shipments') {
        const statusMap: Record<ReverseOrderState, OrderStatus | undefined> = {
          'pending': 'PENDING',
          'ready_for_pickup': 'MANIFESTED',
          'in_transit': 'IN_TRANSIT',
          'out_for_delivery': 'IN_TRANSIT',
          'delivered': 'DELIVERED',
          'cancelled': 'CANCELLED',
          'all_shipments': undefined
        };
        status = statusMap[currentState];
      }

      const response = await orderUtils.getOrdersByState(
        'REVERSE',
        status,
        pagination.page,
        pagination.offset
      );

      if (response.success) {
        setOrders(response.data);
        if (response.metadata) {
          setPagination(prev => ({
            ...prev,
            total: response.metadata!.total_items
          }));
        }
      } else {
        throw new Error(response.message || 'Failed to fetch orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching orders');
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentState, pagination.page, pagination.offset]);

  const fetchOrderCounts = useCallback(async () => {
    try {
      // Fetch only the total count to reduce API calls
      const allOrdersResponse = await orderUtils.getOrdersByState('REVERSE', undefined, 1, 1);
      const totalCount = allOrdersResponse.metadata?.total_items || 0;

      // For now, we'll update counts based on the current data
      // This is more efficient than making 6 separate API calls
      setOrderStates(prev => prev.map(state => {
        if (state.key === 'all_shipments') {
          return { ...state, count: totalCount };
        }
        return state; // We'll calculate individual counts from the actual order data
      }));
    } catch (err) {
      console.error('Error fetching order counts:', err);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, debouncedFilters]);

  // Only fetch counts once on mount
  useEffect(() => {
    fetchOrderCounts();
  }, [fetchOrderCounts]);

  // Update counts when orders change
  useEffect(() => {
    if (orders.length > 0) {
      const statusCounts: Record<string, number> = {};
      orders.forEach(order => {
        const state = orderUtils.mapStatusToState(order.status, 'REVERSE');
        statusCounts[state] = (statusCounts[state] || 0) + 1;
      });

      setOrderStates(prev => prev.map(state => {
        if (state.key === 'all_shipments') {
          return state; // Keep the total from API
        }
        return {
          ...state,
          count: statusCounts[state.key] || 0
        };
      }));
    }
  }, [orders]);

  const handleStateChange = (newState: ReverseOrderState) => {
    setCurrentState(newState);
  };

  const handleFilterChange = useCallback((newFilters: Record<string, string | number | boolean>) => {
    setFilters(newFilters);
    // Reset pagination when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    // Implement sorting logic
    console.log('Sort:', columnId, direction);
  };

  const handleRowAction = (action: string, rowData: Order) => {
    // Implement row actions
    console.log('Action:', action, rowData);
  };

  const handleCreateOrder = () => {
    router.push('/orders/reverse/create');
  };

  const handleUploadOrders = () => {
    // Implement upload orders functionality
    console.log('Upload orders');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Reverse Orders
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage and track your return shipments
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleUploadOrders}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
              >
                <DownloadIcon className="w-4 h-4" />
                <span>Upload Orders</span>
              </button>
              <button
                onClick={handleCreateOrder}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center space-x-2"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create Order</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-120px)]">
        {/* Sidebar */}
        <OrderStateSidebar
          currentState={currentState}
          onStateChange={(state) => handleStateChange(state as ReverseOrderState)}
          states={orderStates}
          type="reverse"
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filters */}
          <OrderFilters
            filters={currentConfig.filters}
            onFilterChange={handleFilterChange}
          />

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto p-6">
            <DynamicTable
              data={orders}
              config={currentConfig}
              isLoading={isLoading}
              onSort={handleSort}
              onRowAction={handleRowAction}
            />

            {/* Pagination */}
            {pagination.total > pagination.offset && (
              <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((pagination.page - 1) * pagination.offset) + 1} to {Math.min(pagination.page * pagination.offset, pagination.total)} of {pagination.total} results
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {pagination.page} of {Math.ceil(pagination.total / pagination.offset)}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.offset)}
                    className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReverseOrdersPage;