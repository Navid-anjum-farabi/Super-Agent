export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode: number
}

export function successResponse<T>(
  data: T,
  message?: string,
  statusCode = 200
): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
    statusCode,
  }
}

export function errorResponse(
  error: string,
  statusCode = 400
): ApiResponse {
  return {
    success: false,
    error,
    statusCode,
  }
}

export function validationError(
  errors: Record<string, string>
): ApiResponse {
  return {
    success: false,
    error: "Validation failed",
    statusCode: 422,
    data: errors,
  }
}
