"use client";
import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../../lib/hooks';
import { getSingleOrder, clearCurrentOrder } from '../../../../lib/slices/orderSlice';
import OrderTracking from '../../../../components/OrderTracking';

const ReverseOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentOrder, loading, error } = useAppSelector((state) => state.orders);

  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      dispatch(getSingleOrder(orderId));
    }

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [orderId, dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 dark:text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!currentOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600 dark:text-gray-400">Order not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </button>
        </div>

        {/* Order Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {currentOrder.order_id}
              </h1>
              {currentOrder.awb_number && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  AWB: {currentOrder.awb_number}
                </p>
              )}
              <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-sm font-medium rounded-full">
                Reverse Order
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                currentOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                currentOrder.status === 'MANIFESTED' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                currentOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                currentOrder.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              }`}>
                {currentOrder.status}
              </span>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Initiated On: {new Date(currentOrder.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Tracking */}
            <OrderTracking currentStatus={currentOrder.status} orderType="REVERSE" />
            {/* Package Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Return Package Details</h2>
              </div>
              <div className="space-y-4">
                {currentOrder.order_items && currentOrder.order_items.length > 0 ? (
                  currentOrder.order_items.map((item, index) => (
                    <div key={item.id || index} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-white">{item.item_name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {item.sku_code}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Category: {item.category}</p>
                          {item.is_fragile && (
                            <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs rounded">
                              Fragile
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">₹{item.price}</p>
                          {item.discount && <p className="text-sm text-green-600">-₹{item.discount}</p>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">No items found</p>
                )}

                {/* Package Dimensions */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Package Dimensions</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Weight:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{currentOrder.package_weight || 'N/A'} kg</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {currentOrder.package_length && currentOrder.package_breadth && currentOrder.package_height
                          ? `${currentOrder.package_length} × ${currentOrder.package_breadth} × ${currentOrder.package_height} cm`
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Shipment Details</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment Mode:</span>
                  <span className="font-medium px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {currentOrder.payment_mode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipment Mode:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{currentOrder.shipment_mode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pickup Address (Customer's location) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pickup From</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Customer</h4>
                  <p className="text-gray-900 dark:text-white">{currentOrder.consignee_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentOrder.consignee_phone}</p>
                  {currentOrder.consingee_email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{currentOrder.consingee_email}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Pickup Address</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {currentOrder.consignee_address_line_1}
                    {currentOrder.consignee_address_line_2 && `, ${currentOrder.consignee_address_line_2}`}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {currentOrder.consignee_city}, {currentOrder.consignee_state} {currentOrder.consignee_pincode}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{currentOrder.consignee_country}</p>
                </div>
              </div>
            </div>

            {/* Return Address */}
            {currentOrder.pickup_address && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Return To</h2>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white">{currentOrder.pickup_address.warehouse_name}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{currentOrder.pickup_address.return_address}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {currentOrder.pickup_address.return_city}, {currentOrder.pickup_address.return_state} {currentOrder.pickup_address.return_pincode}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentOrder.pickup_address.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReverseOrderDetailPage;
