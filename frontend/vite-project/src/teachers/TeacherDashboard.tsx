import React, { useState, useEffect } from 'react';
import { 
  getTeacherProfile, 
  getStudentsBySemester, 
  getStudentDetails,
  setBulkQuestionsBySemester,
  getSemesterStats 
} from '../../api/teacher';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showBulkQuestions, setShowBulkQuestions] = useState(false);
  const [semesterStats, setSemesterStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const [bulkQuestions, setBulkQuestions] = useState({
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: ''
  });
  const nav = useNavigate();

  useEffect(() => {
    loadTeacherProfile();
    loadStudentsBySemester(selectedSemester);
    loadSemesterStats(selectedSemester);
  }, [selectedSemester]);

  const loadTeacherProfile = async () => {
    try {
      const response = await getTeacherProfile();
      setTeacher(response.data);
    } catch (error) {
      console.error('Error loading teacher profile:', error);
    }
  };

  const loadStudentsBySemester = async (semester) => {
    try {
      setLoading(true);
      const response = await getStudentsBySemester(semester);
      setStudents(response.data);
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSemesterStats = async (semester) => {
    try {
      const response = await getSemesterStats(semester);
      setSemesterStats(response.data);
    } catch (error) {
      console.error('Error loading semester stats:', error);
    }
  };

  const handleStudentClick = async (studentId) => {
    try {
      nav(`/student/${studentId}`);
    } catch (error) {
      console.error('Error loading student details:', error);
    }
  };

  const handleBulkQuestionsSubmit = async (e) => {
    e.preventDefault();
    try {
      await setBulkQuestionsBySemester(selectedSemester, bulkQuestions);
      alert('Questions assigned to all students in semester ' + selectedSemester);
      setShowBulkQuestions(false);
      setBulkQuestions({
        question1: '',
        question2: '',
        question3: '',
        question4: '',
        question5: ''
      });
    } catch (error) {
      console.error('Error setting bulk questions:', error);
      alert('Error assigning questions');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    window.location.href = '/login';
  };

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Manage your students and track their progress</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Teacher Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full w-24 h-24 flex items-center justify-center shadow-lg">
                <span className="text-4xl font-bold text-white">
                  {teacher.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{teacher.name}</h2>
                <div className="space-y-1.5">
                  <p className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {teacher.email}
                  </p>
                  <p className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="font-semibold">{teacher.students?.length || 0}</span> Total Students
                  </p>
                </div>
              </div>
            </div>
            
            {semesterStats && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Semester {selectedSemester} Stats
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Students:</span>
                    <span className="font-bold text-gray-900">{semesterStats.total_students}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">With Questions:</span>
                    <span className="font-bold text-green-600">{semesterStats.students_with_questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">With Marks:</span>
                    <span className="font-bold text-blue-600">{semesterStats.students_with_marks}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Semester Selection & Students Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Semester Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Select Semester</h3>
              <button
                onClick={() => setShowBulkQuestions(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Assign Questions to Semester {selectedSemester}</span>
              </button>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`p-4 text-center rounded-xl font-semibold transition-all transform hover:scale-105 ${
                    selectedSemester === sem
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                  }`}
                >
                  <div className="text-lg">Sem</div>
                  <div className="text-2xl">{sem}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Students List */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Semester {selectedSemester} Students
              <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {students.length}
              </span>
            </h3>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 font-medium">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No students found in this semester</p>
                <p className="text-gray-400 text-sm mt-2">Students will appear here once they are enrolled</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {students.map(student => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentClick(student.id)}
                    className="group relative bg-gradient-to-br from-white to-gray-50 p-5 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                        <span className="text-lg font-bold text-white">
                          {student.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {student.name}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">{student.usn}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600 truncate">
                      <svg className="w-4 h-4 mr-1.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {student.email}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Questions Modal */}
      {showBulkQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-7 h-7 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Assign Questions to Semester {selectedSemester}
              </h3>
              <p className="text-blue-100 mt-1">Set questions for all students in this semester</p>
            </div>
            
            <form onSubmit={handleBulkQuestionsSubmit} className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-5">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                      <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs mr-2">
                        {num}
                      </span>
                      Question {num}
                    </label>
                    <textarea
                      value={bulkQuestions[`question${num}`]}
                      onChange={(e) => setBulkQuestions({
                        ...bulkQuestions,
                        [`question${num}`]: e.target.value
                      })}
                      className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      rows="3"
                      placeholder={`Enter question ${num}...`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold"
                >
                  Assign Questions
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkQuestions(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;