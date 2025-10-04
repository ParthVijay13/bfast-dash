"use client";
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '../../../../lib/hooks';
import { getSingleOrder, manifestOrders, clearCurrentOrder } from '../../../../lib/slices/orderSlice';
import { createPickupRequest } from '../../../../lib/slices/pickupSlice';
import OrderTracking from '../../../../components/OrderTracking';
import { ToastService } from '@/services/toast';

const ForwardOrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentOrder, loading, error, manifestLoading } = useAppSelector((state) => state.orders);
  const [isManifesting, setIsManifesting] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupData, setPickupData] = useState({
    pickup_date: '',
    pickup_time: '',
    pickup_seconds: '00',
    expected_package_count: ''
  });

  const orderId = params.id as string;
  console.log("Order ID from params:", orderId);

  useEffect(() => {
    if (orderId) {
      dispatch(getSingleOrder(orderId));
    }
  }, [orderId, dispatch]);
  useEffect(() => {
  if (showPickupModal) {
    document.body.classList.add('overflow-hidden');
  } else {
    document.body.classList.remove('overflow-hidden');
  }

  // Cleanup on component unmount
  return () => {
    document.body.classList.remove('overflow-hidden');
  };
}, [showPickupModal]);


  const handleGetAwb = async () => {
    if (!currentOrder) return;

    setIsManifesting(true);
    try {
      const result = await dispatch(manifestOrders({ order_ids: [currentOrder.id] })).unwrap();

      if (result.data.successful.length > 0) {
        dispatch(getSingleOrder(orderId));
        // alert('AWB generated successfully!');
        ToastService.success('AWB generated successfully!');
      } else if (result.data.failed.length > 0) {
        // alert(`Failed to generate AWB: ${result.data.failed[0].error}`);
        ToastService.error(`Failed to generate AWB: ${result.data.failed[0].error}`);
      }
    } catch (err: any) {
      // alert(`Error: ${err || 'Failed to generate AWB'}`);
      ToastService.error(`Error: ${err || 'Failed to generate AWB'}`);
    } finally {
      setIsManifesting(false);
    }
  };

  const handleAddToPickup = () => {
    setShowPickupModal(true);
  };

  const handleCreatePickup = async () => {
    console.log("Current Order:", currentOrder);

    if (!currentOrder?.pickup_address_id) {
      alert('Pickup address not found');
      return;
    }

    try {
      const formattedTime = `${pickupData.pickup_time}:${pickupData.pickup_seconds}`;

      await dispatch(createPickupRequest({
        pickup_address_id: currentOrder.pickup_address_id,
        pickup_date: pickupData.pickup_date,
        pickup_time: formattedTime,
        expected_package_count: pickupData.expected_package_count ? parseInt(pickupData.expected_package_count) : undefined
      })).unwrap();

      alert('Pickup request created successfully!');
      setShowPickupModal(false);
      router.push('/orders/pickup-requests');
    } catch (err: any) {
      alert(`Error creating pickup: ${err || 'Failed to create pickup request'}`);
    }
  };

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

              {currentOrder.status === 'PENDING' && (
                <button
                  onClick={handleGetAwb}
                  disabled={isManifesting || manifestLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isManifesting || manifestLoading ? 'Generating...' : 'Get AWB Number'}
                </button>
              )}

              {/* {currentOrder.status === 'MANIFESTED' && (
                <button
                  onClick={handleAddToPickup}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add to Pickup
                </button>
              )} */}
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Ordered On: {new Date(currentOrder.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Tracking */}
            <OrderTracking currentStatus={currentOrder.status} orderType="FORWARD" />
            {/* Package Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Package Details</h2>
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
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Details</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment Mode:</span>
                  <span className={`font-medium px-3 py-1 rounded-full text-sm ${
                    currentOrder.payment_mode === 'COD'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  }`}>
                    {currentOrder.payment_mode}
                  </span>
                </div>
                {currentOrder.payment_mode === 'COD' && currentOrder.cod_amount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">COD Amount:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{currentOrder.cod_amount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipment Mode:</span>
                  <span className="font-medium text-gray-900 dark:text-white">{currentOrder.shipment_mode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Delivery Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Delivery Details</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Consignee</h4>
                  <p className="text-gray-900 dark:text-white">{currentOrder.consignee_name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentOrder.consignee_phone}</p>
                  {currentOrder.consingee_email && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">{currentOrder.consingee_email}</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Delivery Address</h4>
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

            {/* Pickup Address */}
            {currentOrder.pickup_address && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex items-center mb-4">
                  <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Pickup Location</h2>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-gray-900 dark:text-white">{currentOrder.pickup_address.warehouse_name}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{currentOrder.pickup_address.pickup_address}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {currentOrder.pickup_address.pickup_city}, {currentOrder.pickup_address.pickup_state} {currentOrder.pickup_address.pickup_pincode}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{currentOrder.pickup_address.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Pickup Modal with Custom Date/Time Pickers */}
        {showPickupModal && (
          <div className="fixed inset-0 z-100 overflow-y-auto">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm transition-opacity"
              onClick={() => setShowPickupModal(false)}
            ></div>
            
            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                {/* Modal Header */}
                <div className="relative p-6 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Schedule Pickup
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Order: {currentOrder.order_id}
                      </p>
                    </div>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setShowPickupModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="px-6 pb-6 space-y-5">
                  {/* Pickup Date with Visual Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pickup Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={pickupData.pickup_date}
                        onChange={(e) => setPickupData({ ...pickupData, pickup_date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
                        style={{
                          colorScheme: 'light'
                        }}
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>
                    {pickupData.pickup_date && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {new Date(pickupData.pickup_date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>

                  {/* Pickup Time with Better UX */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pickup Time <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative">
                        <input
                          type="time"
                          value={pickupData.pickup_time}
                          onChange={(e) => setPickupData({ ...pickupData, pickup_time: e.target.value })}
                          className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
                          style={{
                            colorScheme: 'light'
                          }}
                          required
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="relative">
                        <select
                          value={pickupData.pickup_seconds}
                          onChange={(e) => setPickupData({ ...pickupData, pickup_seconds: e.target.value })}
                          className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white transition-all appearance-none cursor-pointer hover:border-blue-400 dark:hover:border-blue-500"
                        >
                          <option value="00">:00 sec</option>
                          <option value="15">:15 sec</option>
                          <option value="30">:30 sec</option>
                          <option value="45">:45 sec</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {pickupData.pickup_time && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Selected time: {pickupData.pickup_time}:{pickupData.pickup_seconds}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Click to select your preferred pickup time
                    </p>
                  </div>

                  {/* Expected Package Count with Better Styling */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expected Package Count
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <input
                        type="number"
                        value={pickupData.expected_package_count}
                        onChange={(e) => setPickupData({ ...pickupData, expected_package_count: e.target.value })}
                        placeholder="Enter count (optional)"
                        min="1"
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-400 transition-all hover:border-gray-400 dark:hover:border-gray-500"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      How many packages do you expect to ship?
                    </p>
                  </div>

                  {/* Info Box */}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                        Pickup Information
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Ensure someone is available at the pickup location during the scheduled time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl flex gap-3">
                  <button
                    onClick={() => setShowPickupModal(false)}
                    className="flex-1 px-5 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePickup}
                    disabled={!pickupData.pickup_date || !pickupData.pickup_time}
                    className="flex-1 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 transition-all font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Schedule Pickup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForwardOrderDetailPage;
