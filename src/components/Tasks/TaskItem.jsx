import { useState } from "react";
import { deleteTask, updateTask } from "../../services/api";

const TaskItem = ({ task, onDeleted, onStatusChanged }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await deleteTask(task.id);

      if (result.success) {
        onDeleted(task.id);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An unexpected error occurred.");
      console.error("Delete task error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = task.status === "completed" ? "pending" : "completed";

    setLoading(true);
    setError("");

    try {
      const result = await updateTask(task.id, {
        ...task,
        status: newStatus,
      });

      if (result.success) {
        onStatusChanged(task.id, newStatus);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("An unexpected error occurred.");
      console.error("Update task error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const priorityColor = {
    low: "#4caf50",
    medium: "#ff9800",
    high: "#f44336",
  };

  return (
    <div className="task-card">
      <div
        className={`task-status status-${task.status}`}
        style={{ marginBottom: "0.5rem" }}
      >
        {task.status === "completed" ? "Completed" : "Pending"}
      </div>

      <h3 className="task-title">{task.title}</h3>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div
        style={{ display: "flex", marginBottom: "0.75rem", fontSize: "0.9rem" }}
      >
        <div style={{ marginRight: "1rem" }}>
          <strong>Due:</strong> {formatDate(task.dueDate)}
        </div>

        <div>
          <strong>Priority:</strong>{" "}
          <span style={{ color: priorityColor[task.priority] }}>
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="task-actions">
        <button
          className={`btn ${
            task.status === "completed" ? "btn-secondary" : "btn-primary"
          }`}
          onClick={handleToggleStatus}
          disabled={loading}
          style={{ fontSize: "0.9rem", padding: "0.5rem 0.75rem" }}
        >
          {task.status === "completed" ? "Mark Pending" : "Complete"}
        </button>

        <button
          className="btn btn-danger"
          onClick={handleDelete}
          disabled={loading}
          style={{ fontSize: "0.9rem", padding: "0.5rem 0.75rem" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
