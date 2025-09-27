import React, { useState, useEffect } from 'react';
import { 
  getTeacherProfile, 
  getStudentsBySemester, 
  getStudentDetails,
  setBulkQuestionsBySemester,
  getSemesterStats 
} from '../../api/teacher';
import { useNavigate } from 'react-router-dom';
import StudentDashboard from '../students/StudentDashboard';
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
  const nav=useNavigate();
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
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600">Welcome, {teacher.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Teacher Profile & Semester Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Teacher Profile</h2>
            <div className="space-y-2 mb-6">
              <p><strong>Name:</strong> {teacher.name}</p>
              <p><strong>Email:</strong> {teacher.email}</p>
              <p><strong>Total Students:</strong> {teacher.students?.length || 0}</p>
            </div>

            <h3 className="text-lg font-semibold mb-3">Select Semester</h3>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <button
                  key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`p-2 text-center rounded ${
                    selectedSemester === sem
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  Sem {sem}
                </button>
              ))}
            </div>

            {/* Semester Stats */}
            {semesterStats && (
              <div className="bg-gray-50 p-3 rounded mb-4">
                <h4 className="font-semibold">Semester {selectedSemester} Stats</h4>
                <p>Total Students: {semesterStats.total_students}</p>
                <p>With Questions: {semesterStats.students_with_questions}</p>
                <p>With Marks: {semesterStats.students_with_marks}</p>
              </div>
            )}

            <button
              onClick={() => setShowBulkQuestions(true)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Assign Questions to Semester {selectedSemester}
            </button>
          </div>

          {/* Middle Panel - Students List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              Semester {selectedSemester} Students ({students.length})
            </h2>
            
            {loading ? (
              <div>Loading students...</div>
            ) : students.length === 0 ? (
              <div className="text-gray-500">No students found in this semester</div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {students.map(student => (
                  <div
                    key={student.id}
                    onClick={() => handleStudentClick(student.id)}
                    className="p-3 border rounded cursor-pointer hover:bg-gray-50 hover:border-blue-300"
                  >
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.usn}</div>
                    <div className="text-sm text-gray-500">{student.email}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel - Student Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Student Details</h2>
            
            {selectedStudent ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                  <p className="text-gray-600">{selectedStudent.usn}</p>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                </div>

                {selectedStudent.semester && (
                  <div>
                    <h4 className="font-medium">Academic Info</h4>
                    <p>Current Semester: {selectedStudent.semester.current_semester}</p>
                  </div>
                )}

                {selectedStudent.marks && (
                  <div>
                    <h4 className="font-medium">Marks</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(selectedStudent.marks).map(([key, value]) => 
                        key.includes('sem') && value && (
                          <div key={key}>
                            {key.replace('_marks', '').toUpperCase()}: {value}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {selectedStudent.questions && (
                  <div>
                    <h4 className="font-medium">Questions & Answers</h4>
                    <div className="space-y-2 text-sm">
                      {[1, 2, 3, 4, 5].map(num => {
                        const question = selectedStudent.questions[`question${num}`];
                        const answer = selectedStudent.questions[`answer${num}`];
                        return (question || answer) && (
                          <div key={num} className="border-l-2 border-gray-300 pl-2">
                            <p><strong>Q{num}:</strong> {question || 'Not set'}</p>
                            <p><strong>A{num}:</strong> {answer || 'Not answered'}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedStudent.resume && (
                  <div>
                    <h4 className="font-medium">Resume Info</h4>
                    <div className="text-sm space-y-1">
                      {selectedStudent.resume.skills && (
                        <p><strong>Skills:</strong> {selectedStudent.resume.skills}</p>
                      )}
                      {selectedStudent.resume.projects && (
                        <p><strong>Projects:</strong> {selectedStudent.resume.projects}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="text-sm">
                  <p><strong>GitHub:</strong> {selectedStudent.githuburl || 'Not provided'}</p>
                  <p><strong>LeetCode:</strong> {selectedStudent.leetcodeurl || 'Not provided'}</p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">
                Click on a student to view their details
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Questions Modal */}
      {showBulkQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Assign Questions to Semester {selectedSemester}
            </h3>
            <form onSubmit={handleBulkQuestionsSubmit}>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num}>
                    <label className="block text-sm font-medium mb-1">
                      Question {num}
                    </label>
                    <textarea
                      value={bulkQuestions[`question${num}`]}
                      onChange={(e) => setBulkQuestions({
                        ...bulkQuestions,
                        [`question${num}`]: e.target.value
                      })}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder={`Enter question ${num}...`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Assign Questions
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkQuestions(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
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