import { createContext, useState, useEffect, useContext } from "react";
import {
  signIn,
  signUp,
  confirmSignUp,
  signOut,
  getCurrentUser,
} from "aws-amplify/auth";

// Create the authentication context
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
  confirmSignUp: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Authentication provider component
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const currentUser = await getCurrentUser();
        setIsAuthenticated(true);
        setUser(currentUser);
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Sign in function
  const handleSignIn = async (username, password) => {
    try {
      const user = await signIn({ username, password });
      setIsAuthenticated(true);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to sign in",
      };
    }
  };

  // Sign up function
  const handleSignUp = async (username, password, email) => {
    try {
      await signUp({
        username,
        password,
        attributes: {
          email,
        },
        autoSignIn: {
          enabled: true,
        },
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to sign up",
      };
    }
  };

  // Confirm sign up function
  const handleConfirmSignUp = async (username, code) => {
    try {
      await confirmSignUp({ username, confirmationCode: code });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Failed to confirm sign up",
      };
    }
  };

  // Sign out function
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsAuthenticated(false);
      setUser(null);
      return { success: true };
    } catch (error) {
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
