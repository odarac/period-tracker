import { useState, useEffect } from "react"
import { useAuth } from '../context/AuthContext';
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api";

export default function Dashboard() {
  const {user} = useAuth();
  const navigate = useNavigate();

  const [phase, setPhase] = useState('');
  const [minStartDate, setMinStartDate] = useState('');
  const [maxStartDate, setMaxStartDate] = useState('');
  const [minDays, setMinDays] = useState('');
  const [maxDays, setMaxDays] = useState('');
  const [nthDate, setNthDate] = useState('');
  const [latePeriod, setLatePeriod] = useState(false);

  const [onPeriod, setOnPeriod] = useState(false);

  const fetchLastPeriod = async () => {
    try {
      const data = await apiFetch("/period/last", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        }
      });
      setPhase(data.phase);
      if (data.numDaysSinceStart) {
        setNthDate(data.numDaysSinceStart);
        setOnPeriod(true);
      } else {
        setMinStartDate(data.minPredictedNextStart);
        setMinDays(Math.max(0, data.minDaysToPeriod));
        if (data.maxPredictedNextStart) {
          setMaxStartDate(data.maxPredictedNextStart);
        }
        
        if (data.maxDaysToPeriod) {
          setMaxDays(Math.max(0, data.maxDaysToPeriod));
        }
        
        const today = new Date();
        const maxStart = (data.maxPredictedNextStart) 
                          ? new Date(data.maxPredictedNextStart) 
                          : new Date(data.minPredictedNextStart);
        if (today > maxStart) {
          setLatePeriod(true);
        }
        setOnPeriod(false);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  useEffect(() => {
    if (!user) return; 

    fetchLastPeriod();
  }, [user]);

  const startPeriod = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await apiFetch("/period/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          startDate: today,
        }),
      });
      await fetchLastPeriod();
      setLatePeriod(false);
    } catch (err) {
      alert(err.message);
    }
  }

  const endPeriod = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await apiFetch("/period/end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`
        },
        body: JSON.stringify({
          endDate: today,
        }),
      });
      await fetchLastPeriod();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center">
      <div className="card p-4 shadow-sm" style={{ width: '100%', maxWidth: '600px' }}>
        {user && !onPeriod && !latePeriod &&
          <div>
            <h1 className="text-center mb-4">
              Your period starts in {minDays} {maxDays ? `to ${maxDays}` : ''} days
            </h1>
            <h1 className="text-center mb-4">
              Your period will start {maxStartDate ? `on a date between ${minStartDate} to ${maxStartDate}` : `on ${minStartDate}`}
            </h1>
            <h1 className="text-center mb-4">You are currently in your {phase}</h1>
            <button type="button" className="btn custom-button w-100 text-light" onClick={startPeriod}>
              Period Started
            </button>
          </div>
        }

        {user && !onPeriod && latePeriod &&
          <div>
            <h1 className="text-center mb-4 text-danger">Your period is late</h1>
            <h1 className="text-center mb-4">
              Your period should've started {maxStartDate ? `on a date between ${minStartDate} to ${maxStartDate}` : `on ${minStartDate}`}
            </h1>
            <h1 className="text-center mb-4">You are currently in your {phase}</h1>
            <button type="button" className="btn custom-button w-100 text-light" onClick={startPeriod}>
              Period Started
            </button>
          </div>
        }

        {user && onPeriod && 
          <div>
            <h1 className="text-center mb-4">It's day {nthDate} of your period</h1>
            <button type="button" className="btn custom-button w-100 text-light" onClick={endPeriod}>
              Period Ended 
            </button>
          </div>
        }

        {!user &&
          <div>
            <h1 className="text-center mb-4">Log In or Sign Up to get Started</h1>
            <div className="d-flex align-items-center flex-wrap">
              <button type="button" className="btn custom-button text-light flex-fill me-2" onClick={() => navigate('/log-in')}>
                Log In
              </button>
              <button type="button" className="btn custom-button text-light flex-fill me-2" onClick={() => navigate('/sign-up')}>
                Sign Up
              </button>
            </div>
          </div>        
        }
      </div>
    </div>
  )
}