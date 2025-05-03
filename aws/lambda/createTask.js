// Lambda function to create a new task
const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
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

    // Parse the task data from the request body
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

    // Create a new task item with user ID and generated task ID
    const taskId = uuidv4();
    const timestamp = new Date().toISOString();

    const newTask = {
      id: taskId,
      userId: userId,
      createdAt: timestamp,
      updatedAt: timestamp,
      ...taskData,
    };

    // Write to DynamoDB
    const params = {
      TableName: TABLE_NAME,
      Item: newTask,
    };

    await dynamoDB.put(params).promise();

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Task created successfully",
        task: newTask,
      }),
    };
  } catch (error) {
    console.error("Error creating task:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Error creating task",
        error: error.message,
      }),
    };
  }
};
