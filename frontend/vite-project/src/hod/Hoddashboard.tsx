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
import { 
  Home, 
  Users, 
  UserCog, 
  BarChart3, 
  Search, 
  Bell,
  Settings,
  LogOut,
  Plus,
  Filter,
  Download,
  Upload,
  Star,
  Clock,
  TrendingUp,
  Calendar,
  Mail,
  Phone,
  MapPin,
  BookMarked,
  GraduationCap,
  Target,
  Zap,
  Award,
  ChevronDown,
  MoreHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  BookOpen,
  FileText,
  PieChart,
  Activity,
  UserCheck,
  Trophy
} from 'lucide-react';

const HodDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    } else if (activeTab === 'analytics') {
      loadReports();
    }
  }, [activeTab, selectedSemester]);

  const nav = useNavigate();

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
      setTeachers([]);
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

  const handleLeaderboard = () => {
    nav('/leaderboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!hod || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-blue-500' },
    { id: 'students', label: 'Students', icon: Users, color: 'text-emerald-500' },
    { id: 'teachers', label: 'Faculty', icon: UserCog, color: 'text-purple-500' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col shadow-lg`}>
        {/* Logo & Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">EduAdmin</h1>
                <p className="text-sm text-gray-500">HOD Portal</p>
              </div>
            )}
          </div>
        </div>

        {/* Profile Section */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">{hod.name?.charAt(0) || 'H'}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-gray-900 font-medium truncate">{hod.name}</p>
                <p className="text-gray-500 text-sm truncate">Head of Department</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${activeTab === item.id ? item.color : ''}`} />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200">
            <Settings className="w-5 h-5" />
            {!sidebarCollapsed && <span>Settings</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 capitalize">{activeTab}</h2>
                <p className="text-gray-500 text-sm">Manage your department efficiently</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              {(activeTab === 'students' || activeTab === 'teachers') && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
              
              <button className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-auto bg-gray-50">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Students</p>
                      <p className="text-3xl font-bold mt-1">{dashboardData.total_students || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-blue-100">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span className="text-sm">Active enrollments</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm font-medium">Faculty Members</p>
                      <p className="text-3xl font-bold mt-1">{dashboardData.total_teachers || 0}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <UserCog className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-emerald-100">
                    <Star className="w-4 h-4 mr-1" />
                    <span className="text-sm">Expert educators</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Active Programs</p>
                      <p className="text-3xl font-bold mt-1">
                        {dashboardData.stats?.students_by_semester ? Object.keys(dashboardData.stats.students_by_semester).length : 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <BookMarked className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-purple-100">
                    <Target className="w-4 h-4 mr-1" />
                    <span className="text-sm">Semester programs</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">System Status</p>
                      <p className="text-xl font-bold mt-1 flex items-center">
                        <Zap className="w-5 h-5 mr-2" />
                        Online
                      </p>
                    </div>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  <div className="mt-4 flex items-center text-orange-100">
                    <Activity className="w-4 h-4 mr-1" />
                    <span className="text-sm">All systems operational</span>
                  </div>
                </div>
              </div>

              {/* Semester Overview */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <PieChart className="w-6 h-6 mr-3 text-blue-500" />
                    Semester Enrollment Distribution
                  </h3>
                  <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                    const count = dashboardData.stats?.students_by_semester?.[`sem${sem}`] || 0;
                    const maxCount = dashboardData.stats?.students_by_semester ? Math.max(...Object.values(dashboardData.stats.students_by_semester)) : 1;
                    const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={sem} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center hover:bg-gray-100 transition-colors cursor-pointer">
                        <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                        <div className="text-sm text-gray-500 mb-3">Semester {sem}</div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                            style={{width: `${percentage}%`}}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('students')}
                      className="w-full flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-left"
                    >
                      <Users className="w-5 h-5 text-emerald-500" />
                      <div>
                        <p className="text-gray-900 font-medium">Manage Students</p>
                        <p className="text-gray-500 text-sm">View and edit student records</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('teachers')}
                      className="w-full flex items-center space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-left"
                    >
                      <UserCog className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-gray-900 font-medium">Faculty Management</p>
                        <p className="text-gray-500 text-sm">Oversee teaching staff</p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-blue-500" />
                    Recent Activity
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="text-gray-900 text-sm">System health check completed</p>
                        <p className="text-gray-500 text-xs">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-gray-900 text-sm">New student enrollment processed</p>
                        <p className="text-gray-500 text-xs">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div>
                        <p className="text-gray-900 text-sm">Faculty meeting scheduled</p>
                        <p className="text-gray-500 text-xs">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Controls Bar */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <h3 className="text-lg font-bold text-gray-900">Student Management</h3>
                    <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <button
                          key={sem}
                          onClick={() => setSelectedSemester(sem)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            selectedSemester === sem
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-600 hover:text-gray-900'
                          }`}
                        >
                          Sem {sem}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSearch}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </button>
                    <button
                      onClick={() => setShowBulkQuestions(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Bulk Questions</span>
                    </button>
                    <button
                      onClick={handleLeaderboard}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                      <Trophy className="w-4 h-4" />
                      <span>Leaderboard</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Students List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Semester {selectedSemester} Students ({students.length})
                    </h4>
                    <button
                      onClick={() => loadStudentsBySemester(selectedSemester)}
                      className="flex items-center space-x-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                    >
                      <Activity className="w-4 h-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                  
                  {loading ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading students...</p>
                    </div>
                  ) : students.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No students found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {students.map(student => (
                        <div
                          key={student.id}
                          onClick={() => handleStudentClick(student.id)}
                          className="bg-white rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">{student.name?.charAt(0) || 'S'}</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-gray-900 font-semibold">{student.name}</h5>
                              <p className="text-gray-500 text-sm">{student.email}</p>
                            </div>
                            <div className="text-right">
                              {student.teacher && (
                                <div className="flex items-center space-x-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                                  <UserCog className="w-3 h-3" />
                                  <span>{student.teacher.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Student Details Panel */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-blue-500" />
                    Student Profile
                  </h4>
                  
                  {selectedStudent ? (
                    <div className="space-y-6">
                      {/* Student Info Card */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">{selectedStudent.name?.charAt(0) || 'S'}</span>
                          </div>
                          <div>
                            <h5 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h5>
                            <p className="text-gray-700 font-medium">{selectedStudent.usn}</p>
                            <p className="text-gray-500 text-sm">{selectedStudent.email}</p>
                          </div>
                        </div>
                        
                        {selectedStudent.teacher && (
                          <div className="bg-white/70 border border-gray-200 rounded-lg p-3">
                            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Assigned Teacher</p>
                            <p className="text-emerald-600 font-medium">{selectedStudent.teacher.name}</p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowStudentQuestions(true)}
                          className="w-full flex items-center justify-center space-x-2 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Set Questions</span>
                        </button>
                        <button
                          onClick={() => setShowStudentMarks(true)}
                          className="w-full flex items-center justify-center space-x-2 p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors"
                        >
                          <Award className="w-4 h-4" />
                          <span>Update Marks</span>
                        </button>
                        <button
                          onClick={() => nav(`/students/${selectedStudent?.id}`)}
                          className="w-full flex items-center justify-center space-x-2 p-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-medium transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>View Dashboard</span>
                        </button>
                      </div>

                      {/* Questions & Answers */}
                      {selectedStudent.questions && (
                        <div className="space-y-3">
                          <h6 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Academic Questions</h6>
                          {[1, 2, 3, 4, 5].map(num => {
                            const question = selectedStudent.questions[`question${num}`];
                            const answer = selectedStudent.questions[`answer${num}`];
                            return (question || answer) && (
                              <div key={num} className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
                                <p className="text-gray-900 text-sm"><span className="text-blue-600 font-semibold">Q{num}:</span> {question || 'Not set'}</p>
                                <p className="text-gray-700 text-sm"><span className="text-emerald-600 font-semibold">A{num}:</span> {answer || 'Not answered'}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Marks Overview */}
                      {selectedStudent.marks && (
                        <div className="space-y-3">
                          <h6 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Academic Performance</h6>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(selectedStudent.marks).map(([key, value]) =>
                              key.includes('sem') && value && (
                                <div key={key} className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
                                  <div className="text-xs text-gray-500 uppercase">{key.replace('_marks', '')}</div>
                                  <div className="text-lg font-bold text-blue-600">{value}</div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Select a student to view profile</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Teachers Tab */}
          {activeTab === 'teachers' && (
            <div className="space-y-6">
              {/* Teachers Header */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Faculty Management</h3>
                    <p className="text-gray-500 mt-1">Manage teaching staff and student assignments</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleSearch}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors font-medium"
                    >
                      <Search className="w-4 h-4" />
                      <span>Search Faculty</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Teachers List */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                      <UserCog className="w-5 h-5 mr-2 text-purple-500" />
                      All Faculty ({teachers.length})
                    </h4>
                  </div>
                  
                  {loading ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mx-auto mb-3"></div>
                      <p className="text-gray-500">Loading faculty...</p>
                    </div>
                  ) : teachers.length === 0 ? (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-200">
                      <UserCog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No faculty found</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {teachers.map(teacher => (
                        <div
                          key={teacher.id}
                          onClick={() => handleTeacherClick(teacher.id)}
                          className="bg-white rounded-xl p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 border border-gray-200 hover:border-purple-300 shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold">{teacher.name?.charAt(0) || 'T'}</span>
                            </div>
                            <div className="flex-1">
                              <h5 className="text-gray-900 font-semibold">{teacher.name}</h5>
                              <p className="text-gray-500 text-sm">{teacher.email}</p>
                              <div className="flex items-center space-x-1 mt-1">
                                <Users className="w-3 h-3 text-purple-500" />
                                <span className="text-xs text-purple-600">{teacher.students?.length || 0} students</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Teacher Details */}
                <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2 text-purple-500" />
                    Faculty Profile
                  </h4>
                  
                  {selectedTeacher ? (
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <span className="text-white font-bold text-2xl">{selectedTeacher.name?.charAt(0) || 'T'}</span>
                        </div>
                        <h5 className="text-xl font-bold text-gray-900">{selectedTeacher.name}</h5>
                        <p className="text-gray-500">{selectedTeacher.email}</p>
                        <div className="mt-3 flex items-center justify-center space-x-2 text-purple-600">
                          <Users className="w-4 h-4" />
                          <span className="text-sm font-medium">{teacherStudents.length} Students</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <UserCog className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Select a faculty member</p>
                    </div>
                  )}
                </div>

                {/* Teacher's Students */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                    <span className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-emerald-500" />
                      Assigned Students
                    </span>
                    {selectedTeacher && (
                      <span className="text-sm bg-emerald-100 text-emerald-600 px-2 py-1 rounded border border-emerald-200">
                        {teacherStudents.length}
                      </span>
                    )}
                  </h4>
                  
                  {selectedTeacher ? (
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {teacherStudents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <UserPlus className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>No students assigned</p>
                        </div>
                      ) : (
                        teacherStudents.map(student => (
                          <div key={student.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">{student.name?.charAt(0) || 'S'}</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-gray-900 font-medium text-sm">{student.name}</p>
                                <p className="text-gray-500 text-xs">{student.usn}</p>
                              </div>
                              <div className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                Sem {student.semester?.current_semester || 'N/A'}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Select a faculty to view students</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Header */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <BarChart3 className="w-7 h-7 mr-3 text-orange-500" />
                      Department Analytics
                    </h3>
                    <p className="text-gray-500 mt-1">Comprehensive insights and reporting</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium">
                      <Download className="w-4 h-4" />
                      <span>Export Report</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Critical Issues */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h4 className="text-lg font-bold text-red-500 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Critical Issues
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-red-600 font-semibold mb-2 flex items-center">
                            <UserPlus className="w-4 h-4 mr-2" />
                            Students Without Teachers
                          </h5>
                          <p className="text-gray-700 text-sm mb-3">
                            {studentsWithoutTeachers.length} students need teacher assignment
                          </p>
                        </div>
                        <div className="text-2xl font-bold text-red-500">
                          {studentsWithoutTeachers.length}
                        </div>
                      </div>
                      
                      {studentsWithoutTeachers.length > 0 && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {studentsWithoutTeachers.slice(0, 3).map(student => (
                            <div key={student.id} className="bg-white border border-red-200 rounded-lg p-2 flex items-center space-x-2">
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-medium">{student.name?.charAt(0) || 'S'}</span>
                              </div>
                              <div>
                                <p className="text-gray-900 text-sm font-medium">{student.name}</p>
                                <p className="text-gray-500 text-xs">{student.usn}</p>
                              </div>
                            </div>
                          ))}
                          {studentsWithoutTeachers.length > 3 && (
                            <p className="text-gray-500 text-xs text-center pt-2">
                              +{studentsWithoutTeachers.length - 3} more students
                            </p>
                          )}
                        </div>
                      )}
                      
                      {studentsWithoutTeachers.length === 0 && (
                        <div className="text-center py-4">
                          <div className="w-12 h-12 bg-green-100 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-2">
                            <UserCheck className="w-6 h-6 text-green-600" />
                          </div>
                          <p className="text-green-700 font-medium">All students have assigned teachers!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Faculty Distribution */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <h4 className="text-lg font-bold text-orange-500 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Faculty Workload Distribution
                  </h4>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {teacherStats.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No data available</p>
                      </div>
                    ) : (
                      teacherStats.map((stat, index) => {
                        const maxLoad = Math.max(...teacherStats.map(s => s.student_count));
                        const workloadPercentage = maxLoad > 0 ? (stat.student_count / maxLoad) * 100 : 0;
                        const getWorkloadColor = (count) => {
                          if (count === 0) return 'from-gray-400 to-gray-500';
                          if (count <= 5) return 'from-green-400 to-emerald-500';
                          if (count <= 10) return 'from-yellow-400 to-orange-500';
                          return 'from-red-400 to-red-500';
                        };
                        
                        return (
                          <div key={stat.teacher_id || index} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 bg-gradient-to-br ${getWorkloadColor(stat.student_count)} rounded-full flex items-center justify-center`}>
                                  <span className="text-white font-semibold text-sm">{stat.teacher_name?.charAt(0) || 'T'}</span>
                                </div>
                                <div>
                                  <p className="text-gray-900 font-semibold">{stat.teacher_name}</p>
                                  <p className="text-gray-500 text-sm">{stat.teacher_email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xl font-bold text-orange-600">{stat.student_count}</div>
                                <div className="text-xs text-gray-500">students</div>
                              </div>
                            </div>
                            
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`bg-gradient-to-r ${getWorkloadColor(stat.student_count)} h-2 rounded-full transition-all duration-500`}
                                style={{width: `${workloadPercentage}%`}}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {/* Bulk Questions Modal */}
      {showBulkQuestions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-emerald-500 to-cyan-600 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <BookOpen className="w-7 h-7 mr-3" />
                Bulk Question Assignment
              </h3>
              <p className="text-emerald-100 mt-1">Assign questions to all students in Semester {selectedSemester}</p>
            </div>
            
            <form onSubmit={handleBulkQuestionsSubmit} className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-5">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
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
                      className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                      rows="3"
                      placeholder={`Enter question ${num}...`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-xl hover:from-emerald-600 hover:to-cyan-700 font-semibold transition-all duration-200 shadow-lg"
                >
                  Assign Questions
                </button>
                <button
                  type="button"
                  onClick={() => setShowBulkQuestions(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Edit className="w-7 h-7 mr-3" />
                Individual Question Assignment
              </h3>
              <p className="text-blue-100 mt-1">Set custom questions for {selectedStudent?.name}</p>
            </div>
            
            <form onSubmit={handleStudentQuestionsSubmit} className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-5">
                {[1, 2, 3, 4, 5].map(num => (
                  <div key={num} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
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
                      className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows="3"
                      placeholder={`Enter question ${num}...`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 font-semibold transition-all duration-200 shadow-lg"
                >
                  Set Questions
                </button>
                <button
                  type="button"
                  onClick={() => setShowStudentQuestions(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <Award className="w-7 h-7 mr-3" />
                Academic Performance Update
              </h3>
              <p className="text-purple-100 mt-1">Update semester marks for {selectedStudent?.name}</p>
            </div>
            
            <form onSubmit={handleStudentMarksSubmit} className="p-6 overflow-y-auto max-h-96">
              <div className="grid grid-cols-2 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <div key={sem} className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
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
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Enter marks..."
                      min="0"
                      max="100"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 font-semibold transition-all duration-200 shadow-lg"
                >
                  Update Marks
                </button>
                <button
                  type="button"
                  onClick={() => setShowStudentMarks(false)}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
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