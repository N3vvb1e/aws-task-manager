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

  // Transform the response if needed
  if (result.success && result.data) {
    return {
      success: true,
      data: result.data.tasks || [],
    };
  }

  return result;
};

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
