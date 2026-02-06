import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface SortConfig<K> {
  key: K;
  direction: SortDirection;
}

export function useSortableData<T, K extends keyof T>(
  data: T[],
  defaultSort?: SortConfig<K>
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<K> | null>(defaultSort || null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    const sorted = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortConfig.direction === 'asc' ? 1 : -1;
      if (bValue == null) return sortConfig.direction === 'asc' ? -1 : 1;

      // Determine type and sort accordingly
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // Check if it's a date string (ISO format)
        const aDate = Date.parse(aValue);
        const bDate = Date.parse(bValue);
        
        if (!isNaN(aDate) && !isNaN(bDate)) {
          // Date comparison
          return sortConfig.direction === 'asc' ? aDate - bDate : bDate - aDate;
        }
        
        // String comparison (case-insensitive)
        const comparison = aValue.toLowerCase().localeCompare(bValue.toLowerCase());
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        if (aValue === bValue) return 0;
        if (sortConfig.direction === 'asc') {
          return aValue ? 1 : -1;
        }
        return aValue ? -1 : 1;
      }

      // Default fallback - convert to string
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [data, sortConfig]);

  const requestSort = (key: K) => {
    let direction: SortDirection = 'asc';
    
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: K): string | null => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return {
    sortedData,
    sortConfig,
    requestSort,
    getSortIndicator,
  };
}
