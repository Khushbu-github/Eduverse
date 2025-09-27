import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../api/student';

const StudentInterests = ({ studentData, onUpdate }) => {
  const [interests, setInterests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    activity: '',
    level: '',
    achievements: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInterests();
  }, []);

  useEffect(() => {
    if (studentData?.interests) {
      setInterests(studentData.interests);
    }
  }, [studentData]);

  const fetchInterests = async () => {
    try {
      const data = await studentAPI.getInterests();
      setInterests(data);
    } catch (err) {
      setError('Failed to load interests: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({ category: '', activity: '', level: '', achievements: '' });
    setShowAddForm(false);
    setEditingId(null);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.activity.trim()) {
      setError('Activity name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const newInterest = await studentAPI.createInterest(formData);
      setInterests(prev => [...prev, newInterest]);
      resetForm();
      onUpdate();
    } catch (err) {
      setError('Failed to add interest: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (interest) => {
    setFormData({
      category: interest.category || '',
      activity: interest.activity || '',
      level: interest.level || '',
      achievements: interest.achievements || ''
    });
    setEditingId(interest.id);
    setShowAddForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!formData.activity.trim()) {
      setError('Activity name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const updatedInterest = await studentAPI.updateInterest(editingId, formData);
      setInterests(prev => 
        prev.map(interest => 
          interest.id === editingId ? updatedInterest : interest
        )
      );
      resetForm();
      onUpdate();
    } catch (err) {
      setError('Failed to update interest: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (interestId) => {
    if (!window.confirm('Are you sure you want to delete this interest?')) {
      return;
    }

    try {
      setLoading(true);
      await studentAPI.deleteInterest(interestId);
      setInterests(prev => prev.filter(interest => interest.id !== interestId));
      onUpdate();
    } catch (err) {
      setError('Failed to delete interest: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Technology',
    'Sports',
    'Arts & Crafts',
    'Music',
    'Science',
    'Literature',
    'Photography',
    'Gaming',
    'Cooking',
    'Travel',
    'Other'
  ];

  const proficiencyLevels = [
    { value: 'Beginner', label: 'Beginner' },
    { value: 'Intermediate', label: 'Intermediate' },
    { value: 'Advanced', label: 'Advanced' },
    { value: 'Expert', label: 'Expert' }
  ];

  const getProficiencyColor = (level) => {
    switch(level) {
      case 'Beginner': return 'bg-gray-100 text-gray-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-green-100 text-green-800';
      case 'Expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">My Interests</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {showAddForm ? 'Cancel' : 'Add Interest'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">
            {editingId ? 'Edit Interest' : 'Add New Interest'}
          </h3>
          <form onSubmit={editingId ? handleUpdate : handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Activity Name *
              </label>
              <input
                type="text"
                name="activity"
                value={formData.activity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Machine Learning, Web Development, Photography"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proficiency Level
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select proficiency level</option>
                {proficiencyLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Achievements
              </label>
              <textarea
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any notable achievements, certifications, or accomplishments..."
              />
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingId ? 'Update' : 'Add')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {interests.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">🎯</div>
          <p className="text-gray-600">No interests added yet.</p>
          <p className="text-gray-500 text-sm">Add your first interest to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {interests.map(interest => (
            <div key={interest.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{interest.activity}</h3>
                  {interest.category && (
                    <p className="text-sm text-gray-600 mb-2">{interest.category}</p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEdit(interest)}
                    disabled={loading}
                    className="text-blue-500 hover:text-blue-700 p-1"
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(interest.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 p-1"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                {interest.level && (
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getProficiencyColor(interest.level)}`}>
                    {interest.level}
                  </span>
                )}
                
                {interest.achievements && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Achievements:</p>
                    <p className="text-sm text-gray-700">{interest.achievements}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {interests.length > 0 && (
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {proficiencyLevels.map(level => (
              <div key={level.value} className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {interests.filter(i => i.level === level.value).length}
                </div>
                <div className="text-gray-600">{level.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentInterests;