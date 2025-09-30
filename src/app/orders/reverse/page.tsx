"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DynamicTable from '../../../components/tables/DynamicTable';
import OrderStateSidebar from '../../../components/orders/OrderStateSidebar';
import OrderFilters from '../../../components/orders/OrderFilters';
import { REVERSE_ORDER_STATE_CONFIG } from '../../../config/orderStates';
import { ReverseOrderState } from '../../../types/orders';
import { PlusIcon, DownloadIcon } from '../../../icons';
import { useAppDispatch, useAppSelector } from '../../../lib/hooks';
import { getOrders, clearError } from '../../../lib/slices/orderSlice';

const ReverseOrdersPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orders, loading, error, metadata } = useAppSelector((state) => state.orders);

  const [currentState, setCurrentState] = useState<ReverseOrderState>('pending');
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
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
    { key: 'out_for_delivery' as ReverseOrderState, label: 'Out for Delivery', count: 0 },
    { key: 'delivered' as ReverseOrderState, label: 'Delivered', count: 0 },
    { key: 'cancelled' as ReverseOrderState, label: 'Cancelled', count: 0 },
    { key: 'all_shipments' as ReverseOrderState, label: 'All Shipments', count: 0 }
  ]);

  const currentConfig = REVERSE_ORDER_STATE_CONFIG[currentState] || {
    columns: [],
    filters: [],
    rowActions: [],
    defaultSort: { columnId: 'orderId', direction: 'desc' as const }
  };

  const fetchOrders = useCallback(async () => {
    dispatch(clearError());

    // Map frontend state to backend status
    let status: string | undefined;
    if (currentState !== 'all_shipments') {
      const statusMap: Record<ReverseOrderState, string | undefined> = {
        'pending': 'PENDING',
        'ready_for_pickup': 'MANIFESTED',
        'in_transit': 'IN_TRANSIT',
        'out_for_delivery': 'IN_TRANSIT', // Backend treats these as same
        'delivered': 'DELIVERED',
        'cancelled': 'CANCELLED',
        'all_shipments': undefined
      };
      status = statusMap[currentState];
    }

    const resultAction = await dispatch(getOrders({
      page: pagination.page,
      offset: pagination.offset,
      order_type: 'REVERSE',
      status,
      ...filters
    }));

    // Update pagination total from metadata
    if (getOrders.fulfilled.match(resultAction)) {
      setPagination(prev => ({
        ...prev,
        total: resultAction.payload.metadata.total_items
      }));
    }
  }, [dispatch, currentState, pagination.page, pagination.offset, filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update current state count when orders are fetched
  useEffect(() => {
    if (metadata) {
      setOrderStates(prev => prev.map(state =>
        state.key === currentState
          ? { ...state, count: metadata.total_items }
          : state
      ));
    }
  }, [metadata, currentState]);

  const handleStateChange = (newState: ReverseOrderState) => {
    setCurrentState(newState);
  };

  const handleFilterChange = (newFilters: Record<string, string | number | boolean>) => {
    setFilters(newFilters);
  };

  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    // Implement sorting logic
    console.log('Sort:', columnId, direction);
  };

  const handleRowAction = (action: string, rowData: Record<string, unknown>) => {
    switch (action) {
      case 'getAwb':
        // Handle manifest order
        console.log('Get AWB for reverse order:', (rowData as {order_id: string}).order_id);
        break;
      case 'printLabel':
        // Handle print label
        console.log('Print label for AWB:', (rowData as {awb_number?: string}).awb_number);
        break;
      case 'trackShipment':
        // Handle track shipment
        console.log('Track shipment:', (rowData as {order_id: string}).order_id);
        break;
      case 'cloneOrder':
        // Handle clone order
        console.log('Clone reverse order:', (rowData as {order_id: string}).order_id);
        break;
      case 'cancelShipment':
        // Handle cancel shipment
        console.log('Cancel reverse shipment:', (rowData as {order_id: string}).order_id);
        break;
      case 'contactCustomer':
        // Handle contact customer
        console.log('Contact customer for:', (rowData as {order_id: string}).order_id);
        break;
      case 'printPOD':
        // Handle print POD
        console.log('Print POD for:', (rowData as {order_id: string}).order_id);
        break;
      default:
        console.log('Unknown action:', action, rowData);
    }
  };

  const handleCreateOrder = () => {
    router.push('/orders/reverse/create');
  };

  const handleUploadOrders = () => {
    // Implement upload reverse orders functionality
    console.log('Upload reverse orders');
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
              <div className="flex items-center justify-between">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
                {error.includes('connect to server') && (
                  <button
                    onClick={() => fetchOrders()}
                    className="ml-4 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto p-6">
            <DynamicTable
              data={orders as Record<string, unknown>[]}
              config={currentConfig}
              isLoading={loading}
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