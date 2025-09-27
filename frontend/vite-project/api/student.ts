// student_api.js - API service for student operations

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

export const studentAPI = {
  // Authentication
  register: async (studentData) => {
    const response = await fetch(`${API_BASE_URL}students/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData)
    });
    return handleResponse(response);
  },

  // Profile Management
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}students/profile`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
updateProfile: async (profileData) => {
    const response = await fetch(`${API_BASE_URL}students/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return handleResponse(response);
  },

  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}students/dashboard`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Teacher Assignment
  assignTeacher: async (teacherId) => {
    const response = await fetch(`${API_BASE_URL}students/assign-teacher`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ teacher_id: teacherId })
    });
    return handleResponse(response);
  },

  // Semester Management
  updateSemester: async (currentSemester) => {
    const response = await fetch(`${API_BASE_URL}students/semester`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ current_semester: currentSemester })
    });
    return handleResponse(response);
  },

  // Marks Management
  getMarks: async () => {
    const response = await fetch(`${API_BASE_URL}students/marks`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateMarks: async (marksData) => {
    const response = await fetch(`${API_BASE_URL}students/marks`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(marksData)
    });
    return handleResponse(response);
  },

  // Questions Management
  getQuestions: async () => {
    const response = await fetch(`${API_BASE_URL}students/questions`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateAnswers: async (answersData) => {
    const response = await fetch(`${API_BASE_URL}students/questions/answers`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(answersData)
    });
    return handleResponse(response);
  },

  // Interests Management
  getInterests: async () => {
    const response = await fetch(`${API_BASE_URL}students/interests`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  createInterest: async (interestData) => {
    const response = await fetch(`${API_BASE_URL}students/interests`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(interestData)
    });
    return handleResponse(response);
  },

  updateInterest: async (interestId, interestData) => {
    const response = await fetch(`${API_BASE_URL}students/interests/${interestId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(interestData)
    });
    return handleResponse(response);
  },

  deleteInterest: async (interestId) => {
    const response = await fetch(`${API_BASE_URL}students/interests/${interestId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

getCurrentSemester: async () => {
    const response = await fetch(`${API_BASE_URL}students/getcurrentsemister`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
getAllTeachers: async () => {
    const response = await fetch(`${API_BASE_URL}students/getteachers`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};