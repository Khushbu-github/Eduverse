import React, { useState, useEffect } from 'react';
import {
  getHodProfile,
  getHodDashboard,
  getStudentsBySemester,
  getAllTeachers,
  getStudentDetails,
  getTeacherDetails,
  getTeacherStudents,
  setBulkQuestionsBySemesterAdmin,
  setStudentQuestionsAdmin,
  updateStudentMarksAdmin,
  getStudentsWithoutTeachers,
  getTeachersStudentCount,
  searchStudents,
  searchTeachers
} from '../../api/hod';
import { useNavigate } from 'react-router-dom';
const HodDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [hod, setHod] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [studentsWithoutTeachers, setStudentsWithoutTeachers] = useState([]);
  const [teacherStats, setTeacherStats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBulkQuestions, setShowBulkQuestions] = useState(false);
  const [showStudentQuestions, setShowStudentQuestions] = useState(false);
  const [showStudentMarks, setShowStudentMarks] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState({
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: ''
  });
  const [studentQuestions, setStudentQuestions] = useState({
    question1: '',
    question2: '',
    question3: '',
    question4: '',
    question5: ''
  });
  const [studentMarks, setStudentMarks] = useState({
    sem1_marks: '',
    sem2_marks: '',
    sem3_marks: '',
    sem4_marks: '',
    sem5_marks: '',
    sem6_marks: '',
    sem7_marks: '',
    sem8_marks: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      loadStudentsBySemester(selectedSemester);
    } else if (activeTab === 'teachers') {
      loadAllTeachers();
    } else if (activeTab === 'reports') {
      loadReports();
    }
  }, [activeTab, selectedSemester]);
