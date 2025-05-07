// src/components/Tasks/TaskForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask } from "../../services/api";

const TaskForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title) {
      setError("Task title is required");
      return;
    }

    setLoading(true);
    setError("");

    const taskData = {
      title,
      description,
      dueDate: dueDate || null,
      priority,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await createTask(taskData);

      if (result.success) {
        navigate("/tasks");
      } else if (result.authError) {
        setError("Authentication error. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (result.networkError) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(result.message || "Failed to create task");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Create task error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    setRetrying(true);

    const taskData = {
      title,
      description,
      dueDate: dueDate || null,
      priority,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const result = await createTask(taskData);

      if (result.success) {
        navigate("/tasks");
      } else if (result.authError) {
        setError("Authentication error. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      } else if (result.networkError) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(result.message || "Failed to create task");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Create task error:", error);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">Create New Task</h2>

      {error && (
        <div className="error-message">
          {error}
          {error.includes("Network error") && (
            <button
              onClick={handleRetry}
              className="btn btn-primary"
              style={{ marginLeft: "1rem" }}
              disabled={retrying}
            >
              {retrying ? "Retrying..." : "Retry"}
            </button>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title*
          </label>
          <input
            type="text"
            id="title"
            className="form-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading || retrying}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            className="form-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || retrying}
            rows={4}
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="dueDate" className="form-label">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            className="form-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={loading || retrying}
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="form-label">
            Priority
          </label>
          <select
            id="priority"
            className="form-input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            disabled={loading || retrying}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || retrying}
          >
            {loading ? "Creating..." : "Create Task"}
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/tasks")}
            disabled={loading || retrying}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
