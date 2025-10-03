"use client";
import React, { useState, useMemo, useCallback } from 'react';
import { StateConfig } from '../../types/orders';
import { ChevronUpIcon, ChevronDownIcon } from '../../icons';

interface DynamicTableProps<T = Record<string, unknown>> {
  data: T[];
  config: StateConfig;
  isLoading?: boolean;
  onSort?: (columnId: string, direction: 'asc' | 'desc') => void;
  onRowAction?: (action: string, rowData: T) => void;
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (row: T) => string;
  showCheckboxes?: boolean;
}

const DynamicTable = <T = Record<string, unknown>,>({
  data,
  config,
  isLoading = false,
  onSort,
  onRowAction,
  onSelectionChange,
  getRowId = (row: T) => (row as Record<string, unknown>).id as string || String(Math.random()),
  showCheckboxes = true
}: DynamicTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    columnId: string;
    direction: 'asc' | 'desc';
  }>(config.defaultSort);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  console.log("Table data:", data);

  const handleSort = (columnId: string) => {
    const newDirection =
      sortConfig.columnId === columnId && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc';

    setSortConfig({ columnId, direction: newDirection });
    onSort?.(columnId, newDirection);
  };

  const handleSelectAll = () => {
    const allIds = data.map(row => getRowId(row));
    console.log('All row IDs:', allIds);
    const newSelectedIds = selectedIds.size === allIds.length ? new Set<string>() : new Set(allIds);
    console.log('New selected IDs after select all:', Array.from(newSelectedIds));
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(Array.from(newSelectedIds));
  };

  const handleRowSelect = (rowId: string) => {
    console.log('Row selected/deselected:', rowId);
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(rowId)) {
      newSelectedIds.delete(rowId);
    } else {
      newSelectedIds.add(rowId);
    }
    console.log('New selected IDs:', Array.from(newSelectedIds));
    setSelectedIds(newSelectedIds);
    onSelectionChange?.(Array.from(newSelectedIds));
  };

  const isAllSelected = data.length > 0 && selectedIds.size === data.length;
  // const isIndeterminate = selectedIds.size > 0 && selectedIds.size < data.length;

  const getVisibleColumns = useCallback(() => {
    // For now, we'll show all columns. In a real implementation,
    // you'd check screen size and filter based on hideOn property
    console.log("Config columns:", config.columns);
    return config.columns;
  }, [config.columns]);

  const visibleColumns = useMemo(() => getVisibleColumns(), [getVisibleColumns]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 dark:bg-gray-700"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              {showCheckboxes && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>
              )}
              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''
                    }`}
                  style={{ minWidth: column.minWidth }}
                  onClick={() => column.sortable && handleSort(column.id)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        {sortConfig.columnId === column.id ? (
                          sortConfig.direction === 'asc' ? (
                            <ChevronUpIcon className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                          )
                        ) : (
                          <div className="flex flex-col">
                            <ChevronUpIcon className="w-3 h-3 text-gray-300" />
                            <ChevronDownIcon className="w-3 h-3 text-gray-300" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {config.rowActions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length + (config.rowActions.length > 0 ? 1 : 0) + (showCheckboxes ? 1 : 0)}
                  className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No data available
                </td>
              </tr>
            ) : (

              data.map((row, index) => {
                const rowId = getRowId(row);
                return (
                  <tr
                    key={index}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200"
                  >
                    {showCheckboxes && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(rowId)}
                          onChange={() => handleRowSelect(rowId)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                      </td>
                    )}
                    {visibleColumns.map((column) => (
                      <td
                        key={column.id}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white"
                        style={{ minWidth: column.minWidth }}
                      >
                        {column.accessor(row)}
                      </td>
                    ))}
                    {config.rowActions.length > 0 && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {config.rowActions.map((action) => (
                            <button
                              key={action}
                              onClick={() => onRowAction?.(action, row)}
                              className="
    px-3 py-1.5
    rounded-lg
    text-sm font-medium
    text-blue-600 dark:text-blue-400
    hover:text-white dark:hover:text-gray-900
    hover:bg-blue-600 dark:hover:bg-blue-300
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
    transition-all duration-200
  "
                            >
                              {action.replace(/([A-Z])/g, ' $1').trim()}
                            </button>

                          ))}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DynamicTable;