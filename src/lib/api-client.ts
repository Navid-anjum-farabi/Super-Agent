import { ApiResponse } from './api-response'

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

export const apiClient = {
  /**
   * Make a GET request to the API
   */
  async get<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    })
  },

  /**
   * Make a POST request to the API
   */
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  /**
   * Make a PUT request to the API
   */
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  },

  /**
   * Make a DELETE request to the API
   */
  async delete<T = any>(
    endpoint: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    })
  },

  /**
   * Make a generic request to the API
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...options.headers,
      }

      const response = await fetch(endpoint, {
        ...options,
        headers,
      })

      const data: ApiResponse<T> = await response.json()

      // If response is not ok, throw an error
      if (!response.ok) {
        console.error(`API Error [${response.status}]:`, data)
      }

      return data
    } catch (error) {
      console.error(`API Request Error (${endpoint}):`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        statusCode: 500,
      }
    }
  },
}

/**
 * Type-safe hook wrapper for API calls (optional, for React components)
 */
export function useApi() {
  return apiClient
}
