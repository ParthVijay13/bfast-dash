"use client";
import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { Address } from '../../types/address';
import { pincodeAPI } from '../../services/api';
import { ToastService, getErrorMessage, getSuccessMessage } from '../../services/toast';

interface AddPickupAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  initialData?: Address;
  title?: string;
}

const AddPickupAddressModal: React.FC<AddPickupAddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = 'Add Pickup Address',
}) => {
  const [formData, setFormData] = useState<Address>({
    warehouse_name: '',
    phone: '',
    email: '',
    pickup_address: '',
    pickup_city: '',
    pickup_pincode: '',
    pickup_state: '',
    pickup_country: 'India',
    return_address: '',
    return_city: '',
    return_state: '',
    return_pincode: '',
    return_country: 'India',
  });

  const [errors, setErrors] = useState<Partial<Address>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [returnPincodeLoading, setReturnPincodeLoading] = useState(false);
  const [returnAddressSame, setReturnAddressSame] = useState(true);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setReturnAddressSame(!initialData.return_address ||
        initialData.return_address === initialData.pickup_address);
    } else {
      setFormData({
        warehouse_name: '',
        phone: '',
        email: '',
        pickup_address: '',
        pickup_city: '',
        pickup_pincode: '',
        pickup_state: '',
        pickup_country: 'India',
        return_address: '',
        return_city: '',
        return_state: '',
        return_pincode: '',
        return_country: 'India',
      });
      setReturnAddressSame(true);
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Handle pincode change and auto-fill city/state
  const handlePincodeChange = async (pincode: string, type: 'pickup' | 'return') => {
    const field = type === 'pickup' ? 'pickup_pincode' : 'return_pincode';
    setFormData(prev => ({ ...prev, [field]: pincode }));

    if (pincode.length === 6) {
      if (type === 'pickup') {
        setPincodeLoading(true);
      } else {
        setReturnPincodeLoading(true);
      }

      try {
        const response = await pincodeAPI.checkServiceability(pincode);
        const serviceabilityData = response.data;

        if (type === 'pickup') {
          setFormData(prev => ({
            ...prev,
            pickup_city: serviceabilityData.city,
            pickup_state: serviceabilityData.state_code,
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            return_city: serviceabilityData.city,
            return_state: serviceabilityData.state_code,
          }));
        }

        // Clear pincode error if it exists
        setErrors(prev => ({ ...prev, [field]: undefined }));
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setErrors(prev => ({ ...prev, [field]: errorMessage }));
        ToastService.error(`${type === 'pickup' ? 'Pickup' : 'Return'} pincode validation failed: ${errorMessage}`);
      } finally {
        if (type === 'pickup') {
          setPincodeLoading(false);
        } else {
          setReturnPincodeLoading(false);
        }
      }
    } else if (pincode.length < 6) {
      // Clear city and state when pincode is incomplete
      if (type === 'pickup') {
        setFormData(prev => ({
          ...prev,
          pickup_city: '',
          pickup_state: '',
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          return_city: '',
          return_state: '',
        }));
      }
    }
  };

  const handleInputChange = (field: keyof Address, value: string) => {
    if (field === 'pickup_pincode') {
      handlePincodeChange(value, 'pickup');
    } else if (field === 'return_pincode') {
      handlePincodeChange(value, 'return');
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleReturnAddressSameChange = (isSame: boolean) => {
    setReturnAddressSame(isSame);
    if (isSame) {
      // Copy pickup address to return address
      setFormData(prev => ({
        ...prev,
        return_address: prev.pickup_address,
        return_city: prev.pickup_city,
        return_state: prev.pickup_state,
        return_pincode: prev.pickup_pincode,
        return_country: prev.pickup_country,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Address> = {};

    if (!formData.warehouse_name?.trim()) {
      newErrors.warehouse_name = 'Facility name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    // if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   newErrors.email = 'Please enter a valid email address';
    // }

    if (!formData.pickup_address.trim()) {
      newErrors.pickup_address = 'Address is required';
    }

    if (!formData.pickup_pincode.trim()) {
      newErrors.pickup_pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pickup_pincode)) {
      newErrors.pickup_pincode = 'Please enter a valid 6-digit pincode';
    }

    if (!formData.pickup_city.trim()) {
      newErrors.pickup_city = 'City is required';
    }

    if (!formData.pickup_state.trim()) {
      newErrors.pickup_state = 'State is required';
    }

    // Validate return address if not same as pickup
    if (!returnAddressSame) {
      if (!formData.return_address?.trim()) {
        newErrors.return_address = 'Return address is required';
      }
      if (!formData.return_pincode?.trim()) {
        newErrors.return_pincode = 'Return pincode is required';
      } else if (!/^\d{6}$/.test(formData.return_pincode)) {
        newErrors.return_pincode = 'Please enter a valid 6-digit return pincode';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // If return address is same as pickup, copy the data
      const finalData = returnAddressSame ? {
        ...formData,
        return_address: formData.pickup_address,
        return_city: formData.pickup_city,
        return_state: formData.pickup_state,
        return_pincode: formData.pickup_pincode,
        return_country: formData.pickup_country,
      } : formData;

      const result = await onSave(finalData);
      const successMessage = getSuccessMessage(result, 'Pickup address added successfully!');
      ToastService.success(successMessage);
      onClose();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      ToastService.error(errorMessage);
      console.error('Error saving pickup address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      warehouse_name: '',
      phone: '',
      email: '',
      pickup_address: '',
      pickup_city: '',
      pickup_pincode: '',
      pickup_state: '',
      pickup_country: 'India',
      return_address: '',
      return_city: '',
      return_state: '',
      return_pincode: '',
      return_country: 'India',
    });
    setErrors({});
    setReturnAddressSame(true);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Pickup Address Header */}
        <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900 dark:text-white">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Pickup Address Details</span>
        </div>

        {/* Facility Name */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Facility Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.warehouse_name}
            onChange={(e) => handleInputChange('warehouse_name', e.target.value)}
            placeholder="Enter facility name"
            className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
              errors.warehouse_name
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
            }`}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Please note that facility name cannot be edited after saving
          </p>
          {errors.warehouse_name && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.warehouse_name}
            </p>
          )}
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter email address"
              className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
                errors.email
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pickup Location Contact <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-lg border-2 border-r-0 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 text-sm font-medium">
                +91
              </span>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter 10-digit mobile number"
                maxLength={10}
                className={`flex-1 px-4 py-3 border-2 rounded-r-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
                  errors.phone
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Address Line <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.pickup_address}
            onChange={(e) => handleInputChange('pickup_address', e.target.value)}
            placeholder="Street address, building name, floor"
            className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
              errors.pickup_address
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
            }`}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            This will be used in the invoices that you will print
          </p>
          {errors.pickup_address && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.pickup_address}
            </p>
          )}
        </div>

        {/* Location Fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Pincode <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.pickup_pincode}
                onChange={(e) => handleInputChange('pickup_pincode', e.target.value)}
                placeholder="6-digit pincode"
                maxLength={6}
                className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
                  errors.pickup_pincode
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
                }`}
              />
              {pincodeLoading && (
                <div className="absolute right-3 top-3.5">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {errors.pickup_pincode && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.pickup_pincode}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pickup_city}
              disabled={formData.pickup_pincode.length === 6}
              onChange={(e) => handleInputChange('pickup_city', e.target.value)}
              placeholder="City name"
              className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:text-white ${
                formData.pickup_pincode.length === 6
                  ? 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                  : 'dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
              } ${errors.pickup_city ? 'border-red-500' : ''}`}
            />
            {errors.pickup_city && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.pickup_city}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.pickup_state}
              disabled={formData.pickup_pincode.length === 6}
              onChange={(e) => handleInputChange('pickup_state', e.target.value)}
              placeholder="State name"
              className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:text-white ${
                formData.pickup_pincode.length === 6
                  ? 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                  : 'dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
              } ${errors.pickup_state ? 'border-red-500' : ''}`}
            />
            {errors.pickup_state && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.pickup_state}
              </p>
            )}
          </div>
        </div>

        {/* Return Address Toggle */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="returnAddressSame"
              checked={returnAddressSame}
              onChange={(e) => handleReturnAddressSameChange(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-300 rounded transition-colors"
            />
            <label
              htmlFor="returnAddressSame"
              className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Return address is the same as pickup address
            </label>
          </div>
        </div>

        {/* Return Address Fields */}
        {!returnAddressSame && (
          <div className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Return Address Details
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Address Line <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.return_address || ''}
                onChange={(e) => handleInputChange('return_address', e.target.value)}
                placeholder="Street address, building name, floor"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-colors dark:bg-gray-700 dark:text-white"
              />
              {errors.return_address && (
                <p className="text-red-500 text-sm mt-2 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.return_address}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.return_pincode || ''}
                    onChange={(e) => handleInputChange('return_pincode', e.target.value)}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-colors dark:bg-gray-700 dark:text-white"
                  />
                  {returnPincodeLoading && (
                    <div className="absolute right-3 top-3.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                {errors.return_pincode && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.return_pincode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.return_city || ''}
                  disabled={formData.return_pincode?.length === 6}
                  onChange={(e) => handleInputChange('return_city', e.target.value)}
                  placeholder="City name"
                  className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:text-white ${
                    formData.return_pincode?.length === 6
                      ? 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                      : 'dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.return_state || ''}
                  disabled={formData.return_pincode?.length === 6}
                  onChange={(e) => handleInputChange('return_state', e.target.value)}
                  placeholder="State name"
                  className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:text-white ${
                    formData.return_pincode?.length === 6
                      ? 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                      : 'dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
                  }`}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 border border-transparent rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg transition-all"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Add Pickup Address</span>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddPickupAddressModal;