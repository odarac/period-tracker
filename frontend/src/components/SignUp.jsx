import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

export default function SignUp() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [minCycle, setMinCycle] = useState('');
  const [maxCycle, setMaxCycle] = useState('');
  const [lastPeriodStart, setLastPeriodStart] = useState('');
  const [lastPeriodEnd, setLastPeriodEnd] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!username || !password || !minCycle || !lastPeriodStart) {
      alert("Please fill all fields marked with an asterisk");
      return;
    }
    if (new Date(lastPeriodStart) > new Date() || (lastPeriodEnd && new Date(lastPeriodEnd) > new Date())) {
      alert("Start date or end date cannot be in the future");
      return;
    }
    if (lastPeriodEnd && new Date(lastPeriodStart) > new Date(lastPeriodEnd)) {
      alert("End date must be after the start date");
      return;
    }

    try {
      const data = await apiFetch("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          username, 
          password, 
          min_cycle_length: minCycle,
          max_cycle_length: maxCycle || null,
          last_period_start: lastPeriodStart,
          last_period_end: lastPeriodEnd || null,
        }),
      });

      alert("Sign up success!");
      setUsername('');
      setPassword('');
      setMinCycle('');
      setMaxCycle('');
      setLastPeriodStart('');
      setLastPeriodEnd('');
      navigate('/log-in')
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '600px' }}>
        <h1 className="text-center mb-4">Sign Up</h1>
        <form>
          <div className="mb-3">
            <label className="form-label fw-bold">Username *</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Enter username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Password *</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label d-block fw-bold">
              How long is your typical menstrual cycle?
            </label>
            <div className="d-flex align-items-center flex-wrap">
              <span className="me-2">from *</span>
              <input 
                type="number" 
                className="form-control me-2" 
                style={{ width: '100px' }} 
                value={minCycle}
                onChange={(e) => setMinCycle(e.target.value)}
              />
              <span className="me-2">to</span>
              <input 
                type="number" 
                className="form-control me-2" 
                style={{ width: '100px' }} 
                value={maxCycle}
                onChange={(e) => setMaxCycle(e.target.value)}
              />
              <span>days</span>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label d-block fw-bold">
              When was your last Period?
            </label>
            <label className="form-label d-block fst-italic">
              If you are currently on your period fill only the starting date.
            </label>
            <div className="d-flex align-items-center flex-wrap">
              <span className="me-2">started on *</span>
              <input 
                type="date" 
                className="form-control me-2" 
                style={{ width: '150px' }} 
                value={lastPeriodStart}
                onChange={(e) => setLastPeriodStart(e.target.value)}
              />
              <span className="me-2">ended on </span>
              <input 
                type="date" 
                className="form-control me-2" 
                style={{ width: '150px' }} 
                value={lastPeriodEnd}
                onChange={(e) => setLastPeriodEnd(e.target.value)}
              />
            </div>
          </div>

          <button type="button" className="btn custom-button w-100 text-light" onClick={handleSignUp}>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}