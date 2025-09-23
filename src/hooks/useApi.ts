import { useState, useEffect, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: UseApiOptions = {}
) {
  const { immediate = false, onSuccess, onError } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFunction(...args);
        const data = response.data || response;

        setState({
          data,
          loading: false,
          error: null,
        });

        onSuccess?.(data);
        return data;
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || 'An error occurred';

        setState({
          data: null,
          loading: false,
          error: errorMessage,
        });

        onError?.(errorMessage);
        throw error;
      }
    },
    [apiFunction, onSuccess, onError]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specialized hook for paginated data
export function usePaginatedApi<T>(
  apiFunction: (...args: any[]) => Promise<any>,
  options: UseApiOptions & { pageSize?: number } = {}
) {
  const { pageSize = 50, ...apiOptions } = options;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageSize,
    total: 0,
    totalPages: 0,
  });

  const { data, loading, error, execute, reset } = useApi<{
    data: T[];
    pagination: typeof pagination;
  }>(apiFunction, {
    ...apiOptions,
    onSuccess: (response) => {
      if (response.pagination) {
        setPagination(response.pagination);
      }
      apiOptions.onSuccess?.(response);
    },
  });

  const fetchPage = useCallback(
    (page: number) => {
      execute(pagination.limit, page);
    },
    [execute, pagination.limit]
  );

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      fetchPage(pagination.page + 1);
    }
  }, [fetchPage, pagination.page, pagination.totalPages]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      fetchPage(pagination.page - 1);
    }
  }, [fetchPage, pagination.page]);

  const resetPagination = useCallback(() => {
    setPagination({
      page: 1,
      limit: pageSize,
      total: 0,
      totalPages: 0,
    });
    reset();
  }, [reset, pageSize]);

  return {
    data: data?.data || [],
    pagination,
    loading,
    error,
    execute,
    fetchPage,
    nextPage,
    prevPage,
    reset: resetPagination,
  };
}

// Hook for managing form submissions
export function useFormSubmission<T>(
  submitFunction: (data: any) => Promise<any>,
  options: UseApiOptions = {}
) {
  const { loading, error, execute, reset } = useApi<T>(submitFunction, options);

  const submit = useCallback(
    async (formData: any) => {
      return execute(formData);
    },
    [execute]
  );

  return {
    isSubmitting: loading,
    error,
    submit,
    reset,
  };
}