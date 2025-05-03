import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getTasks } from "../../services/api";
import TaskItem from "./TaskItem";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const result = await getTasks();

        if (result.success) {
          setTasks(result.data);
        } else {
          setError(result.message);
        }
      } catch (error) {
        setError("An unexpected error occurred. Please try again.");
        console.error("Fetch tasks error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

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

  const filteredTasks =
    filter === "all" ? tasks : tasks.filter((task) => task.status === filter);

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

      {error && <div className="error-message">{error}</div>}

      {filteredTasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>No tasks found. Create your first task to get started!</p>
          <Link
            to="/tasks/new"
            className="btn btn-primary"
            style={{ marginTop: "1rem" }}
          >
            Create Task
          </Link>
        </div>
      ) : (
        <div className="task-list">
          {filteredTasks.map((task) => (
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
