// src/components/Auth/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";

// Create the authentication context
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  confirmSignUp: async () => {},
  refreshAuth: async () => {},
  getToken: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(0);

  // Function to check authentication status and tokens
  const checkAuthStatus = async () => {
    try {
      // First clear any stale auth state
      if (Date.now() - lastRefresh > 5 * 60 * 1000) {
        // 5 minutes
        // Force refresh token provider
        try {
          await cognitoUserPoolsTokenProvider.invalidateCachedTokens();
        } catch (e) {
          console.warn("Failed to invalidate cached tokens:", e);
        }
      }

      // Check both the current user and auth session
      const currentUser = await getCurrentUser();
      console.log("Current user:", currentUser);

      // Fetch auth session to get tokens
      const session = await fetchAuthSession();
      console.log("Session available:", !!session);

      // Verify we have a valid token
      const hasValidToken = !!session.tokens?.accessToken;
      console.log("Has valid token:", hasValidToken);

      if (currentUser && hasValidToken) {
        console.log("Auth check: User is authenticated");
        setIsAuthenticated(true);
        setUser(currentUser);
        setLastRefresh(Date.now());
        return true;
      } else {
        console.log("Auth check: Missing user or token");
        throw new Error("Missing user or token");
      }
    } catch (error) {
      console.log("Auth check: User is not authenticated", error);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get current auth token
  const getToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString();
    } catch (error) {
      console.error("Failed to get auth token:", error);
      return null;
    }
  };

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Sign in function
  const handleSignIn = async (username, password) => {
    try {
      console.log(`Attempting to sign in user: ${username}`);

      const { isSignedIn, nextStep } = await signIn({ username, password });
      console.log("Sign in result:", { isSignedIn, nextStep });

      if (isSignedIn) {
        await checkAuthStatus(); // Refresh auth state
        return { success: true };
      } else if (nextStep) {
        return {
          success: false,
          nextStep,
          message: "Additional authentication steps required.",
        };
      }

      return { success: false, message: "Failed to sign in." };
    } catch (error) {
      console.error("Sign in error:", error);
      return {
        success: false,
        message: error.message || "Failed to sign in",
      };
    }
  };

  // Sign up function (unchanged)
  const handleSignUp = async (username, password, email) => {
    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username,
        password,
        options: {
          userAttributes: {
            email,
          },
          autoSignIn: {
            enabled: true,
          },
        },
      });

      if (nextStep && nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        return { success: true, message: "Confirmation code sent." };
      }

      return { success: isSignUpComplete };
    } catch (error) {
      console.error("Sign up error:", error);
      return {
        success: false,
        message: error.message || "Failed to sign up",
      };
    }
  };

  // Confirm sign up function (unchanged)
  const handleConfirmSignUp = async (username, code) => {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username,
        confirmationCode: code,
      });

      return { success: isSignUpComplete };
    } catch (error) {
      console.error("Confirm sign up error:", error);
      return {
        success: false,
        message: error.message || "Failed to confirm sign up",
      };
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      await signOut({ global: true });
      setIsAuthenticated(false);
      setUser(null);
      return { success: true };
    } catch (error) {
      console.error("Sign out error:", error);
      return {
        success: false,
        message: error.message || "Failed to sign out",
      };
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    signIn: handleSignIn,
    signUp: handleSignUp,
    confirmSignUp: handleConfirmSignUp,
    signOut: handleSignOut,
    refreshAuth: checkAuthStatus,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
