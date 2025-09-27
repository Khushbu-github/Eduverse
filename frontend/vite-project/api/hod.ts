import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add token to requests automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// HOD Authentication
export const hodLogin = async (credentials) => {
  return API.post("auth/login", credentials);
};

export const hodRegister = async (hodData) => {
  return API.post("hod/register", hodData);
};

// HOD Profile
export const getHodProfile = async () => {
  return API.get("hod/profile");
};

// Student Management
export const getAllStudents = async () => {
  return API.get("hod/students");
};

export const getStudentsBySemester = async (semesterNum) => {
  return API.get(`hod/students/semester/${semesterNum}`);
};

export const getStudentsSummary = async () => {
  return API.get("hod/students/summary");
};

export const getStudentDetails = async (studentId) => {
  return API.get(`hod/students/${studentId}`);
};

// Teacher Management
export const getAllTeachers = async () => {
  return API.get("hod/teachers");
};

export const getTeacherDetails = async (teacherId) => {
  return API.get(`hod/teachers/${teacherId}`);
};

export const getTeacherStudents = async (teacherId) => {
  return API.get(`hod/teachers/${teacherId}/students`);
};

// Dashboard & Statistics
export const getHodDashboardStats = async () => {
  return API.get("hod/dashboard/stats");
};

export const getHodDashboard = async () => {
  return API.get("hod/dashboard");
};

// Search Functions
export const searchStudents = async (query) => {
  return API.get(`hod/students/search/${query}`);
};

export const searchTeachers = async (query) => {
  return API.get(`hod/teachers/search/${query}`);
};

// Administrative Functions
export const updateStudentMarksAdmin = async (studentId, marks) => {
  return API.put(`hod/students/${studentId}/marks`, marks);
};

export const setStudentQuestionsAdmin = async (studentId, questions) => {
  return API.post(`hod/students/${studentId}/questions`, questions);
};

// Bulk Operations
export const setBulkQuestionsBySemesterAdmin = async (semesterNum, questions) => {
  return API.post(`hod/students/semester/${semesterNum}/bulk-questions`, questions);
};

// Reports & Analytics
export const getStudentsWithoutTeachers = async () => {
  return API.get("hod/reports/students-without-teachers");
};

export const getTeachersStudentCount = async () => {
  return API.get("hod/reports/teachers-student-count");
};

export const getSemesterWiseDistribution = async () => {
  return API.get("hod/reports/semester-wise-distribution");
};