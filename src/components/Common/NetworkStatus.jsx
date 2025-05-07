// src/components/Common/NetworkStatus.jsx
import { useState, useEffect } from "react";

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: "0",
        left: "0",
        right: "0",
        backgroundColor: "#f44336",
        color: "white",
        textAlign: "center",
        padding: "0.5rem",
        zIndex: 9999,
      }}
    >
      You are currently offline. Some features may not be available.
    </div>
  );
};

export default NetworkStatus;
