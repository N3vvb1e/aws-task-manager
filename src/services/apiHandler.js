import { get, post, put, del } from "aws-amplify/api";

/**
 * A wrapper for Amplify API calls with standardized error handling
 */
export const apiHandler = {
  /**
   * Generic request handler
   */
  async request(method, params) {
    try {
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

      // Handle response
      if (response.statusCode >= 400) {
        const errorBody = await response.body.json();
        throw new Error(errorBody.message || "API request failed");
      }

      // For DELETE, we might not have a response body
      if (method === "DELETE") {
        return { success: true };
      }

      // Parse the response body for other methods
      const data = await response.body.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API ${method} request failed:`, error);
      return {
        success: false,
        message: error.message || `Failed to ${method.toLowerCase()} data`,
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
