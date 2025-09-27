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

// Teacher Authentication
export const teacherLogin = async (credentials) => {
  return API.post("auth/login", credentials);
};

export const teacherRegister = async (teacherData) => {
  return API.post("teachers/register", teacherData);
};

// Teacher Profile
export const getTeacherProfile = async () => {
  return API.get("teachers/profile");
};

export const updateTeacherProfile = async (profileData) => {
  return API.put("teachers/profile", profileData);
};

// Students Management
export const getAssignedStudents = async () => {
  return API.get("teachers/students");
};

export const getStudentsSummary = async () => {
  return API.get("teachers/students/summary");
};

export const getStudentsBySemester = async (semesterNum) => {
  return API.get(`teachers/students/semester/${semesterNum}`);
};

export const getStudentDetails = async (studentId: number) => {
  const res = await API.get(`teachers/students/${studentId}`);
  return res.data; // return only the data, not full axios response
};

// Questions Management
export const setStudentQuestions = async (studentId, questions) => {
  return API.post(`teachers/students/${studentId}/questions`, questions);
};

export const getStudentQuestions = async (studentId) => {
  return API.get(`teachers/students/${studentId}/questions`);
};

export const updateStudentQuestions = async (studentId, questions) => {
  return API.put(`teachers/students/${studentId}/questions`, questions);
};

// Bulk Questions
export const setBulkQuestions = async (questions) => {
  return API.post("teachers/students/bulk-questions", questions);
};

export const setBulkQuestionsBySemester = async (semesterNum, questions) => {
  return API.post(`teachers/students/semester/${semesterNum}/bulk-questions`, questions);
};

// Marks Management
export const updateStudentMarks = async (studentId, marks) => {
  return API.put(`teachers/students/${studentId}/marks`, marks);
};

export const getStudentMarks = async (studentId) => {
  return API.get(`teachers/students/${studentId}/marks`);
};

// Dashboard & Stats
export const getTeacherDashboard = async () => {
  return API.get("teachers/dashboard");
};

export const getTeacherStats = async () => {
  return API.get("teachers/dashboard/stats");
};

export const getSemesterStats = async (semesterNum) => {
  return API.get(`teachers/students/semester/${semesterNum}/stats`);
};

// Search
export const searchStudents = async (query) => {
  return API.get(`teachers/students/search/${query}`);
};