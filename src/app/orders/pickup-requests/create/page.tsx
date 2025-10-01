"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '../../../../icons';
import { Address } from '../../../../types/address';
import { warehouseAPI } from '../../../../services/api';
import { ToastService, getErrorMessage } from '../../../../services/toast';
import { useAppDispatch, useAppSelector } from '../../../../lib/hooks';
import { createPickupRequest, clearError } from '../../../../lib/slices/pickupSlice';

interface PickupFormData {
  pickup_address_id: string;
  pickup_date: string;
  pickup_time: string;
  expected_package_count: string;
}

interface TimeInput {
  hours: string;
  minutes: string;
  seconds: string;
}

const CreatePickupRequestPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.pickup);

  const [savedPickupAddresses, setSavedPickupAddresses] = useState<Address[]>([]);
  const [displayedAddresses, setDisplayedAddresses] = useState<Address[]>([]);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const locationWrapRef = useRef<HTMLDivElement | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [availableDates, setAvailableDates] = useState<Array<{ date: Date; label: string; dayName: string }>>([]);
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);

  const ADDRESSES_PER_PAGE = 5;

  const [timeInput, setTimeInput] = useState<TimeInput>({
    hours: '14',
    minutes: '00',
    seconds: '00'
  });

  const [formData, setFormData] = useState<PickupFormData>({
    pickup_address_id: '',
    pickup_date: '',
    pickup_time: '14:00:00',
    expected_package_count: ''
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

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

  // Update displayed addresses
  useEffect(() => {
    if (showAllAddresses) {
      setDisplayedAddresses(savedPickupAddresses);
    } else {
      setDisplayedAddresses(savedPickupAddresses.slice(0, ADDRESSES_PER_PAGE));
    }
  }, [savedPickupAddresses, showAllAddresses]);

  // Calculate available dates based on current time
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const dates: Array<{ date: Date; label: string; dayName: string }> = [];

    // If current time is past 2 PM (14:00), start from tomorrow
    const startDay = currentHour >= 14 ? 1 : 0;

    for (let i = startDay; i < startDay + 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);

      let label = '';
      if (i === 0 && startDay === 0) {
        label = 'Today';
      } else if (i === 1 || (i === startDay && startDay === 1)) {
        label = 'Tomorrow';
      } else {
        label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

      dates.push({ date, label, dayName });
    }

    setAvailableDates(dates);

    // Set the first available date
    if (dates.length > 0) {
      const firstDate = dates[0].date;
      const formattedDate = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, '0')}-${String(firstDate.getDate()).padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, pickup_date: formattedDate }));
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!locationWrapRef.current) return;
      if (!locationWrapRef.current.contains(e.target as Node)) {
        setIsLocationOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsLocationOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const handleLocationSelect = (address: Address) => {
    setSelectedAddress(address);
    setFormData(prev => ({ ...prev, pickup_address_id: address.id! }));
    setIsLocationOpen(false);
    if (formErrors.pickup_address_id) {
      setFormErrors(prev => ({ ...prev, pickup_address_id: '' }));
    }
  };

  const handleDateSelect = (index: number) => {
    setSelectedDateIndex(index);
    const selectedDate = availableDates[index].date;
    const formattedDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, pickup_date: formattedDate }));
  };

  const handleTimeInputChange = (field: keyof TimeInput, value: string) => {
    // Only allow numeric input
    if (value && !/^\d*$/.test(value)) return;

    let numValue = value === '' ? 0 : parseInt(value, 10);
    let finalValue = value;

    // Validate based on field
    if (field === 'hours') {
      if (numValue > 23) return;
      finalValue = value;
    } else if (field === 'minutes' || field === 'seconds') {
      if (numValue > 59) return;
      finalValue = value;
    }

    // Update time input state
    const newTimeInput = { ...timeInput, [field]: finalValue };
    setTimeInput(newTimeInput);

    // Format and update the pickup_time in formData
    const hours = (newTimeInput.hours || '00').padStart(2, '0');
    const minutes = (newTimeInput.minutes || '00').padStart(2, '0');
    const seconds = (newTimeInput.seconds || '00').padStart(2, '0');
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    setFormData(prev => ({ ...prev, pickup_time: formattedTime }));

    // Clear error if exists
    if (formErrors.pickup_time) {
      setFormErrors(prev => ({ ...prev, pickup_time: '' }));
    }
  };

  const handleTimeInputBlur = (field: keyof TimeInput) => {
    // Pad with zero on blur if not empty
    if (timeInput[field] !== '') {
      const paddedValue = timeInput[field].padStart(2, '0');
      setTimeInput(prev => ({ ...prev, [field]: paddedValue }));
    }
  };

  const handleInputChange = (field: keyof PickupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.pickup_address_id) {
      errors.pickup_address_id = 'Pickup location is required';
    }
    if (!formData.pickup_date) {
      errors.pickup_date = 'Pickup date is required';
    }
    if (!formData.pickup_time) {
      errors.pickup_time = 'Pickup time is required';
    }
    if (!formData.expected_package_count || parseInt(formData.expected_package_count) <= 0) {
      errors.expected_package_count = 'Expected package count must be greater than 0';
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      ToastService.error('Please fill in all required fields');
      return;
    }

    try {
      const pickupData = {
        pickup_address_id: formData.pickup_address_id,
        pickup_date: formData.pickup_date,
        pickup_time: formData.pickup_time,
        expected_package_count: parseInt(formData.expected_package_count)
      };

      const resultAction = await dispatch(createPickupRequest(pickupData));

      if (createPickupRequest.fulfilled.match(resultAction)) {
        ToastService.success('Pickup request created successfully!');
        router.push('/orders/pickup-requests');
      } else {
        ToastService.error(resultAction.payload as string || 'Failed to create pickup request');
      }
    } catch (error) {
      console.error('Error creating pickup request:', error);
      ToastService.error(getErrorMessage(error));
    }
  };

  const handleBack = () => {
    router.back();
  };

  // Calculate time remaining for same-day pickup
  const getTimeRemainingMessage = () => {
    if (availableDates.length === 0) return null;

    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < 14 && selectedDateIndex === 0) {
      const twopm = new Date();
      twopm.setHours(14, 0, 0, 0);
      const diff = twopm.getTime() - now.getTime();
      const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
      const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      return (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <span className="font-semibold text-red-600 dark:text-red-400">
                {String(hoursLeft).padStart(2, '0')}:{String(minutesLeft).padStart(2, '0')} Hrs
              </span>
              {' '}remaining for the same-day Pickup. Book before 2pm to get Same day pickup at your doorstep
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Show loading state only if no addresses are selected yet
  if (!selectedAddress && savedPickupAddresses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
                Create Pickup Request
              </h1>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Pickup Details Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-2 mb-6">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Pickup Details
            </h2>
          </div>

          {/* Pickup Location */}
          <div className="mb-6" ref={locationWrapRef}>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pickup Location
                <svg className="w-4 h-4 text-gray-400 inline ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </label>
            </div>

            <div className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isLocationOpen}
                onClick={() => setIsLocationOpen(v => !v)}
                className={`w-full px-3 py-2 pr-10 text-left border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                  formErrors.pickup_address_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <span>
                  {selectedAddress
                    ? selectedAddress.warehouse_name
                    : 'Select Pickup Location'}
                </span>
                <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>

              {isLocationOpen && (
                <div
                  role="listbox"
                  tabIndex={-1}
                  className="absolute z-20 mt-1 w-full border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 max-h-60 overflow-y-auto shadow-lg"
                >
                  <div className="p-2">
                    {displayedAddresses.map((address) => (
                      <div
                        key={address.id}
                        role="option"
                        aria-selected={formData.pickup_address_id === address.id}
                        onClick={() => handleLocationSelect(address)}
                        className={`p-2 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
                          formData.pickup_address_id === address.id
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
                  </div>
                </div>
              )}
            </div>

            {formErrors.pickup_address_id && (
              <p className="text-red-500 text-sm mt-1">{formErrors.pickup_address_id}</p>
            )}
          </div>

          {/* Show date/time selection only if location is selected */}
          {selectedAddress && (
            <>
              {/* Pickup Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pickup Date
                </label>

                {getTimeRemainingMessage()}

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Pickup will be attempted during the selected Pickup Slot
                </p>

                <div className="flex gap-3">
                  {availableDates.map((dateInfo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateSelect(index)}
                      className={`flex-1 px-4 py-3 border-2 rounded-lg text-center transition-all ${
                        selectedDateIndex === index
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className={`text-xs font-medium ${
                        selectedDateIndex === index ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {dateInfo.label === 'Today' ? 'Today' : dateInfo.label === 'Tomorrow' ? 'Thu' : dateInfo.dayName}
                      </div>
                      <div className={`text-2xl font-bold mt-1 ${
                        selectedDateIndex === index ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {dateInfo.date.getDate()}
                      </div>
                      <div className={`text-xs mt-1 ${
                        selectedDateIndex === index ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {dateInfo.date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pickup Time Slot */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pickup Time (24-hour format) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-2">
                  {/* Hours */}
                  <div className="flex-1">
                    <input
                      type="text"
                      maxLength={2}
                      value={timeInput.hours}
                      onChange={(e) => handleTimeInputChange('hours', e.target.value)}
                      onBlur={() => handleTimeInputBlur('hours')}
                      placeholder="HH"
                      className={`w-full px-3 py-2 text-center text-lg font-mono border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                        formErrors.pickup_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">Hours</p>
                  </div>

                  <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 pb-5">:</span>

                  {/* Minutes */}
                  <div className="flex-1">
                    <input
                      type="text"
                      maxLength={2}
                      value={timeInput.minutes}
                      onChange={(e) => handleTimeInputChange('minutes', e.target.value)}
                      onBlur={() => handleTimeInputBlur('minutes')}
                      placeholder="MM"
                      className={`w-full px-3 py-2 text-center text-lg font-mono border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                        formErrors.pickup_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">Minutes</p>
                  </div>

                  <span className="text-2xl font-bold text-gray-400 dark:text-gray-500 pb-5">:</span>

                  {/* Seconds */}
                  <div className="flex-1">
                    <input
                      type="text"
                      maxLength={2}
                      value={timeInput.seconds}
                      onChange={(e) => handleTimeInputChange('seconds', e.target.value)}
                      onBlur={() => handleTimeInputBlur('seconds')}
                      placeholder="SS"
                      className={`w-full px-3 py-2 text-center text-lg font-mono border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                        formErrors.pickup_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">Seconds</p>
                  </div>
                </div>

                {formErrors.pickup_time && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.pickup_time}</p>
                )}

                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <span className="font-semibold">Time entered:</span> {formData.pickup_time}
                    <br />
                    <span className="text-gray-600 dark:text-gray-400">Hours: 00-23, Minutes & Seconds: 00-59</span>
                  </p>
                </div>
              </div>

              {/* Expected Package Count */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Package Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.expected_package_count}
                  onChange={(e) => handleInputChange('expected_package_count', e.target.value)}
                  placeholder="Enter expected package count"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                    formErrors.expected_package_count ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {formErrors.expected_package_count && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.expected_package_count}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Submit Buttons */}
        {selectedAddress && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <span>Create Pickup Request</span>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreatePickupRequestPage;
