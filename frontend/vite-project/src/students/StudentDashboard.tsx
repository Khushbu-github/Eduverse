// import { useEffect, useState } from "react";
// import { getMe } from "../api/auth";
// import { useNavigate } from "react-router-dom";
// import Resume from "../src/students/Resume"
// export default function Dashboard() {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       navigate("/login");
//       return;
//     }
//     getMe(token)
//       .then((res) => setUser(res.data))
//       .catch(() => navigate("/login"));
//   }, [navigate]);

//   if (!user) return <p>Loading...</p>;

//   return (
//     <div style={{ padding: "2rem" }}>
//       <h2>Dashboard</h2>
//       <p><strong>Name:</strong> {user.name}</p>
//       <p><strong>Email:</strong> {user.email}</p>
//       <p><strong>Role:</strong> {user.role}</p>
//       <Resume />
//       <button
//         onClick={() => {
//           localStorage.clear();
//           navigate("/login");
//         }}
//       >
//         Logout
//       </button>
//     </div>
//   );
// }
import Resume from "./Resume";
import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../api/student';
import StudentProfile from './StudentProfile';
import StudentMarks from './StudentMarks';
import StudentQuestions from './StudentQuestion'
import StudentInterests from './StudentInterest';
import TeacherAssignment from './TeacherAssignment';
import SemesterUpdate from './SemisterUpdate';
import StudentUpdate from './StudentUpdate';

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await studentAPI.getDashboard();
      setStudentData(data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading) return <div className="p-4">Loading dashboard...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;
  if (!studentData) return <div className="p-4">No data available</div>;

  const tabs = [
    { id: 'profile', label: 'Profile', component: StudentProfile },
    { id: 'marks', label: 'Marks', component: StudentMarks },
    { id: 'questions', label: 'Questions', component: StudentQuestions },
    { id: 'interests', label: 'Interests', component: StudentInterests },
    { id: 'teacher', label: 'Teacher Assignment', component: TeacherAssignment },
    { id: 'semester', label: 'Semester', component: SemesterUpdate },
    {id:'updateStudentdetails',label:'Update Details',component:StudentUpdate},
    {id:'resume',label:'resume',component:Resume}
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600">Welcome, {studentData.name}</p>
            </div>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh
            </button>
          </div>
          
          <nav className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {ActiveComponent && (
          <ActiveComponent 
            studentData={studentData} 
            onUpdate={refreshData}
          />
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;