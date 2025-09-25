"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, SaveIcon } from '../../../../icons';
import AddCustomerModal from '../../../../components/modals/AddCustomerModal';
import AddPickupAddressModal from '../../../../components/modals/AddPickupAddressModal';
import AddItemDetailsModal from '../../../../components/modals/AddItemDetailsModal';
import { Customer, Address, ItemDetails } from '../../../../types/address';
import { warehouseAPI } from '../../../../services/api';
import { ToastService, getErrorMessage } from '../../../../services/toast';
import { useAppDispatch, useAppSelector } from '../../../../lib/hooks';
import { createForwardOrder, clearError, CreateOrderRequest } from '../../../../lib/slices/orderSlice';

interface OrderFormData {
  // Order Details
  orderId: string;
  channel: string;

  // Customer Details
  customer?: Customer;

  // Pickup Details
  pickupAddress?: Address;

  // Delivery Details
  deliveryAddress?: Customer;

  // Items
  items: ItemDetails[];

  // Physical Properties
  packageWeight: string;
  packageLength: string;
  packageBreadth: string;
  packageHeight: string;

  // Order Settings
  paymentMode: 'prepaid' | 'cod';
  transportMode: 'surface' | 'air';
  declaredValue: string;
  codAmount: string;
  instructions: string;
}

const CreateForwardOrderPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.orders);

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);

  // Pickup addresses for channel selection
  const [savedPickupAddresses, setSavedPickupAddresses] = useState<Address[]>([]);
  const [displayedAddresses, setDisplayedAddresses] = useState<Address[]>([]);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [isChannelOpen, setIsChannelOpen] = useState(false);
  const channelWrapRef = React.useRef<HTMLDivElement | null>(null);

// Close on outside click
useEffect(() => {
  function onDocClick(e: MouseEvent) {
    if (!channelWrapRef.current) return;
    if (!channelWrapRef.current.contains(e.target as Node)) {
      setIsChannelOpen(false);
    }
  }
  document.addEventListener('mousedown', onDocClick);
  return () => document.removeEventListener('mousedown', onDocClick);
}, []);

// Close on Escape
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') setIsChannelOpen(false);
  }
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}, []);

useEffect(() => {
  function onDocClick(e: MouseEvent) {
    if (!channelWrapRef.current) return;
    if (!channelWrapRef.current.contains(e.target as Node)) {
      setIsChannelOpen(false);
    }
  }
  document.addEventListener('mousedown', onDocClick);
  return () => document.removeEventListener('mousedown', onDocClick);
}, []);

