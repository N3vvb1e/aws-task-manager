import { post, get, put, del } from "aws-amplify/api";

/**
 * API service for task operations
 */
const apiName = "taskApi";

// Get all tasks for the current user
export const getTasks = async () => {
  try {
    const response = await get(apiName, "/tasks", {});
    return {
      success: true,
      data: response.tasks,
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch tasks",
    };
  }
};

// Get a single task by ID
export const getTaskById = async (taskId) => {
  try {
    const response = await get(apiName, `/tasks/${taskId}`, {});
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch task",
    };
  }
};

// Create a new task
export const createTask = async (taskData) => {
  try {
    const response = await post(apiName, "/tasks", {
      body: taskData,
    });
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to create task",
    };
  }
};

// Update an existing task
export const updateTask = async (taskId, taskData) => {
  try {
    const response = await put(apiName, `/tasks/${taskId}`, {
      body: taskData,
    });
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update task",
    };
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    await del(apiName, `/tasks/${taskId}`, {});
    return {
      success: true,
    };
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete task",
    };
  }
};
