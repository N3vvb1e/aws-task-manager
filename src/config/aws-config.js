// AWS Configuration for Amplify v6+
import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";

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
        // Add this to handle unauthenticated requests (for testing)
        options: {
          headers: async () => {
            try {
              // Try to get auth session
              const session = await cognitoUserPoolsTokenProvider.getTokens();
              return {
                Authorization: `Bearer ${session.accessToken.toString()}`,
              };
            } catch (error) {
              // If not authenticated, proceed without authorization header
              console.log(
                "User not authenticated, proceeding without auth token"
              );
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
    return localStorage.setItem(key, value);
  },
  getItem: async (key) => {
    return localStorage.getItem(key);
  },
  removeItem: async (key) => {
    return localStorage.removeItem(key);
  },
});

export default awsConfig;
