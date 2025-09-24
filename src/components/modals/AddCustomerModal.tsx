"use client";
import React, { useState, useEffect } from 'react';
import BaseModal from './BaseModal';
import { Customer } from '../../types/address';
import { pincodeAPI } from '../../services/api';
import { ToastService, getErrorMessage, getSuccessMessage } from '../../services/toast';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer) => void;
  initialData?: Customer;
  title?: string;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  title = 'Add Customer',
}) => {
  const [formData, setFormData] = useState<Customer>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    billingAddress: {
      address1: '',
      address2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  });

  const [errors, setErrors] = useState<Partial<Customer>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [billingPincodeLoading, setBillingPincodeLoading] = useState(false);
  const [billingAddressSame, setBillingAddressSame] = useState(true);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setBillingAddressSame(!initialData.billingAddress);
    } else {
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
        billingAddress: {
          address1: '',
          address2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
        },
      });
      setBillingAddressSame(true);
    }
    setErrors({});
  }, [initialData, isOpen]);

  // Handle pincode change and auto-fill city/state
  const handlePincodeChange = async (pincode: string, type: 'shipping' | 'billing' = 'shipping') => {
    if (type === 'shipping') {
      setFormData(prev => ({ ...prev, pincode }));

      if (pincode.length === 6) {
        setPincodeLoading(true);
        try {
          const response = await pincodeAPI.checkServiceability(pincode);
          const serviceabilityData = response.data;

          setFormData(prev => ({
            ...prev,
            city: serviceabilityData.city,
            state: serviceabilityData.state_code,
          }));

          // Clear pincode error if it exists
          setErrors(prev => ({ ...prev, pincode: undefined }));
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          setErrors(prev => ({ ...prev, pincode: errorMessage }));
          ToastService.error(`Pincode validation failed: ${errorMessage}`);
        } finally {
          setPincodeLoading(false);
        }
      } else if (pincode.length < 6) {
        // Clear city and state when pincode is incomplete
        setFormData(prev => ({
          ...prev,
          city: '',
          state: '',
        }));
      }
    } else {
      // Billing address pincode
      setFormData(prev => ({
        ...prev,
        billingAddress: { ...prev.billingAddress!, pincode }
      }));

      if (pincode.length === 6) {
        setBillingPincodeLoading(true);
        try {
          const response = await pincodeAPI.checkServiceability(pincode);
          const serviceabilityData = response.data;

          setFormData(prev => ({
            ...prev,
            billingAddress: {
              ...prev.billingAddress!,
              city: serviceabilityData.city,
              state: serviceabilityData.state_code,
            }
          }));
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          ToastService.error(`Billing pincode validation failed: ${errorMessage}`);
        } finally {
          setBillingPincodeLoading(false);
        }
      } else if (pincode.length < 6) {
        // Clear billing city and state when pincode is incomplete
        setFormData(prev => ({
          ...prev,
          billingAddress: {
            ...prev.billingAddress!,
            city: '',
            state: '',
          }
        }));
      }
    }
  };

  const handleInputChange = (field: keyof Customer | string, value: string) => {
    if (field === 'pincode') {
      handlePincodeChange(value, 'shipping');
    } else if (field.startsWith('billing.')) {
      const billingField = field.replace('billing.', '');
      if (billingField === 'pincode') {
        handlePincodeChange(value, 'billing');
      } else {
        setFormData(prev => ({
          ...prev,
          billingAddress: { ...prev.billingAddress!, [billingField]: value }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Clear error for this field
    if (errors[field as keyof Customer]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBillingAddressSameChange = (isSame: boolean) => {
    setBillingAddressSame(isSame);
    if (isSame) {
      // Copy shipping address to billing address
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          address1: prev.address1,
          address2: prev.address2 || '',
          city: prev.city,
          state: prev.state,
          pincode: prev.pincode,
          country: prev.country,
        }
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Customer> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.address1.trim()) {
      newErrors.address1 = 'Address is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    // Validate billing address if not same as shipping
    if (!billingAddressSame && formData.billingAddress) {
      if (!formData.billingAddress.address1.trim()) {
        newErrors.address1 = 'Billing address is required';
      }
      if (!formData.billingAddress.pincode.trim()) {
        newErrors.pincode = 'Billing pincode is required';
      } else if (!/^\d{6}$/.test(formData.billingAddress.pincode)) {
        newErrors.pincode = 'Please enter a valid 6-digit billing pincode';
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
      // If billing address is same as shipping, copy the data
      const finalData = billingAddressSame ? {
        ...formData,
        billingAddress: {
          address1: formData.address1,
          address2: formData.address2 || '',
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        }
      } : formData;

      const result = await onSave(finalData);
      const successMessage = getSuccessMessage(result, 'Customer added successfully!');
      ToastService.success(successMessage);
      onClose();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      ToastService.error(errorMessage);
      console.error('Error saving customer:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      billingAddress: {
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
    });
    setErrors({});
    setBillingAddressSame(true);
    onClose();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add customer and address details
        </p>

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="Enter first name"
              className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
                errors.firstName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.firstName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Enter last name"
              className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
                errors.lastName
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.lastName}
              </p>
            )}
          </div>
        </div>

        {/* Contact Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email
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
              Phone Number <span className="text-red-500">*</span>
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

        {/* Shipping Address Header */}
        <div className="flex items-center space-x-2 pt-4">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Shipping Address
          </h3>
        </div>

        {/* Address Fields */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Address Line 1 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.address1}
            onChange={(e) => handleInputChange('address1', e.target.value)}
            placeholder="Street address, building name, floor"
            className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
              errors.address1
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
            }`}
          />
          {errors.address1 && (
            <p className="text-red-500 text-sm mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.address1}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={formData.address2}
            onChange={(e) => handleInputChange('address2', e.target.value)}
            placeholder="Apartment, suite, unit, etc."
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-colors dark:bg-gray-700 dark:text-white"
          />
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
                value={formData.pincode}
                onChange={(e) => handleInputChange('pincode', e.target.value)}
                placeholder="6-digit pincode"
                maxLength={6}
                className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:bg-gray-700 dark:text-white ${
                  errors.pincode
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
            {errors.pincode && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.pincode}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              disabled={formData.pincode.length === 6}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="City name"
              className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:text-white ${
                formData.pincode.length === 6
                  ? 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                  : 'dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
              } ${errors.city ? 'border-red-500' : ''}`}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.city}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.state}
              disabled={formData.pincode.length === 6}
              onChange={(e) => handleInputChange('state', e.target.value)}
              placeholder="State name"
              className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:text-white ${
                formData.pincode.length === 6
                  ? 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 cursor-not-allowed'
                  : 'dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 hover:border-gray-300'
              } ${errors.state ? 'border-red-500' : ''}`}
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.state}
              </p>
            )}
          </div>
        </div>

        {/* Billing Address Toggle */}
        <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="billingAddressSame"
              checked={billingAddressSame}
              onChange={(e) => handleBillingAddressSameChange(e.target.checked)}
              className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-2 border-gray-300 rounded transition-colors"
            />
            <label
              htmlFor="billingAddressSame"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Billing address same as shipping address
            </label>
          </div>
        </div>

        {/* Billing Address Fields */}
        {!billingAddressSame && (
          <div className="space-y-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Billing Address
              </h3>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.billingAddress?.address1 || ''}
                onChange={(e) => handleInputChange('billing.address1', e.target.value)}
                placeholder="Street address, building name, floor"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-colors dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Address Line 2 <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.billingAddress?.address2 || ''}
                onChange={(e) => handleInputChange('billing.address2', e.target.value)}
                placeholder="Apartment, suite, unit, etc."
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-colors dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.billingAddress?.pincode || ''}
                    onChange={(e) => handleInputChange('billing.pincode', e.target.value)}
                    placeholder="6-digit pincode"
                    maxLength={6}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 transition-colors dark:bg-gray-700 dark:text-white"
                  />
                  {billingPincodeLoading && (
                    <div className="absolute right-3 top-3.5">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.billingAddress?.city || ''}
                  disabled={formData.billingAddress?.pincode?.length === 6}
                  onChange={(e) => handleInputChange('billing.city', e.target.value)}
                  placeholder="City name"
                  className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:text-white ${
                    formData.billingAddress?.pincode?.length === 6
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
                  value={formData.billingAddress?.state || ''}
                  disabled={formData.billingAddress?.pincode?.length === 6}
                  onChange={(e) => handleInputChange('billing.state', e.target.value)}
                  placeholder="State name"
                  className={`w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors dark:text-white ${
                    formData.billingAddress?.pincode?.length === 6
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
              <span>Add Customer</span>
            )}
          </button>
        </div>
      </form>
    </BaseModal>
  );
};

export default AddCustomerModal;