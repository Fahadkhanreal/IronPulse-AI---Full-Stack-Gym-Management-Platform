interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export const success = <T>(message: string, data: T): SuccessResponse<T> => {
  return {
    success: true,
    message,
    data,
  };
};

export const error = (message: string, errorDetails?: string): ErrorResponse => {
  return {
    success: false,
    message,
    error: errorDetails,
  };
};
