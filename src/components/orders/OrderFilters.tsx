"use client";
import React, { useState, useCallback, useEffect } from 'react';
import { FilterConfig } from '../../types/orders';

// Custom hook for debouncing
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface OrderFiltersProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, string | number | boolean>) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({ filters, onFilterChange }) => {
  const [filterValues, setFilterValues] = useState<Record<string, string | number | boolean>>({});

  // Debounce search inputs (500ms delay) but not date/select filters
  const debouncedFilterValues = useDebounce(filterValues, 500);

  // Track which filters should be debounced
  const [searchFilters, setSearchFilters] = useState<Set<string>>(new Set());
  const [nonSearchFilters, setNonSearchFilters] = useState<Record<string, string | number | boolean>>({});

  useEffect(() => {
    const searchFilterParams = new Set<string>();
    filters.forEach(filter => {
      if (filter.id === 'search') {
        searchFilterParams.add(filter.param);
      }
    });
    setSearchFilters(searchFilterParams);
  }, [filters]);

  // Effect for debounced search filters
  useEffect(() => {
    const searchValues: Record<string, string | number | boolean> = {};
    Object.entries(debouncedFilterValues).forEach(([key, value]) => {
      if (searchFilters.has(key)) {
        searchValues[key] = value;
      }
    });

    if (Object.keys(searchValues).length > 0 || Object.keys(nonSearchFilters).length > 0) {
      onFilterChange({ ...nonSearchFilters, ...searchValues });
    }
  }, [debouncedFilterValues, nonSearchFilters, onFilterChange, searchFilters]);

  const handleFilterChange = (param: string, value: string | number | boolean) => {
    const newFilters = { ...filterValues, [param]: value };
    setFilterValues(newFilters);

    // If it's not a search filter, apply immediately
    if (!searchFilters.has(param)) {
      const newNonSearchFilters = { ...nonSearchFilters, [param]: value };
      setNonSearchFilters(newNonSearchFilters);
    }
  };

  const clearFilters = () => {
    setFilterValues({});
    setNonSearchFilters({});
    onFilterChange({});
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex flex-wrap items-center gap-4">
        {filters.map((filter) => {
          if (filter.id === 'search') {
            return (
              <div key={filter.param} className="flex-1 min-w-[200px] max-w-[400px]">
                <input
                  type="text"
                  placeholder={filter.placeholder}
                  value={String(filterValues[filter.param] || '')}
                  onChange={(e) => handleFilterChange(filter.param, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            );
          }

          if (filter.id === 'date') {
            return (
              <div key={filter.param} className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filter.label}:
                </label>
                {filter.kind === 'range' ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="date"
                      value={String(filterValues[`${filter.param}_start`] || '')}
                      onChange={(e) => handleFilterChange(`${filter.param}_start`, e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="date"
                      value={String(filterValues[`${filter.param}_end`] || '')}
                      onChange={(e) => handleFilterChange(`${filter.param}_end`, e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                ) : (
                  <input
                    type="date"
                    value={filterValues[filter.param] || ''}
                    onChange={(e) => handleFilterChange(filter.param, e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                )}
              </div>
            );
          }

          if (filter.id === 'select') {
            return (
              <div key={filter.param} className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {filter.label}:
                </label>
                <select
                  value={String(filterValues[filter.param] || '')}
                  onChange={(e) => handleFilterChange(filter.param, e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All</option>
                  {/* Options would be populated based on optionsSource */}
                  <option value="option1">Option 1</option>
                  <option value="option2">Option 2</option>
                </select>
              </div>
            );
          }

          return null;
        })}

        {Object.keys(filterValues).length > 0 && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderFilters;