import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from "react";
import { apiFetch } from "../api";

export default function History() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const [periods, setPeriods] = useState([]);

  useEffect(() => {
    if (!user) {
      navigate('/');  
      return;
    }

    const fetchData = async () => {
      try {
        const response = await apiFetch("/period/history", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${user.token}`
          }
        }); 
        setPeriods(response);  
      } catch (err) {
        alert(err.message);
      }
    };

    fetchData();
  }, [user, navigate]);

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover table-bordered">
        <thead className="custom-header">
          <tr>
            <th>Date Started</th>
            <th>Date Ended</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period.id}>
              <td>{period.start_date}</td>
              <td>{period.end_date ? period.end_date : 'Ongoing'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
