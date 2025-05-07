// src/services/apiHandler.js
import { get, post, put, del } from "aws-amplify/api";
import { fetchAuthSession } from "aws-amplify/auth";

/**
 * A wrapper for Amplify API calls with standardized error handling
 */
export const apiHandler = {
  /**
   * Get auth token for API requests
   */
  async getAuthToken() {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString();
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  },

  /**
   * Retry a function with exponential backoff
   */
  async retryWithBackoff(fn, maxRetries = 3, initialDelay = 1000) {
    let retries = 0;
    let delay = initialDelay;

    const execute = async () => {
      try {
        return await fn();
      } catch (error) {
        // Check if we should retry
        if (retries < maxRetries && this.isRetryableError(error)) {
          retries++;
          console.log(`Retry ${retries}/${maxRetries} after ${delay}ms`);

          // Wait for the backoff period
          await new Promise((resolve) => setTimeout(resolve, delay));

          // Exponential backoff
          delay *= 2;

          // Try again
          return execute();
        }

        // We've exhausted retries or the error isn't retryable
        throw error;
      }
    };

    return execute();
  },

  /**
   * Check if an error is retryable
   */
  isRetryableError(error) {
    // Network errors are retryable
    if (
      error.message &&
      (error.message.includes("NetworkError") ||
        error.message.includes("network error") ||
        error.message.includes("ERR_INSUFFICIENT_RESOURCES") ||
        error.message.includes("Failed to fetch") ||
        error.message.includes("Network request failed"))
    ) {
      return true;
    }

    // Some HTTP status codes indicate server overload (retryable)
    if (error.statusCode && [429, 503, 504].includes(error.statusCode)) {
      return true;
    }

    return false;
  },

  /**
   * Generic request handler with retries
   */
  async request(method, params) {
    console.log(`${method} request to: ${params.path}`);

    try {
      // Use retry logic for all requests
      return await this.retryWithBackoff(async () => {
        let response;
        switch (method) {
          case "GET":
            response = await get(params);
            break;
          case "POST":
            response = await post(params);
            break;
          case "PUT":
            response = await put(params);
            break;
          case "DELETE":
            response = await del(params);
            break;
          default:
            throw new Error(`Unsupported method: ${method}`);
        }

        console.log(`Response status: ${response?.statusCode}`);

        // Handle missing response
        if (!response) {
          throw new Error("No response received from API");
        }

        // Handle error status codes
        if (response.statusCode >= 400) {
          if (response.statusCode === 401 || response.statusCode === 403) {
            return {
              success: false,
              message: "Authentication failed. Please log in again.",
              authError: true,
              statusCode: response.statusCode,
            };
          }

          // Parse error message if available
          let errorMessage = "API request failed";
          try {
            if (response.body) {
              const errorBody = await response.body.json();
              errorMessage = errorBody.message || errorMessage;
            }
          } catch (e) {
            console.warn("Could not parse error response body");
          }

          return {
            success: false,
            message: errorMessage,
            statusCode: response.statusCode,
          };
        }

        // For DELETE, we might not have a response body
        if (method === "DELETE" || !response.body) {
          return { success: true };
        }

        // Parse the response body for other methods
        let data = {};
        try {
          if (response.body) {
            data = await response.body.json();
          }
        } catch (error) {
          console.warn("Error parsing response body:", error);
          // Return success with empty data
          return {
            success: true,
            data: {},
            statusCode: response.statusCode,
          };
        }

        return {
          success: true,
          data,
          statusCode: response.statusCode,
        };
      });
    } catch (error) {
      console.error(`API ${method} request failed:`, error);

      // Format error message based on type
      let errorMessage =
        error.message || `Failed to ${method.toLowerCase()} data`;
      let isNetworkError = false;

      // Check if this is a network error
      if (
        error.message &&
        (error.message.includes("NetworkError") ||
          error.message.includes("network error") ||
          error.message.includes("ERR_INSUFFICIENT_RESOURCES") ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("Network request failed"))
      ) {
        errorMessage =
          "Network error. Please check your connection and try again.";
        isNetworkError = true;
      }

      // Check if this is an auth error
      const isAuthError =
        error.message && error.message.includes("Unauthorized");

      return {
        success: false,
        message: errorMessage,
        authError: isAuthError,
        networkError: isNetworkError,
      };
    }
  },

  /**
   * GET request
   */
  get(params) {
    return this.request("GET", params);
  },

  /**
   * POST request
   */
  post(params) {
    return this.request("POST", params);
  },

  /**
   * PUT request
   */
  put(params) {
    return this.request("PUT", params);
  },

  /**
   * DELETE request
   */
  delete(params) {
    return this.request("DELETE", params);
  },
};
