"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DynamicTable from '../../../components/tables/DynamicTable';
import OrderStateSidebar from '../../../components/orders/OrderStateSidebar';
import OrderFilters from '../../../components/orders/OrderFilters';
import { REVERSE_ORDER_STATE_CONFIG } from '../../../config/orderStates';
import { ReverseOrderState, Order, OrderStatus, ApiResponse } from '../../../types/orders';
import { orderService, orderUtils } from '../../../services/orderService';
import { PlusIcon, DownloadIcon } from '../../../icons';


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

  const currentConfig = REVERSE_ORDER_STATE_CONFIG[currentState];

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let status: OrderStatus | undefined;

      // Map frontend state to backend status
      if (currentState !== 'all_shipments') {
        const statusMap: Record<ReverseOrderState, OrderStatus | undefined> = {
          'pending': 'PENDING',
          'ready_for_pickup': 'READY_FOR_PICKUP',
          'in_transit': 'IN_TRANSIT',
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
  };

  const fetchOrderCounts = async () => {
    try {
      // Fetch counts for each status
      const statusCounts = await Promise.all([
        orderUtils.getOrdersByState('REVERSE', 'PENDING', 1, 1),
        orderUtils.getOrdersByState('REVERSE', 'READY_FOR_PICKUP', 1, 1),
        orderUtils.getOrdersByState('REVERSE', 'IN_TRANSIT', 1, 1),
        orderUtils.getOrdersByState('REVERSE', 'DELIVERED', 1, 1),
        orderUtils.getOrdersByState('REVERSE', 'CANCELLED', 1, 1),
        orderUtils.getOrdersByState('REVERSE', undefined, 1, 1)
      ]);

      setOrderStates(prev => prev.map((state, index) => ({
        ...state,
        count: statusCounts[index]?.metadata?.total_items || 0
      })));
    } catch (err) {
      console.error('Error fetching order counts:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentState, filters, pagination.page]);

  useEffect(() => {
    fetchOrderCounts();
  }, []);

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
          onStateChange={handleStateChange}
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