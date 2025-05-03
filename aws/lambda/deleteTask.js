// Lambda function to delete a task
const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TASKS_TABLE;

exports.handler = async (event) => {
  try {
    // Get the user ID from the Cognito-authenticated request
    const userId = event.requestContext.authorizer.claims.sub;

    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*", // Using * for development
          "Access-Control-Allow-Headers":
            "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
          "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "Unauthorized access",
        }),
      };
    }

    // Get task ID from path parameters
    const taskId = event.pathParameters.id;

    if (!taskId) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "Task ID is required",
        }),
      };
    }

    // First, get the task to ensure it belongs to the user
    const getParams = {
      TableName: TABLE_NAME,
      Key: {
        id: taskId,
      },
    };

    const taskResult = await dynamoDB.get(getParams).promise();

    // Check if task exists
    if (!taskResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "Task not found",
        }),
      };
    }

    // Check if task belongs to the user
    if (taskResult.Item.userId !== userId) {
      return {
        statusCode: 403,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "You do not have permission to delete this task",
        }),
      };
    }

    // Delete the task
    const deleteParams = {
      TableName: TABLE_NAME,
      Key: {
        id: taskId,
      },
    };

    await dynamoDB.delete(deleteParams).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Task deleted successfully",
      }),
    };
  } catch (error) {
    console.error("Error deleting task:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Error deleting task",
        error: error.message,
      }),
    };
  }
};
