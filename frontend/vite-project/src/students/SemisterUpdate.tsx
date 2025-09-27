import React, { useState } from 'react';
import { studentAPI } from "../../api/student";
const SemesterUpdate = ({ studentData, onUpdate }) => {
  const [selectedSemester, setSelectedSemester] = useState(
    studentData?.semester?.current_semester || 1
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedSemester < 1 || selectedSemester > 8) {
      setError('Please select a valid semester (1-8)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      await studentAPI.updateSemester(selectedSemester);
      setSuccess(true);
      onUpdate();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to update semester: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

  const getSemesterStatus = (sem) => {
    const current = studentData?.semester?.current_semester || 1;
    if (sem < current) return 'completed';
    if (sem === current) return 'current';
    return 'upcoming';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'current': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return '✓';
      case 'current': return '📚';
      case 'upcoming': return '⏳';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Semester Management</h2>
      
      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Current Semester</h3>
          <div className="flex items-center space-x-2">
            <span className="text-blue-600">📚</span>
            <span className="text-gray-700">
              Semester <strong>{studentData?.semester?.current_semester || 'Not Set'}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Semester Overview Grid */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Semester Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {semesters.map(sem => {
            const status = getSemesterStatus(sem);
            return (
              <div
                key={sem}
                className={`border-2 rounded-lg p-3 text-center ${getStatusColor(status)}`}
              >
                <div className="text-lg font-bold">
                  {getStatusIcon(status)} Sem {sem}
                </div>
                <div className="text-xs capitalize mt-1">
                  {status}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Update Form */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">Update Current Semester</h3>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Semester updated successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Current Semester *
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(parseInt(e.target.value))}
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {semesters.map(sem => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Update this when you advance to a new semester
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Semester'}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Academic Progress</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Completed Semesters:</span>
                <span className="font-medium">{(studentData?.semester?.current_semester || 1) - 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Semester:</span>
                <span className="font-medium">{studentData?.semester?.current_semester || 1}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining Semesters:</span>
                <span className="font-medium">{8 - (studentData?.semester?.current_semester || 1)}</span>
              </div>
              <div className="flex justify-between">
                <span>Progress:</span>
                <span className="font-medium">
                  {Math.round(((studentData?.semester?.current_semester || 1) / 8) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-800 mb-2">Important Notes</h4>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>• Update your semester at the beginning of each term</li>
              <li>• This affects your marks tracking and academic records</li>
              <li>• Contact your teacher if you need to make corrections</li>
              <li>• Semester updates cannot be undone easily</li>
            </ul>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-3">Academic Journey</h4>
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${((studentData?.semester?.current_semester || 1) / 8) * 100}%`
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Start</span>
              <span>Sem {studentData?.semester?.current_semester || 1} of 8</span>
              <span>Graduate</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SemesterUpdate;