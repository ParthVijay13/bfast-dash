"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import DynamicTable from '../../../components/tables/DynamicTable';
import OrderStateSidebar from '../../../components/orders/OrderStateSidebar';
import OrderFilters from '../../../components/orders/OrderFilters';
import { ORDER_STATE_CONFIG } from '../../../config/orderStates';
import { OrderState } from '../../../types/orders';
import { PlusIcon } from '../../../icons';
import { useAppDispatch, useAppSelector } from '../../../lib/hooks';
import { getOrders, clearError, generateShippingLabel, clearShippingLabelError, manifestOrders, clearManifestError, cancelOrder } from '../../../lib/slices/orderSlice';
import { transformBackendOrdersToFrontend, FrontendOrder } from '../../../lib/utils/orderTransforms';
import { ToastService } from '@/services/toast';

// Helper function to convert state to URL slug
const stateToSlug = (state: OrderState): string => {
  return state.replace(/_/g, '-');
};

// Helper function to convert URL slug to state
const slugToState = (slug: string): OrderState => {
  return slug.replace(/-/g, '_') as OrderState;
};

const ForwardOrdersPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const {
    orders: backendOrders,
    loading,
    error,
    metadata,
    shippingLabelLoading,
    shippingLabelError,
    manifestLoading,
    manifestError
  } = useAppSelector((state) => state.orders);

  // Get state from URL or default to 'pending'
  const stateFromUrl = searchParams.get('state');
  const initialState = stateFromUrl ? slugToState(stateFromUrl) : 'pending';

  const [currentState, setCurrentState] = useState<OrderState>(initialState);
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});
  const [pagination, setPagination] = useState({
    page: 1,
    offset: 50,
    total: 0
  });
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  // Sync state with URL on mount and when URL changes
  useEffect(() => {
    const urlState = searchParams.get('state');
    if (urlState) {
      const newState = slugToState(urlState);
      setCurrentState(newState);
    } else {
      // If no state in URL, set default
      router.replace(`${pathname}?state=${stateToSlug('pending')}`, { scroll: false });
    }
  }, [searchParams, pathname, router]);

  // Transform backend orders to frontend format
  const orders: FrontendOrder[] = transformBackendOrdersToFrontend(backendOrders);

  // State configurations for sidebar - counts will be updated from API
  const [orderStates, setOrderStates] = useState([
    { key: 'pending' as OrderState, label: 'Pending', count: 0 },
    { key: 'ready_to_ship' as OrderState, label: 'Ready To Ship', count: 0 },
    { key: 'ready_for_pickup' as OrderState, label: 'Ready For Pickup', count: 0 },
    { key: 'in_transit' as OrderState, label: 'In Transit', count: 0 },
    { key: 'delivered' as OrderState, label: 'Delivered', count: 0 },
    { key: 'cancelled' as OrderState, label: 'Cancelled', count: 0 },
    { key: 'all_shipments' as OrderState, label: 'All Shipments', count: 0 }
  ]);

  const currentConfig = ORDER_STATE_CONFIG[currentState] || {
    columns: [],
    filters: [],
    rowActions: [],
    defaultSort: { columnId: 'orderId', direction: 'desc' as const }
  };

  const fetchOrders = async () => {
    dispatch(clearError());

    // Map frontend state to backend status
    let status: string | undefined;
    if (currentState !== 'all_shipments') {
      const statusMap: Record<OrderState, string | undefined> = {
        'pending': 'PENDING',
        'ready_to_ship': 'MANIFESTED',
        'ready_for_pickup': 'READY_FOR_PICKUP',
        'in_transit': 'IN_TRANSIT',
        'delivered': 'DELIVERED',
        'cancelled': 'CANCELLED',
        'all_shipments': undefined
      };
      status = statusMap[currentState];
    }

    const resultAction = await dispatch(getOrders({
      page: pagination.page,
      offset: pagination.offset,
      order_type: 'FORWARD',
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
  };

  // Remove fetchOrderCounts to minimize API calls
  // Counts will be updated only when user switches to different state

  useEffect(() => {
    fetchOrders();
  }, [currentState, filters, pagination.page]);

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

  const handleStateChange = (newState: OrderState) => {
    setCurrentState(newState);
    setSelectedOrderIds([]); // Clear selection when state changes
    // Update URL when state changes
    router.push(`${pathname}?state=${stateToSlug(newState)}`, { scroll: false });
  };

  const handleFilterChange = (newFilters: Record<string, string | number | boolean>) => {
    setFilters(newFilters);
  };

  const handleSort = (columnId: string, direction: 'asc' | 'desc') => {
    // Implement sorting logic
  };

  const handleGetAwb = async (internalId?: string) => {
    console.log('Get AWB clicked',internalId);
    
    if (manifestLoading) return; // Prevent multiple clicks

    // Determine which order IDs to manifest
    let orderIdsToManifest: string[] = [];

    if (internalId) {
      // Single order from row action
      orderIdsToManifest = [internalId];
    } else if (selectedOrderIds.length > 0) {
      // Multiple selected orders from checkboxes
      orderIdsToManifest = selectedOrderIds;
    } else {
      ToastService.error('Please select at least one order to manifest');
      return;
    }

    console.log('Selected Order IDs:', selectedOrderIds);
    console.log('Order IDs to manifest:', orderIdsToManifest);

    try {
      dispatch(clearManifestError());
      const resultAction = await dispatch(manifestOrders({ order_ids: orderIdsToManifest }));
      console.log('Manifest result action:', resultAction);
      if (manifestOrders.fulfilled.match(resultAction)) {
        const response = resultAction.payload;

        if (response.data.successful.length > 0) {
          console.log("Successful orders:", response.data.successful);
          if (response.data.successful.length === 1) {
            // const successfulOrder = response.data.successful[0];
            ToastService.success(`AWB generated`);
          } else {
            ToastService.success(`Successfully manifested ${response.data.successful.length} order(s)`);
          }
        }
        // Clear selection and refresh orders
        setSelectedOrderIds([]);
        fetchOrders();
      } else {
        ToastService.error(manifestError || 'Failed to generate AWB. Please try again.');
      }
    } catch (error) {
      console.error('Error generating AWB:', error);
      ToastService.error('An error occurred while generating AWB');
    }
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    console.log('Selection changed:', selectedIds);
    setSelectedOrderIds(selectedIds);
  };

  const handlePrintLabel = async (awb: string) => {
    console.log("yeh hai awb",awb);

    if (!awb) {
      alert('AWB number is required to print label');
      return;
    }

    try {
      dispatch(clearShippingLabelError());
      const resultAction = await dispatch(generateShippingLabel(awb));
      if (generateShippingLabel.fulfilled.match(resultAction)) {
        const response = resultAction.payload;
        if (response.success && response.data && response.data.length > 0) {
          const pdfLink = response.data[0].pdf_download_link;
          if (pdfLink) {
            // Open PDF in new tab/window
            window.open(pdfLink, '_blank');
          } else {
            alert('PDF download link not available');
          }
        } else {
          alert('Failed to generate shipping label');
        }
      } else {
        // Error already handled by the reducer
        alert(shippingLabelError || 'Failed to generate shipping label');
      }
    } catch (error) {
      console.error('Error generating shipping label:', error);
      alert('Error occurred while generating shipping label');
    }
  };

  const handleRowAction = (action: string, rowData: FrontendOrder) => {
    switch (action) {
      case 'getAwb':
        // Handle manifest order
        handleGetAwb(rowData.id);
        break;
      case 'printLabel':
        // Handle print label
        if (rowData.awb) {
          handlePrintLabel(rowData.awb);
        } else {
          alert('AWB number not available for this order');
        }
        break;
      case 'addToPickup':
        // Handle add to pickup
        console.log('Add to pickup:', rowData.orderId);
        break;
      case 'cloneOrder':
        // Handle clone order
        console.log('Clone order:', rowData.orderId);
        break;
      case 'cancelShipment':
        // Handle cancel shipment
        console.log('Cancel shipment:', rowData.orderId);
        break;
      case 'printPOD':
        // Handle print POD
        console.log('Print POD for:', rowData.orderId);
        break;
      case 'initiateReturn':
        // Handle initiate return
        console.log('Initiate return for:', rowData.orderId);
        break;
      default:
        console.log('Unknown action:', action, rowData);
    }
  };

  const handleCreateOrder = () => {
    router.push('/orders/forward/create');
  };

  const handleCreateBulkOrders = () => {
    // Implement bulk order creation
    console.log('Create bulk orders');
  };

  const handleCancelOrders = async () => {
    if (selectedOrderIds.length === 0) {
      ToastService.error('Please select at least one order to cancel');
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel ${selectedOrderIds.length} order(s)?`)) {
      return;
    }

    try {
      let successCount = 0;
      let failCount = 0;

      for (const orderId of selectedOrderIds) {
        const resultAction = await dispatch(cancelOrder(orderId));
        if (cancelOrder.fulfilled.match(resultAction)) {
          successCount++;
        } else {
          failCount++;
        }
      }

      if (successCount > 0) {
        ToastService.success(`Successfully cancelled ${successCount} order(s)`);
        setSelectedOrderIds([]);
        fetchOrders();
      }

      if (failCount > 0) {
        ToastService.error(`Failed to cancel ${failCount} order(s)`);
      }
    } catch (error) {
      console.error('Error cancelling orders:', error);
      ToastService.error('An error occurred while cancelling orders');
    }
  };

  // Check if cancel button should be shown for forward orders
  const showCancelButton = () => {
    const allowedStates: OrderState[] = ['pending', 'ready_to_ship', 'in_transit', 'ready_for_pickup'];
    return allowedStates.includes(currentState) && selectedOrderIds.length > 0;
  };

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Forward Orders
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Manage and track your forward shipments
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {currentState === 'pending' && selectedOrderIds.length > 0 && (
                <button
                  onClick={() => handleGetAwb()}
                  disabled={manifestLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Get AWB ({selectedOrderIds.length})</span>
                </button>
              )}
              {showCancelButton() && (
                <button
                  onClick={handleCancelOrders}
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Cancel Order{selectedOrderIds.length > 1 ? 's' : ''} ({selectedOrderIds.length})</span>
                </button>
              )}
              <button
                onClick={handleCreateBulkOrders}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Create Bulk Orders
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

      <div className="flex">
        {/* Sidebar */}
        <OrderStateSidebar
          currentState={currentState}
          onStateChange={(state) => handleStateChange(state as OrderState)}
          states={orderStates}
          type="forward"
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Filters */}
          <OrderFilters
            filters={currentConfig.filters}
            onFilterChange={handleFilterChange}
          />

          {/* Error Messages */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}
          {manifestError && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center justify-between">
                <p className="text-red-800 dark:text-red-200 text-sm">{manifestError}</p>
                <button
                  onClick={() => dispatch(clearManifestError())}
                  className="ml-4 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          {manifestLoading && (
            <div className="mx-6 mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-blue-800 dark:text-blue-200 text-sm">Generating AWB...</p>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-hidden p-6 flex flex-col">
            <div className="flex-1 min-h-0">
              <DynamicTable
                data={orders}
                config={currentConfig}
                isLoading={loading}
                onSort={handleSort}
                onRowAction={handleRowAction}
                onSelectionChange={handleSelectionChange}
                getRowId={(row) => (row as FrontendOrder).id}
              />
            </div>

          {/* Pagination */}
          {pagination.total > pagination.offset && (
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
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

export default ForwardOrdersPage;