// Close on Escape
useEffect(() => {
  function onKey(e: KeyboardEvent) {
    if (e.key === 'Escape') setIsChannelOpen(false);
  }
  document.addEventListener('keydown', onKey);
  return () => document.removeEventListener('keydown', onKey);
}, []);


  const ADDRESSES_PER_PAGE = 5;

  // Form data state
  const [formData, setFormData] = useState<OrderFormData>({
    orderId: '',
    channel: '',
    customer: undefined,
    pickupAddress: undefined,
    deliveryAddress: undefined,
    items: [],
    packageWeight: '',
    packageLength: '',
    packageBreadth: '',
    packageHeight: '',
    paymentMode: 'prepaid',
    transportMode: 'surface',
    declaredValue: '',
    codAmount: '',
    instructions: ''
  });

  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  // Clear error when component mounts
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Load saved pickup addresses on mount
  useEffect(() => {
    const loadPickupAddresses = async () => {
      try {
        const response = await warehouseAPI.getWarehouses();
        setSavedPickupAddresses(response.data || []);
      } catch (error) {
        console.error('Error loading pickup addresses:', error);
        ToastService.error('Failed to load pickup addresses');
      }
    };
    loadPickupAddresses();
  }, []);

  // Update displayed addresses when savedPickupAddresses changes
  useEffect(() => {
    if (showAllAddresses) {
      setDisplayedAddresses(savedPickupAddresses);
    } else {
      setDisplayedAddresses(savedPickupAddresses.slice(0, ADDRESSES_PER_PAGE));
    }
  }, [savedPickupAddresses, showAllAddresses]);

  // Handle customer save
  const handleCustomerSave = (customer: Customer) => {
    setFormData(prev => ({ ...prev, customer }));
    setShowCustomerModal(false);
  };

  // Handle pickup address save
  const handlePickupAddressSave = async (address: Address) => {
    const loadingToast = ToastService.loading('Saving pickup address...');
    try {
      // Save to backend if it's a new address
      if (!address.id) {
        const response = await warehouseAPI.createWarehouse(address);
        address = response.data;
        // Add to saved addresses list
        setSavedPickupAddresses(prev => [...prev, address]);
        ToastService.dismiss(loadingToast);
        ToastService.success('Pickup address saved successfully');
      }
      setFormData(prev => ({ ...prev, pickupAddress: address }));
      setShowPickupModal(false);
    } catch (error) {
      console.error('Error saving pickup address:', error);
      ToastService.dismiss(loadingToast);
      ToastService.error(getErrorMessage(error));
    }
  };


  // Handle item save
  const handleItemSave = (item: ItemDetails) => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { ...item, id: Date.now().toString() }]
    }));
    setShowItemModal(false);
  };

  // Remove item
  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  // Handle input change
  const handleInputChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // If channel is selected, automatically set the pickup address
      if (field === 'channel' && value) {
        const selectedAddress = savedPickupAddresses.find(addr => addr.id === value);
        if (selectedAddress) {
          newData.pickupAddress = selectedAddress;
        }
      }

      return newData;
    });

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Also clear pickup address error if channel is selected
    if (field === 'channel' && value && formErrors.pickupAddress) {
      setFormErrors(prev => ({ ...prev, pickupAddress: '' }));
    }
  };

  // Transform form data to backend format
  const transformFormDataToBackend = (): CreateOrderRequest => {
    if (!formData.customer || !formData.pickupAddress) {
      throw new Error('Missing required customer or pickup address data');
    }

    return {
      order_id: formData.orderId.trim(),
      consignee_name: `${formData.customer.firstName} ${formData.customer.lastName}`.trim(),
      consignee_phone: formData.customer.phone,
      consingee_email: formData.customer.email || undefined,
      consignee_address_line_1: formData.customer.address1,
      consignee_address_line_2: formData.customer.address2 || undefined,
      consignee_state: formData.customer.state,
      consignee_city: formData.customer.city,
      consignee_country: formData.customer.country || 'IN',
      consignee_pincode: formData.customer.pincode,
      same_billing_shipping: true,
      billing_address_line_1: formData.customer.address1,
      billing_address_line_2: formData.customer.address2 || undefined,
      billing_state: formData.customer.state,
      billing_city: formData.customer.city,
      billing_country: formData.customer.country || 'IN',
      billing_pincode: formData.customer.pincode,
      package_weight: formData.packageWeight ? parseFloat(formData.packageWeight) : undefined,
      package_length: formData.packageLength ? parseFloat(formData.packageLength) : undefined,
      package_breadth: formData.packageBreadth ? parseFloat(formData.packageBreadth) : undefined,
      package_height: formData.packageHeight ? parseFloat(formData.packageHeight) : undefined,
      payment_mode: formData.paymentMode.toUpperCase(),
      cod_amount: formData.paymentMode === 'cod' && formData.codAmount ? parseFloat(formData.codAmount) : undefined,
      shipment_mode: formData.transportMode.toUpperCase(),
      order_items: formData.items.map(item => ({
        item_name: item.name,
        sku_code: item.sku || '',
        category: item.category,
        product_image: undefined,
        price: parseFloat(String(item.price || '0')) || 0,
        discount: item.discount ? parseFloat(String(item.discount)) : undefined,
        is_fragile: false,
      })),
      pickup_address_id: formData.pickupAddress.id!,
    };
  };

  // Validate form data
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.orderId.trim()) {
      errors.orderId = 'Order ID is required';
    }
    if (!formData.channel.trim()) {
      errors.channel = 'Channel selection is required';
    }
    if (!formData.customer) {
      errors.customer = 'Customer details are required';
    }
    if (!formData.pickupAddress) {
      errors.pickupAddress = 'Pickup address is required';
    }
    if (formData.items.length === 0) {
      errors.items = 'At least one item is required';
    }
    if (formData.paymentMode === 'cod' && (!formData.codAmount || parseFloat(formData.codAmount) <= 0)) {
      errors.codAmount = 'COD amount is required for COD orders';
    }

    return errors;
  };

  // Handle create order without manifest
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      ToastService.error('Please fill in all required fields');
      return;
    }

    try {
      const backendData = transformFormDataToBackend();
      const resultAction = await dispatch(createForwardOrder({
        orderData: backendData,
        manifest: false
      }));

      if (createForwardOrder.fulfilled.match(resultAction)) {
        ToastService.success('Order created successfully!');
        router.push('/orders/forward');
      } else {
        ToastService.error(resultAction.payload as string || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      ToastService.error(getErrorMessage(error));
    }
  };

  // Handle create order and get AWB (with manifest)
  const handleCreateOrderAndGetAWB = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      ToastService.error('Please fill in all required fields');
      return;
    }

    try {
      const backendData = transformFormDataToBackend();
      const resultAction = await dispatch(createForwardOrder({
        orderData: backendData,
        manifest: true
      }));

      if (createForwardOrder.fulfilled.match(resultAction)) {
        ToastService.success('Order created and manifested successfully!');
        router.push('/orders/forward');
      } else {
        ToastService.error(resultAction.payload as string || 'Failed to create and manifest order');
      }
    } catch (error) {
      console.error('Error creating and manifesting order:', error);
      ToastService.error(getErrorMessage(error));
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Create Forward Order
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Fill in the details to create a new forward shipment
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleCreateOrder} className="max-w-8xl mx-auto p-6 space-y-8">
        {/* Order Details Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-6">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Order Details
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div ref={channelWrapRef}>
  <div className="flex items-center justify-between mb-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      Select Channel
      <svg className="w-4 h-4 text-gray-400 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    </label>
  </div>

  {/* Click to toggle */}
  <div className="relative">
    <button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={isChannelOpen}
      onClick={() => setIsChannelOpen(v => !v)}
      className={`w-full px-3 py-2 pr-10 text-left border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
        formErrors.channel ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      }`}
    >
      <span>
        {formData.channel
          ? (savedPickupAddresses.find(addr => addr.id === formData.channel)?.warehouse_name || '')
          : 'Select Channel'}
      </span>
      <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg className={`w-5 h-5 text-gray-400 transition-transform ${isChannelOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </span>
    </button>

    {/* Options (render only when open) */}
    {isChannelOpen && (
      <div
        role="listbox"
        tabIndex={-1}
        className="absolute z-20 mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 max-h-60 overflow-y-auto shadow-lg"
      >
        <div className="p-2">
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">Default Channel</div>

          {displayedAddresses.map((address) => (
            <div
              key={address.id}
              role="option"
              aria-selected={formData.channel === address.id}
              onClick={() => {
                handleInputChange('channel', address.id!);
                setIsChannelOpen(false);
              }}
              className={`p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                formData.channel === address.id
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="font-medium">{address.warehouse_name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{address.pickup_city}</div>
            </div>
          ))}

          {savedPickupAddresses.length > ADDRESSES_PER_PAGE && !showAllAddresses && (
            <button
              type="button"
              onClick={() => setShowAllAddresses(true)}
              className="w-full p-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-center"
            >
              load more
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setShowPickupModal(true);
              setIsChannelOpen(false);
            }}
            className="w-full p-2 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-left flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Channel
          </button>
        </div>
      </div>
    )}
  </div>

  {formErrors.channel && (
    <p className="text-red-500 text-sm mt-1">{formErrors.channel}</p>
  )}
