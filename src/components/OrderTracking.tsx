import React from 'react';

interface TrackingStep {
  status: string;
  label: string;
  description?: string;
  timestamp?: string;
  completed: boolean;
  current: boolean;
}

interface OrderTrackingProps {
  currentStatus: string;
  orderType: 'FORWARD' | 'REVERSE';
  className?: string;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ currentStatus, orderType, className = '' }) => {
  // Forward order tracking steps
  const forwardSteps: TrackingStep[] = [
    {
      status: 'PENDING',
      label: 'Order Received',
      description: 'Order has been created',
      completed: true,
      current: currentStatus === 'PENDING'
    },
    {
      status: 'MANIFESTED',
      label: 'Ready To Ship',
      description: 'AWB generated',
      completed: ['MANIFESTED', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RTO_IN_TRANSIT', 'RTO_RETURN_ACCEPTED'].includes(currentStatus),
      current: currentStatus === 'MANIFESTED'
    },
    {
      status: 'READY_FOR_PICKUP',
      label: 'Scheduled for Pickup',
      description: 'Pickup scheduled',
      completed: ['READY_FOR_PICKUP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RTO_IN_TRANSIT', 'RTO_RETURN_ACCEPTED'].includes(currentStatus),
      current: currentStatus === 'READY_FOR_PICKUP'
    },
    {
      status: 'IN_TRANSIT',
      label: 'In-transit',
      description: 'Package in transit',
      completed: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'RTO_IN_TRANSIT', 'RTO_RETURN_ACCEPTED'].includes(currentStatus),
      current: currentStatus === 'IN_TRANSIT'
    },
    {
      status: 'OUT_FOR_DELIVERY',
      label: 'Out for delivery',
      description: 'Out for delivery',
      completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(currentStatus),
      current: currentStatus === 'OUT_FOR_DELIVERY'
    },
    {
      status: 'DELIVERED',
      label: 'Delivered',
      description: 'Package delivered',
      completed: currentStatus === 'DELIVERED',
      current: currentStatus === 'DELIVERED'
    }
  ];

  // Reverse order tracking steps
  const reverseSteps: TrackingStep[] = [
    {
      status: 'PENDING',
      label: 'Return Initiated',
      description: 'Return request created',
      completed: true,
      current: currentStatus === 'PENDING'
    },
    {
      status: 'READY_FOR_PICKUP',
      label: 'Ready for Pickup',
      description: 'Scheduled for pickup',
      completed: ['READY_FOR_PICKUP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(currentStatus),
      current: currentStatus === 'READY_FOR_PICKUP'
    },
    {
      status: 'IN_TRANSIT',
      label: 'In-transit',
      description: 'Package in transit to warehouse',
      completed: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(currentStatus),
      current: currentStatus === 'IN_TRANSIT'
    },
    {
      status: 'OUT_FOR_DELIVERY',
      label: 'Out for Delivery',
      description: 'Out for delivery to warehouse',
      completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(currentStatus),
      current: currentStatus === 'OUT_FOR_DELIVERY'
    },
    {
      status: 'DELIVERED',
      label: 'Return Completed',
      description: 'Package received at warehouse',
      completed: currentStatus === 'DELIVERED',
      current: currentStatus === 'DELIVERED'
    }
  ];

  // Handle cancelled status
  const isCancelled = currentStatus === 'CANCELLED';

  // Handle RTO statuses for forward orders
  const isRTO = ['RTO_IN_TRANSIT', 'RTO_RETURN_ACCEPTED'].includes(currentStatus);

  const steps = orderType === 'FORWARD' ? forwardSteps : reverseSteps;

  // Icon component based on status
  const StepIcon: React.FC<{ step: TrackingStep }> = ({ step }) => {
    if (isCancelled) {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30">
          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }

    if (step.completed && !step.current) {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30">
          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }

    if (step.current) {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 animate-pulse">
          <div className="w-5 h-5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
        </div>
      );
    }

    // Icon mapping for pending steps
    const iconMap: Record<string, JSX.Element> = {
      'PENDING': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'MANIFESTED': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      'READY_FOR_PICKUP': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      'IN_TRANSIT': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      ),
      'OUT_FOR_DELIVERY': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      'DELIVERED': (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };

    return (
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700">
        <div className="text-gray-400 dark:text-gray-500">
          {iconMap[step.status] || iconMap['PENDING']}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center mb-6">
        <svg className={`w-6 h-6 mr-2 ${orderType === 'FORWARD' ? 'text-blue-600' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Order Tracking</h2>
      </div>

      {/* Cancelled status banner */}
      {isCancelled && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Order Cancelled</p>
              <p className="text-xs text-red-600 dark:text-red-400">This order has been cancelled</p>
            </div>
          </div>
        </div>
      )}

      {/* RTO status banner for forward orders */}
      {isRTO && orderType === 'FORWARD' && (
        <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                {currentStatus === 'RTO_IN_TRANSIT' ? 'Return to Origin In Transit' : 'RTO Return Accepted'}
              </p>
              <p className="text-xs text-orange-600 dark:text-orange-400">
                Package is being returned to origin
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tracking Steps */}
      <div className="relative">
        {steps.map((step, index) => (
          <div key={step.status} className="relative pb-8 last:pb-0">
            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div className={`absolute left-5 top-10 w-0.5 h-full -ml-px ${
                step.completed && !isCancelled
                  ? 'bg-green-500 dark:bg-green-600'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}></div>
            )}

            {/* Step Content */}
            <div className="flex items-start space-x-4">
              <StepIcon step={step} />

              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${
                    step.current && !isCancelled
                      ? 'text-blue-600 dark:text-blue-400'
                      : step.completed && !isCancelled
                      ? 'text-green-600 dark:text-green-400'
                      : isCancelled
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {step.label}
                  </p>
                  {step.timestamp && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(step.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
                {step.description && (
                  <p className={`mt-1 text-xs ${
                    isCancelled
                      ? 'text-gray-400 dark:text-gray-500'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                )}

                {/* Additional info for specific statuses */}
                {step.current && !isCancelled && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      Current Status
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      
    </div>
  );
};

export default OrderTracking;
