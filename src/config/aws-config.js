// AWS Configuration for Amplify v6+
import { Amplify } from "aws-amplify";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";

// Amplify configuration
const awsConfig = {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_XXXXXXXXX", // Replace with your actual Cognito User Pool ID
      userPoolClientId: "XXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your App Client ID
      loginWith: {
        email: true,
        username: true,
      },
    },
  },
  API: {
    REST: {
      taskApi: {
        endpoint: "https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod", // Replace with your API Gateway URL
        region: "us-east-1",
      },
    },
  },
  Storage: {
    S3: {
      bucket: "task-manager-uploads", // Replace with your S3 bucket name
      region: "us-east-1",
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
