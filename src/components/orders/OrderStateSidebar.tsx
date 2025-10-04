"use client";
import React from 'react';

interface OrderStateSidebarProps {
  currentState: string;
  onStateChange: (state: string) => void;
  states: Array<{
    key: string;
    label: string;
    count?: number;
  }>;
  type: 'forward' | 'reverse';
}

const OrderStateSidebar: React.FC<OrderStateSidebarProps> = ({
  currentState,
  onStateChange,
  states,
  type
}) => {
  const getStateTitle = () => {
    return type === 'forward' ? 'ORDER STATES' : 'ORDER STATES';
  };

  const getShipmentTitle = () => {
    return 'SHIPMENT STATES';
  };

  // Separate states into order states and shipment states
  const orderStates = states.filter(state =>
    ['pending', type === 'reverse' ? 'ready_for_pickup' : 'ready_to_ship', 'ready_for_pickup'].includes(state.key)
  );

  const shipmentStates = states.filter(state =>
    !orderStates.some(os => os.key === state.key) && state.key !== 'all_shipments'
  );

  const allShipmentsState = states.find(state => state.key === 'all_shipments');


  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full">
      <div className="p-6">
        {/* Order States Section */}
        <div className="mb-8">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            {getStateTitle()}
          </h3>
          <ul className="space-y-2">
            {orderStates.map((state) => (
              <li key={state.key}>
                <button
                  onClick={() => onStateChange(state.key)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    currentState === state.key
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{state.label}</span>
                    {state.count !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        currentState === state.key
                          ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                      }`}>
                        {state.count}
                      </span>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Shipment States Section */}
        {shipmentStates.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              {getShipmentTitle()}
            </h3>
            <ul className="space-y-2">
              {shipmentStates.map((state) => (
                <li key={state.key}>
                  <button
                    onClick={() => onStateChange(state.key)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      currentState === state.key
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{state.label}</span>
                      {state.count !== undefined && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          currentState === state.key
                            ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                        }`}>
                          {state.count}
                        </span>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* All Shipments */}
        {allShipmentsState && (
          <div>
            <button
              onClick={() => onStateChange(allShipmentsState.key)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                currentState === allShipmentsState.key
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{allShipmentsState.label}</span>
                {allShipmentsState.count !== undefined && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    currentState === allShipmentsState.key
                      ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                      : 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                  }`}>
                    {allShipmentsState.count}
                  </span>
                )}
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderStateSidebar;