// src/services/api.js
import { apiHandler } from "./apiHandler";

/**
 * API service for task operations
 */
const apiName = "taskApi";

// Get all tasks for the current user
export const getTasks = async () => {
  const result = await apiHandler.get({
    apiName,
    path: "/tasks",
  });

  // Debug the result
  console.log("getTasks API result:", result);

  // Handle successful response with tasks array
  if (result.success && result.data && result.data.tasks) {
    return {
      success: true,
      data: result.data.tasks,
    };
  }

  // Handle successful response but no tasks array
  if (result.success && result.data) {
    // Return an empty array if no tasks property
    console.warn("API returned success but no tasks property");
    return {
      success: true,
      data: [],
    };
  }

  // Pass through network error flag
  if (result.networkError) {
    return {
      success: false,
      message: result.message || "Network error occurred",
      networkError: true,
    };
  }

  // Return the error response
  return result;
};

// Similar pattern for other API functions...
// Get a single task by ID
export const getTaskById = async (taskId) => {
  return apiHandler.get({
    apiName,
    path: `/tasks/${taskId}`,
  });
};

// Create a new task
export const createTask = async (taskData) => {
  return apiHandler.post({
    apiName,
    path: "/tasks",
    options: {
      body: taskData,
    },
  });
};

// Update an existing task
export const updateTask = async (taskId, taskData) => {
  return apiHandler.put({
    apiName,
    path: `/tasks/${taskId}`,
    options: {
      body: taskData,
    },
  });
};

// Delete a task
export const deleteTask = async (taskId) => {
  return apiHandler.delete({
    apiName,
    path: `/tasks/${taskId}`,
  });
};
