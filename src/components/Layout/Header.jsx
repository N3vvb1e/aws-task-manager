import { Link } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

const Header = () => {
  const { isAuthenticated, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          Task Manager
        </Link>

        {!loading && (
          <nav className="nav-links">
            {isAuthenticated ? (
              <>
                <Link to="/tasks" className="nav-link">
                  My Tasks
                </Link>
                <button
                  onClick={handleSignOut}
                  className="nav-link"
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">
                  Login
                </Link>
                <Link to="/register" className="nav-link">
                  Register
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