</div>


            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.orderId}
                onChange={(e) => handleInputChange('orderId', e.target.value)}
                placeholder="Enter Order ID"
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  formErrors.orderId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              {formErrors.orderId && (
                <p className="text-red-500 text-sm mt-1">{formErrors.orderId}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                It is a unique identifier for your orders that will be mentioned in waybill slips.
              </p>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Customer Details
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowCustomerModal(true)}
              className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Add Customer
            </button>
          </div>

          {formData.customer ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.customer.firstName} {formData.customer.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.customer.email}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    +91 {formData.customer.phone}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formData.customer.address1}, {formData.customer.city}, {formData.customer.state} - {formData.customer.pincode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No customer added yet</p>
              <button
                type="button"
                onClick={() => setShowCustomerModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Add Customer Details
              </button>
            </div>
          )}
        </div>



        {/* Items Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Item Details
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowItemModal(true)}
              className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md hover:bg-orange-100 dark:hover:bg-orange-900/30 focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              + Add Box
            </button>
          </div>

          {formData.items.length > 0 ? (
            <div className="space-y-4">
              {formData.items.map((item) => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </p>
                        <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                          {item.category}
                        </span>
                      </div>
                      {item.sku && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          SKU: {item.sku}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Price: ₹{item.price} | Qty: {item.quantity}
                      </p>
                      {(item.weight || item.length || item.breadth || item.height) && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Dimensions: {item.weight}kg, {item.length}×{item.breadth}×{item.height} cm
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id!)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No items added yet</p>
              <button
                type="button"
                onClick={() => setShowItemModal(true)}
                className="mt-2 text-orange-600 hover:text-orange-800"
              >
                Add Item Details
              </button>
            </div>
          )}
        </div>

        {/* Physical Properties */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-6">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Package Dimensions
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.packageWeight}
                onChange={(e) => handleInputChange('packageWeight', e.target.value)}
                placeholder="0.5"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Length (cm)
              </label>
              <input
                type="number"
                value={formData.packageLength}
                onChange={(e) => handleInputChange('packageLength', e.target.value)}
                placeholder="10"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Width (cm)
              </label>
              <input
                type="number"
                value={formData.packageBreadth}
                onChange={(e) => handleInputChange('packageBreadth', e.target.value)}
                placeholder="10"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Height (cm)
              </label>
              <input
                type="number"
                value={formData.packageHeight}
                onChange={(e) => handleInputChange('packageHeight', e.target.value)}
                placeholder="5"
                min="0"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Order Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Order Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Mode *
              </label>
              <select
                required
                value={formData.paymentMode}
                onChange={(e) => handleInputChange('paymentMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="prepaid">Prepaid</option>
                <option value="cod">Cash on Delivery</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transport Mode *
              </label>
              <select
                required
                value={formData.transportMode}
                onChange={(e) => handleInputChange('transportMode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="surface">Surface</option>
                <option value="air">Air</option>
              </select>
            </div>
           
            {formData.paymentMode === 'cod' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  COD Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.codAmount}
                  onChange={(e) => handleInputChange('codAmount', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    formErrors.codAmount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {formErrors.codAmount && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.codAmount}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Special Instructions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Special Instructions
          </h2>
          <textarea
            rows={4}
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            placeholder="Any special handling instructions..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreateOrder}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <SaveIcon className="w-4 h-4" />
                <span>Create Order</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCreateOrderAndGetAWB}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <SaveIcon className="w-4 h-4" />
                <span>Create Order and Get AWB</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modals */}
      <AddCustomerModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onSave={handleCustomerSave}
        initialData={formData.customer}
      />

      <AddPickupAddressModal
        isOpen={showPickupModal}
        onClose={() => setShowPickupModal(false)}
        onSave={handlePickupAddressSave}
        initialData={formData.pickupAddress}
      />


      <AddItemDetailsModal
        isOpen={showItemModal}
        onClose={() => setShowItemModal(false)}
        onSave={handleItemSave}
      />
    </div>
  );
};

export default CreateForwardOrderPage;