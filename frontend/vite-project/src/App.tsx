import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../src/auth/Login";
import Register from "../src/auth/Register";
import Dashboard from "./Dashboard";
import StudentDashboardForAnalysisi from "./StudentDashboardForAnalysisi";
import StudentDashboardforhod from "./hod/StudentDashboardforhod";
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/student/:id" element={<StudentDashboardForAnalysisi />} />
        <Route path="/students/:id" element={<StudentDashboardforhod/>}/>
      </Routes>
    </Router>
  );
}
