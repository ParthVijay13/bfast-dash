import toast from 'react-hot-toast';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export class ToastService {
  static success(message: string, options?: ToastOptions) {
    toast.success(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      style: {
        background: '#10B981',
        color: '#FFFFFF',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#10B981',
      },
    });
  }

  static error(message: string, options?: ToastOptions) {
    toast.error(message, {
      duration: options?.duration || 5000,
      position: options?.position || 'top-right',
      style: {
        background: '#EF4444',
        color: '#FFFFFF',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      iconTheme: {
        primary: '#FFFFFF',
        secondary: '#EF4444',
      },
    });
  }

  static info(message: string, options?: ToastOptions) {
    toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#FFFFFF',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
  }

  static warning(message: string, options?: ToastOptions) {
    toast(message, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#FFFFFF',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
  }

  static loading(message: string, options?: ToastOptions) {
    return toast.loading(message, {
      position: options?.position || 'top-right',
      style: {
        background: '#374151',
        color: '#FFFFFF',
        fontWeight: '500',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    });
  }

  static dismiss(toastId?: string) {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }

  static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) {
    return toast.promise(promise, messages, {
      position: options?.position || 'top-right',
      style: {
        fontWeight: '500',
        borderRadius: '8px',
        padding: '16px 20px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      success: {
        style: {
          background: '#10B981',
          color: '#FFFFFF',
        },
        iconTheme: {
          primary: '#FFFFFF',
          secondary: '#10B981',
        },
      },
      error: {
        style: {
          background: '#EF4444',
          color: '#FFFFFF',
        },
        iconTheme: {
          primary: '#FFFFFF',
          secondary: '#EF4444',
        },
      },
      loading: {
        style: {
          background: '#374151',
          color: '#FFFFFF',
        },
      },
    });
  }
}

// Helper function to extract error message from backend response
export const getErrorMessage = (error: any): string => {
  // Check for axios error response
  if (error?.response?.data) {
    const data = error.response.data;

    // Common backend error formats
    if (typeof data.message === 'string') {
      return data.message;
    }

    if (typeof data.error === 'string') {
      return data.error;
    }

    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors[0].message || data.errors[0];
    }

    if (typeof data.detail === 'string') {
      return data.detail;
    }

    // If data is a string
    if (typeof data === 'string') {
      return data;
    }
  }

  // Fallback for network errors
  if (error?.message) {
    return error.message;
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
};

// Helper function to extract success message from backend response
export const getSuccessMessage = (response: any, defaultMessage: string): string => {
  if (response?.data?.message && typeof response.data.message === 'string') {
    return response.data.message;
  }

  if (response?.message && typeof response.message === 'string') {
    return response.message;
  }

  return defaultMessage;
};