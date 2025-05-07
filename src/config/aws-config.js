// src/config/aws-config.js
import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";
import { fetchAuthSession } from "aws-amplify/auth";

// Get environment variables
const region = import.meta.env.VITE_AWS_REGION || "us-east-1";
const userPoolId =
  import.meta.env.VITE_COGNITO_USER_POOL_ID || "us-east-1_iJauJI8w2";
const userPoolClientId =
  import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID ||
  "7obgukbroah840rn0qd6tl8vqj";
const apiEndpoint =
  import.meta.env.VITE_API_ENDPOINT ||
  "https://p7pf7v1je8.execute-api.us-east-1.amazonaws.com/prod";
const s3Bucket = import.meta.env.VITE_S3_BUCKET || "mycolorfulawsbucket";

// Log config in development
if (import.meta.env.DEV) {
  console.log("AWS Config:", { region, userPoolId, apiEndpoint, s3Bucket });
}

// Amplify configuration
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        email: true,
        username: true,
      },
    },
  },
  API: {
    REST: {
      taskApi: {
        endpoint: apiEndpoint,
        region,
        // Using custom authorization logic
        options: {
          headers: async () => {
            try {
              // Get the auth session directly
              const session = await fetchAuthSession();

              // Debug authentication session
              if (import.meta.env.DEV) {
                if (session.tokens?.accessToken) {
                  console.log("Token available for API request");
                } else {
                  console.warn("No access token available in session");
                }
              }

              // Check if we have an access token
              if (session.tokens?.accessToken) {
                return {
                  Authorization: `Bearer ${session.tokens.accessToken.toString()}`,
                };
              }

              // Return empty headers if no token
              return {};
            } catch (error) {
              console.error("Error getting auth token for API request:", error);
              return {};
            }
          },
        },
      },
    },
  },
  Storage: {
    S3: {
      bucket: s3Bucket,
      region,
    },
  },
};

// Configure Amplify
Amplify.configure(awsConfig);

// Configure token provider
cognitoUserPoolsTokenProvider.setKeyValueStorage({
  setItem: async (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("Failed to set token in storage:", error);
      return false;
    }
  },
  getItem: async (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("Failed to get token from storage:", error);
      return null;
    }
  },
  removeItem: async (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("Failed to remove token from storage:", error);
      return false;
    }
  },
});

// Create a helper function to check and display token info (for debugging)
export const debugToken = async () => {
  if (!import.meta.env.DEV) return;

  try {
    const session = await fetchAuthSession();
    if (session.tokens?.accessToken) {
      const token = session.tokens.accessToken;
      console.log(
        "Access Token Available:",
        token.toString().substring(0, 10) + "..."
      );
      console.log(
        "Token Expiration:",
        new Date(token.payload.exp * 1000).toLocaleString()
      );
    } else {
      console.warn("No access token in session");
    }
  } catch (error) {
    console.error("Error checking token:", error);
  }
};

// Call the debug function immediately
debugToken();

export default awsConfig;
