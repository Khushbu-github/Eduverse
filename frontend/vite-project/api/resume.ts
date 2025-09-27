const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ResumeAPI {
  constructor() {
    this.baseURL = `${API_BASE_URL}students`;
  }

  // Get authorization headers with token
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Upload resume for first time
  async uploadResume(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseURL}/upload/resume`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload resume');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload resume error:', error);
      throw error;
    }
  }

  // Update existing resume with new file
  async updateResume(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseURL}update/resume`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update resume');
      }

      return await response.json();
    } catch (error) {
      console.error('Update resume error:', error);
      throw error;
    }
  }

  // Check if resume exists (optional helper method)
  async hasResume() {
    try {
      const response = await fetch(`${this.baseURL}resume`, {
        method: 'GET',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new ResumeAPI();