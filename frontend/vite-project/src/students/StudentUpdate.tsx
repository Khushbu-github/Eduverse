import React, { useState, useEffect } from 'react';
import { studentAPI } from "../../api/student";

const StudentUpdate = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    usn: '',
    leetcodeurl: '',
    githuburl: '',
    teacher_id: null
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch existing profile data on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setInitialLoading(true);
        const profileData = await studentAPI.getProfile();
        
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          usn: profileData.usn || '',
          leetcodeurl: profileData.leetcodeurl || '',
          githuburl: profileData.githuburl || '',
          teacher_id: profileData.teacher_id || null
        });
      } catch (err) {
        setError(`Failed to load profile data: ${err.message}`);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);
      
      // Convert teacher_id to number if provided, otherwise set to null
      const submitData = {
        ...formData,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null
      };

      // Use the proper updateProfile endpoint from the API
      const result = await studentAPI.updateProfile(submitData);
      setSuccess(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching initial data
  if (initialLoading) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile data...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="text-green-500 text-4xl mb-4">✓</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Updated Successfully!</h2>
          <p className="text-gray-600">Your details have been updated successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Update Profile</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            USN *
          </label>
          <input
            type="text"
            name="usn"
            value={formData.usn}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your USN"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LeetCode URL (Optional)
          </label>
          <input
            type="url"
            name="leetcodeurl"
            value={formData.leetcodeurl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://leetcode.com/username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GitHub URL (Optional)
          </label>
          <input
            type="url"
            name="githuburl"
            value={formData.githuburl}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://github.com/username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teacher ID (Optional)
          </label>
          <input
            type="number"
            name="teacher_id"
            value={formData.teacher_id || ''}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter teacher ID if known"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Details'}
        </button>
      </form>
    </div>
  );
};

export default StudentUpdate;