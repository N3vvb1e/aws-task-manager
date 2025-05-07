// src/components/Debug/AuthDebugHelper.jsx
import { useState, useEffect } from "react";
import { fetchAuthSession } from "aws-amplify/auth";

const AuthDebugHelper = () => {
  const [debugInfo, setDebugInfo] = useState({
    isAuthenticated: false,
    tokenExpiry: null,
    error: null,
    lastChecked: null,
  });

  const checkAuth = async () => {
    try {
      const session = await fetchAuthSession();
      if (session.tokens?.accessToken) {
        const token = session.tokens.accessToken;
        const expiry = new Date(token.payload.exp * 1000);
        const now = new Date();

        setDebugInfo({
          isAuthenticated: true,
          tokenExpiry: expiry.toLocaleString(),
          timeRemaining: Math.floor((expiry - now) / 1000 / 60) + " minutes",
          error: null,
          lastChecked: new Date().toLocaleString(),
        });
      } else {
        setDebugInfo({
          isAuthenticated: false,
          tokenExpiry: null,
          timeRemaining: null,
          error: "No token available",
          lastChecked: new Date().toLocaleString(),
        });
      }
    } catch (error) {
      setDebugInfo({
        isAuthenticated: false,
        tokenExpiry: null,
        timeRemaining: null,
        error: error.message,
        lastChecked: new Date().toLocaleString(),
      });
    }
  };

  // Check on mount and every 60 seconds
  useEffect(() => {
    checkAuth();
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  const testAuth = async () => {
    try {
      // Make a direct fetch call to test the API
      const token = await getAuthToken();

      if (!token) {
        alert("No auth token available");
        return;
      }

      const response = await fetch(
        "https://p7pf7v1je8.execute-api.us-east-1.amazonaws.com/prod/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.text();
      console.log("API Test Result:", response.status, result);
      alert(`API Test: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.error("API Test Error:", error);
      alert(`API Test Error: ${error.message}`);
    }
  };

  const getAuthToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session.tokens?.accessToken?.toString();
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        background: debugInfo.isAuthenticated ? "#e6fffa" : "#fff5f5",
        border: `1px solid ${
          debugInfo.isAuthenticated ? "#38b2ac" : "#f56565"
        }`,
        borderRadius: "4px",
        padding: "10px",
        fontSize: "12px",
        zIndex: 9999,
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        maxWidth: "300px",
      }}
    >
      <h3 style={{ margin: "0 0 5px" }}>Auth Debug</h3>
      <div>
        <strong>Status:</strong>{" "}
        {debugInfo.isAuthenticated
          ? "✅ Authenticated"
          : "❌ Not Authenticated"}
      </div>

      {debugInfo.tokenExpiry && (
        <div>
          <strong>Expires:</strong> {debugInfo.tokenExpiry}
          <br />
          <strong>Time left:</strong> {debugInfo.timeRemaining}
        </div>
      )}

      {debugInfo.error && (
        <div style={{ color: "#e53e3e" }}>
          <strong>Error:</strong> {debugInfo.error}
        </div>
      )}

      <div style={{ fontSize: "10px", marginTop: "5px" }}>
        Last checked: {debugInfo.lastChecked}
      </div>

      <div style={{ marginTop: "8px" }}>
        <button
          onClick={checkAuth}
          style={{
            padding: "3px 6px",
            marginRight: "5px",
            fontSize: "11px",
          }}
        >
          Refresh
        </button>
        <button
          onClick={testAuth}
          style={{
            padding: "3px 6px",
            fontSize: "11px",
          }}
        >
          Test API
        </button>
      </div>
    </div>
  );
};

export default AuthDebugHelper;
