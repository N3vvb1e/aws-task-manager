// src/components/Tasks/TaskList.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTasks } from "../../services/api";
import TaskItem from "./TaskItem";
import { useAuth } from "../Auth/AuthContext";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [retrying, setRetrying] = useState(false);

  const { isAuthenticated, refreshAuth } = useAuth();
  const navigate = useNavigate();

  const fetchTasks = async (showRetrying = false) => {
    try {
      if (showRetrying) {
        setRetrying(true);
      }

      // Verify authentication first
      await refreshAuth();

      const result = await getTasks();
      console.log("Tasks result:", result);

      if (result.success && Array.isArray(result.data)) {
        setTasks(result.data);
        setError("");
      } else if (result.authError) {
        // Handle auth errors
        setError("Authentication error. Please login again.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else if (result.networkError) {
        // Handle network errors
        setError("Network error. Please check your connection and try again.");
        setTasks([]);
      } else {
        // Handle other errors
        setError(result.message || "Failed to fetch tasks");
        setTasks([]);
      }
    } catch (error) {
      console.error("Fetch tasks error:", error);
      setError("An unexpected error occurred. Please try again.");
      setTasks([]);
    } finally {
      setLoading(false);
      setRetrying(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, navigate, refreshAuth]);

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
  };

  const handleTaskStatusChanged = (taskId, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleRetry = () => {
    setLoading(true);
    fetchTasks(true);
  };

  // Safely filter tasks - ensure tasks is always an array
  const filteredTasks = !tasks
    ? []
    : filter === "all"
    ? tasks
    : tasks.filter((task) => task.status === filter);

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h2>My Tasks</h2>

        <div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="form-input"
            style={{ marginRight: "1rem" }}
          >
            <option value="all">All Tasks</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>

          <button
            className="btn btn-primary"
            onClick={() => navigate("/tasks/new")}
          >
            Create New Task
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          {error.includes("Network error") && (
            <button
              className="btn btn-primary"
              style={{ marginLeft: "1rem" }}
              onClick={handleRetry}
              disabled={retrying}
            >
              {retrying ? "Retrying..." : "Retry"}
            </button>
          )}
          {error.includes("authentication") && (
            <button
              className="btn btn-primary"
              style={{ marginLeft: "1rem" }}
              onClick={() => navigate("/login")}
            >
              Go to Login
            </button>
          )}
        </div>
      )}

      {retrying && (
        <div className="loading" style={{ marginTop: "1rem" }}>
          Retrying connection...
        </div>
      )}

      {!retrying &&
      Array.isArray(filteredTasks) &&
      filteredTasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>
            {error
              ? "Could not load tasks."
              : "No tasks found. Create your first task to get started!"}
          </p>
          {!error && (
            <Link
              to="/tasks/new"
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
            >
              Create Task
            </Link>
          )}
        </div>
      ) : (
        <div className="task-list">
          {Array.isArray(filteredTasks) &&
            filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onDeleted={handleTaskDeleted}
                onStatusChanged={handleTaskStatusChanged}
              />
            ))}
        </div>
      )}

      <Link to="/tasks/new" className="add-button" title="Create New Task">
        +
      </Link>
    </div>
  );
};

export default TaskList;