const nav= useNavigate();
  const loadInitialData = async () => {
    try {
      const [hodResponse, dashboardResponse] = await Promise.all([
        getHodProfile(),
        getHodDashboard()
      ]);
      setHod(hodResponse.data);
      setDashboardData(dashboardResponse.data);
    } catch (error) {
      console.error('Error loading initial data:', error);
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

  const loadAllTeachers = async () => {
    try {
      setLoading(true);
      const response = await getAllTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const [studentsResponse, statsResponse] = await Promise.all([
        getStudentsWithoutTeachers(),
        getTeachersStudentCount()
      ]);
      setStudentsWithoutTeachers(studentsResponse.data);
      setTeacherStats(statsResponse.data);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleStudentClick = async (studentId) => {
    try {
      const response = await getStudentDetails(studentId);
      setSelectedStudent(response.data);
    } catch (error) {
      console.error('Error loading student details:', error);
    }
  };

  const handleTeacherClick = async (teacherId) => {
    try {
      const [teacherResponse, studentsResponse] = await Promise.all([
        getTeacherDetails(teacherId),
        getTeacherStudents(teacherId)
      ]);
      setSelectedTeacher(teacherResponse.data);
      setTeacherStudents(studentsResponse.data);
    } catch (error) {
      console.error('Error loading teacher details:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      setLoading(true);
      if (activeTab === 'students') {
        const response = await searchStudents(searchQuery);
        setStudents(response.data);
      } else if (activeTab === 'teachers') {
        const response = await searchTeachers(searchQuery);
        setTeachers(response.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkQuestionsSubmit = async (e) => {
    e.preventDefault();
    try {
      await setBulkQuestionsBySemesterAdmin(selectedSemester, bulkQuestions);
      alert(`Questions assigned to all students in semester ${selectedSemester}`);
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

  const handleStudentQuestionsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await setStudentQuestionsAdmin(selectedStudent.id, studentQuestions);
      alert(`Questions set for ${selectedStudent.name}`);
      setShowStudentQuestions(false);
      setStudentQuestions({
        question1: '',
        question2: '',
        question3: '',
        question4: '',
        question5: ''
      });
    } catch (error) {
      console.error('Error setting student questions:', error);
      alert('Error setting questions');
    }
  };

  const handleStudentMarksSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      const marksData = Object.fromEntries(
        Object.entries(studentMarks).filter(([_, value]) => value !== '')
      );
      await updateStudentMarksAdmin(selectedStudent.id, marksData);
      alert(`Marks updated for ${selectedStudent.name}`);
      setShowStudentMarks(false);
      setStudentMarks({
        sem1_marks: '',
        sem2_marks: '',
        sem3_marks: '',
        sem4_marks: '',
        sem5_marks: '',
        sem6_marks: '',
        sem7_marks: '',
        sem8_marks: ''
      });
    } catch (error) {
      console.error('Error updating marks:', error);
      alert('Error updating marks');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!hod || !dashboardData) {
    return <div className="p-4">Loading...</div>;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'students', label: 'Students' },
    { id: 'teachers', label: 'Teachers' },
    { id: 'reports', label: 'Reports' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">HOD Dashboard</h1>
            <p className="text-gray-600">Welcome, {hod.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Logout
          </button>
        </div>
        {/* Tab Navigation */}
        <nav className="flex space-x-8 mt-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Total Students</h3>
              <p className="text-3xl font-bold text-blue-600">{dashboardData.total_students}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Total Teachers</h3>
              <p className="text-3xl font-bold text-green-600">{dashboardData.total_teachers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">Active Semesters</h3>
              <p className="text-3xl font-bold text-purple-600">
                {Object.keys(dashboardData.stats.students_by_semester).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-2">System Status</h3>
              <p className="text-lg font-bold text-green-600">Active</p>
            </div>
            {/* Semester Distribution */}
            <div className="col-span-full bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Students by Semester</h3>
              <div className="grid grid-cols-8 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <div key={sem} className="text-center">
                    <div className="bg-gray-100 rounded p-3">
                      <p className="text-sm font-medium">Sem {sem}</p>
                      <p className="text-xl font-bold text-blue-600">
                        {dashboardData.stats.students_by_semester[`sem${sem}`] || 0}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Student Management</h3>
              {/* Semester Selection */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Select Semester</h4>
                <div className="grid grid-cols-4 gap-2">
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
              </div>
              {/* Search */}
              <div className="mb-4">
                <h4 className="font-medium mb-2">Search Students</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, email, or USN..."
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>
              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => setShowBulkQuestions(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Bulk Assign Questions (Sem {selectedSemester})
                </button>
                <button
                  onClick={() => loadStudentsBySemester(selectedSemester)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Refresh Students
                </button>
              </div>
            </div>
            {/* Middle Panel - Students List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Semester {selectedSemester} Students ({students.length})
              </h3>
              {loading ? (
                <div>Loading students...</div>
              ) : students.length === 0 ? (
                <div className="text-gray-500">No students found</div>
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
                      {student.teacher && (
                        <div className="text-xs text-green-600">Teacher: {student.teacher.name}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Right Panel - Student Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Student Details</h3>
              {selectedStudent ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{selectedStudent.name}</h4>
                    <p className="text-gray-600">{selectedStudent.usn}</p>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                  </div>
                  {selectedStudent.teacher && (
                    <div>
                      <h5 className="font-medium">Assigned Teacher</h5>
                      <p>{selectedStudent.teacher.name}</p>
                      <p className="text-sm text-gray-600">{selectedStudent.teacher.email}</p>
                    </div>
                  )}
                  {selectedStudent.semester && (
                    <div>
                      <h5 className="font-medium">Current Semester</h5>
                      <p>{selectedStudent.semester.current_semester}</p>
                    </div>
                  )}
                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowStudentQuestions(true)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Set Questions
                    </button>
                    <button
                      onClick={() => setShowStudentMarks(true)}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Update Marks
                    </button>
                    <button type="button" onClick={() =>nav(`/students/${selectedStudent?.id}`)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Open Dashboard</button>
                  </div>
                  {/* Display existing data */}
                  {selectedStudent.questions && (
                    <div>
                      <h5 className="font-medium">Questions & Answers</h5>
                      <div className="space-y-1 text-sm">
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
                  {selectedStudent.marks && (
                    <div>
                      <h5 className="font-medium">Marks</h5>
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
                </div>
              ) : (
                <div className="text-gray-500">
                  Click on a student to view details
                </div>
              )}
            </div>
          </div>
        )}
        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Teachers List */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">All Teachers ({teachers.length})</h3>
              </div>
              {/* Teacher Search */}
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search teachers..."
                    className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>
              {loading ? (
                <div>Loading teachers...</div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {teachers.map(teacher => (
                    <div
                      key={teacher.id}
                      onClick={() => handleTeacherClick(teacher.id)}
                      className="p-3 border rounded cursor-pointer hover:bg-gray-50 hover:border-blue-300"
                    >
                      <div className="font-medium">{teacher.name}</div>
                      <div className="text-sm text-gray-600">{teacher.email}</div>
                      <div className="text-xs text-gray-500">
                        {teacher.students?.length || 0} students assigned
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Teacher Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Teacher Details</h3>
              {selectedTeacher ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-lg">{selectedTeacher.name}</h4>
                    <p className="text-gray-600">{selectedTeacher.email}</p>
                    <p className="text-sm text-gray-500">
                      Total Students: {teacherStudents.length}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">
                  Click on a teacher to view details
                </div>
              )}
            </div>
            {/* Teacher's Students */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">
                Teacher's Students ({teacherStudents.length})
              </h3>
              {selectedTeacher && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {teacherStudents.map(student => (
                    <div key={student.id} className="p-2 border rounded">
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-600">{student.usn}</div>
                      <div className="text-xs text-gray-500">
                        Sem: {student.semester?.current_semester || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Students without Teachers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-600">
                Students without Teachers ({studentsWithoutTeachers.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {studentsWithoutTeachers.map(student => (
                  <div key={student.id} className="p-2 border border-red-200 rounded">
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">{student.usn}</div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Teacher Statistics */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Teacher-Student Distribution</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {teacherStats.map(stat => (
                  <div key={stat.teacher_id} className="p-2 border rounded">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{stat.teacher_name}</div>
                        <div className="text-sm text-gray-600">{stat.teacher_email}</div>
                      </div>
                      <div className="text-lg font-bold text-blue-600">
                        {stat.student_count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modals */}
      {/* Bulk Questions Modal */}
      {showBulkQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
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
                      onChange={(e) =>
                        setBulkQuestions({
                          ...bulkQuestions,
                          [`question${num}`]: e.target.value
                        })
                      }
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
      {/* Student Questions Modal */}
      {showStudentQuestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Set Questions for {selectedStudent?.name}
            </h3>
            <form onSubmit={handleStudentQuestionsSubmit}>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num}>
                    <label className="block text-sm font-medium mb-1">
                      Question {num}
                    </label>
                    <textarea
                      value={studentQuestions[`question${num}`]}
                      onChange={(e) =>
                        setStudentQuestions({
                          ...studentQuestions,
                          [`question${num}`]: e.target.value
                        })
                      }
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
                  Set Questions
                </button>
                <button
                  type="button"
                  onClick={() => setShowStudentQuestions(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Student Marks Modal */}
      {showStudentMarks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Update Marks for {selectedStudent?.name}
            </h3>
            <form onSubmit={handleStudentMarksSubmit}>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <div key={sem}>
                    <label className="block text-sm font-medium mb-1">
                      Semester {sem} Marks
                    </label>
                    <input
                      type="number"
                      value={studentMarks[`sem${sem}_marks`]}
                      onChange={(e) =>
                        setStudentMarks({
                          ...studentMarks,
                          [`sem${sem}_marks`]: e.target.value
                        })
                      }
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter marks..."
                      min="0"
                      max="100"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update Marks
                </button>
                <button
                  type="button"
                  onClick={() => setShowStudentMarks(false)}
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

export default HodDashboard;