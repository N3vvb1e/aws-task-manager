// Lambda function to update a task
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
          "Access-Control-Allow-Origin": "*",
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

    // Parse the updated task data from the request body
    const taskData = JSON.parse(event.body);

    // Basic validation
    if (!taskData.title) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "Task title is required",
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
          message: "You do not have permission to update this task",
        }),
      };
    }

    // Update the task with the new data, preserving the userId and id
    const updatedTask = {
      id: taskId,
      userId: userId,
      updatedAt: new Date().toISOString(),
      ...taskData,
    };

    // Write to DynamoDB
    const updateParams = {
      TableName: TABLE_NAME,
      Item: updatedTask,
    };

    await dynamoDB.put(updateParams).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Task updated successfully",
        task: updatedTask,
      }),
    };
  } catch (error) {
    console.error("Error updating task:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Error updating task",
        error: error.message,
      }),
    };
  }
};
