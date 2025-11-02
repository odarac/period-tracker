import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({username, password}),
      });

      login(username, data.token);
      setUsername('');
      setPassword('');
      navigate('/')
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="text-center mb-4">Log In</h1>
        <form>
          <div className="mb-3">
            <label className="form-label fw-bold">Username</label>
            <input 
              type="text" 
              className="form-control" 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username" 
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <input 
              type="password" 
              className="form-control" 
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password" 
            />
          </div>

          <button type="button" className="btn custom-button w-100 text-light" onClick={handleLogin}>
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}