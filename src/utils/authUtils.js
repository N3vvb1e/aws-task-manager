// src/utils/authUtils.js
import { fetchAuthSession } from "aws-amplify/auth";

/**
 * Check if the user is currently authenticated
 * @returns {Promise<boolean>} True if authenticated, false otherwise
 */
export const checkAuthStatus = async () => {
  try {
    const session = await fetchAuthSession();
    const isAuthenticated = !!session.tokens?.accessToken;

    if (isAuthenticated) {
      console.log("User is authenticated");
      // For debugging only - remove in production
      if (import.meta.env.DEV) {
        console.log(
          "Token expires at:",
          new Date(
            session.tokens.accessToken.payload.exp * 1000
          ).toLocaleString()
        );
      }
    } else {
      console.log("User is not authenticated");
    }

    return isAuthenticated;
  } catch (error) {
    console.error("Authentication check failed:", error);
    return false;
  }
};

/**
 * Get the current authentication token
 * @returns {Promise<string|null>} The access token or null if not authenticated
 */
export const getAuthToken = async () => {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken?.toString() || null;
  } catch (error) {
    console.error("Failed to get auth token:", error);
    return null;
  }
};
