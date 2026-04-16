/**
 * Error Handler Utilities
 * 
 * Provides utilities for consistent error handling across the application.
 * Handles API errors, client errors, and server errors.
 */

export interface ApiError {
  status: number
  message: string
  code?: string
  details?: Record<string, any>
}

export interface ErrorResponse {
  success: false
  error: ApiError
}

export interface SuccessResponse<T = any> {
  success: true
  data: T
}

/**
 * Parse API error response
 * @param error - The error object or response
 * @returns ApiError object
 */
export function parseApiError(error: any): ApiError {
  // Handle fetch error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return {
      status: 0,
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    }
  }

  // Handle JSON response errors
  if (error instanceof Error) {
    return {
      status: 500,
      message: error.message,
      code: 'UNKNOWN_ERROR',
    }
  }

  // Handle object errors (from API responses)
  if (typeof error === 'object') {
    return {
      status: error.status || error.statusCode || 500,
      message: error.message || error.msg || 'An error occurred',
      code: error.code || error.errorCode,
      details: error.details || error.data,
    }
  }

  // Fallback for string errors
  return {
    status: 500,
    message: String(error),
    code: 'UNKNOWN_ERROR',
  }
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: ApiError): boolean {
  return error.status === 401 || error.code === 'UNAUTHORIZED'
}

/**
 * Check if error is permission related
 */
export function isPermissionError(error: ApiError): boolean {
  return error.status === 403 || error.code === 'FORBIDDEN'
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: ApiError): boolean {
  return error.status === 400 || error.code === 'VALIDATION_ERROR'
}

/**
 * Check if error is a not found error
 */
export function isNotFoundError(error: ApiError): boolean {
  return error.status === 404 || error.code === 'NOT_FOUND'
}

/**
 * Check if error is a server error
 */
export function isServerError(error: ApiError): boolean {
  return error.status >= 500
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: ApiError): string {
  if (isAuthError(error)) {
    return 'Your session has expired. Please log in again.'
  }

  if (isPermissionError(error)) {
    return 'You do not have permission to perform this action.'
  }

  if (isValidationError(error)) {
    return 'Please check your input and try again.'
  }

  if (isNotFoundError(error)) {
    return 'The requested resource could not be found.'
  }

  if (isServerError(error)) {
    return 'A server error occurred. Please try again later.'
  }

  if (error.status === 0) {
    return 'Network error. Please check your connection.'
  }

  return error.message || 'An unexpected error occurred.'
}

/**
 * Log error for monitoring (to be implemented with your analytics service)
 */
export function logError(error: ApiError, context?: Record<string, any>) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    ...error,
    context,
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', errorLog)
  }

  // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
  // if (typeof window !== 'undefined' && window.errorTracker) {
  //   window.errorTracker.captureException(error, { extra: context })
  // }
}

/**
 * Retry a failed request with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      const isLastAttempt = i === maxRetries - 1
      if (isLastAttempt) throw error

      // Exponential backoff: 1s, 2s, 4s
      const delayMs = initialDelayMs * Math.pow(2, i)
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  throw new Error('Max retries exceeded')
}

/**
 * Fetch with error handling
 */
export async function fetchWithErrorHandling<T>(
  url: string,
  options?: RequestInit
): Promise<SuccessResponse<T> | ErrorResponse> {
  try {
    const response = await fetch(url, options)
    const data = await response.json()

    if (!response.ok) {
      const error = parseApiError(data)
      logError(error, { url, method: options?.method || 'GET' })
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    const apiError = parseApiError(error)
    logError(apiError, { url, method: options?.method || 'GET' })
    return { success: false, error: apiError }
  }
}
