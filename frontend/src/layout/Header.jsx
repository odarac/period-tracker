import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const {user, logout} = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-bg-color">
      <div className="container">
        <NavLink to="/" className="navbar-brand fw-bold fst-italic fs-4">
          Period Tracker
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-controls="navbarNav"
          aria-expanded={!isCollapsed}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className={`collapse navbar-collapse ${!isCollapsed ? 'show' : ''}`}
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto">
            {user ? (
              <>
                <li className="nav-item">
                  <NavLink 
                    to="/" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Dashboard
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink 
                    to="/history" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    History
                  </NavLink>
                </li>
                <li className="nav-item">
                  <button 
                    className="nav-link bg-transparent border-0 text-start"
                    style={{ cursor: 'pointer' }}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink 
                    to="/log-in" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Log In
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink 
                    to="/sign-up" 
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    Sign Up
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
