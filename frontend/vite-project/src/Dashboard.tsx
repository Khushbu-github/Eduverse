import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import TeacherDashboard from './teachers/TeacherDashboard';
import StudentDashboard from './students/StudentDashboard';
import HodDashboard from './hod/Hoddashboard';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
    
    getMe(token)
      .then((res) => {
        setUser(res.data);
        setLoading(false);
      })
      .catch(() => {
        localStorage.clear();
        navigate("/login");
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h2>
          <p className="text-gray-600 mb-4">Unable to load user data</p>
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user type
  switch (user.type || user.role) {
    case 'teacher':
      return <TeacherDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'hod':
      return <HodDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Access Denied</h2>
            <p className="text-gray-600 mb-4">Invalid user role: {user.type || user.role}</p>
            <button
              onClick={() => {
                localStorage.clear();
                navigate("/login");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login
            </button>
          </div>
        </div>
      );
  }
};

export default Dashboard;