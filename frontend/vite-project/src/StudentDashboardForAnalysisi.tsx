import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, ResponsiveContainer } from 'recharts';
import { User, Trophy, Code, GitBranch, TrendingUp, Target, BookOpen, Award, Star, Calendar, Activity, Brain, Map, AlertCircle, ExternalLink, Github, Zap, ChevronRight, TrendingDown, Users, Clock, Lightbulb, MessageCircle, BarChart3, PieChart as PieChartIcon, Sparkles, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Eye, EyeOff, Rocket, Shield, Briefcase, Menu, Bell, Settings, Search, Filter, Download, Share2, Plus, MoreHorizontal } from 'lucide-react';
// Import with alias to avoid naming conflict
import { getStudentDetails as fetchStudentDetailsFromAPI } from '../api/teacher';
import { useParams } from 'react-router-dom';

// API Functions (keeping your existing implementations)
const getStudentDetails = async (studentId) => {
  try {
    console.log(`👤 Fetching student details for ID: ${studentId}`);
    const res = await fetchStudentDetailsFromAPI(studentId);
    console.log('📋 Raw API response:', res);
    
    const studentData = res.data || res;
    console.log('📊 Student data from API:', studentData);
    
    return studentData;
  } catch (error) {
    console.error('💥 Error fetching student details:', error);
    throw error;
  }
}

const getLeetCodeStats = async (username) => {
  try {
    const response = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${username}`);
    if (!response.ok) throw new Error('LeetCode API failed');
    return response.json();
  } catch (error) {
    console.error('LeetCode API Error:', error);
    return null;
  }
};

const getGitHubStats = async (username) => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) throw new Error('GitHub API failed');
    const userData = response.json();
    
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos`);
    const repos = await reposResponse.json();
    
    return {
      user: await userData,
      repos: repos || []
    };
  } catch (error) {
    console.error('GitHub API Error:', error);
    return null;
  }
};

// AI Analysis Categories
const AI_ANALYSIS_CATEGORIES = {
  ACADEMIC: 'academic',
  SKILLS: 'skills', 
  CAREER: 'career',
  PROJECTS: 'projects',
  CODING: 'coding',
  RECOMMENDATIONS: 'recommendations'
};

const analyzeStudentWithGroq = async (studentData, apiKey, category = 'general') => {
  try {
    const prompts = {
      [AI_ANALYSIS_CATEGORIES.ACADEMIC]: `Analyze this student's academic performance and provide specific insights on: 1) Academic strengths and patterns, 2) Grade trends and predictions, 3) Subject recommendations, 4) Study strategies. Data: ${JSON.stringify(studentData)}`,
      [AI_ANALYSIS_CATEGORIES.SKILLS]: `Analyze this student's technical skills and provide: 1) Skill gap analysis, 2) Market-relevant skills assessment, 3) Learning priorities, 4) Skill development roadmap. Data: ${JSON.stringify(studentData)}`,
      [AI_ANALYSIS_CATEGORIES.CAREER]: `Provide career guidance based on this student's profile: 1) Suitable career paths, 2) Industry alignment, 3) Salary expectations, 4) Growth opportunities. Data: ${JSON.stringify(studentData)}`,
      [AI_ANALYSIS_CATEGORIES.PROJECTS]: `Analyze this student's projects and suggest: 1) Project impact assessment, 2) Portfolio improvements, 3) Missing project types, 4) Next project ideas. Data: ${JSON.stringify(studentData)}`,
      [AI_ANALYSIS_CATEGORIES.CODING]: `Evaluate this student's coding profile and provide: 1) Coding strengths/weaknesses, 2) Problem-solving patterns, 3) Interview readiness, 4) Competitive programming advice. Data: ${JSON.stringify(studentData)}`,
      [AI_ANALYSIS_CATEGORIES.RECOMMENDATIONS]: `Provide personalized recommendations for this student: 1) Immediate action items, 2) 3-month goals, 3) 6-month milestones, 4) Resource suggestions. Data: ${JSON.stringify(studentData)}`
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational AI assistant specializing in student career guidance and academic analysis. Provide detailed, actionable insights with specific recommendations.'
          },
          {
            role: 'user',
            content: prompts[category] || prompts[AI_ANALYSIS_CATEGORIES.RECOMMENDATIONS]
          }
        ],
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        max_tokens: 1000
      })
    });
    
    if (!response.ok) throw new Error('Groq API failed');
    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    return 'AI analysis temporarily unavailable. Please check your API configuration.';
  }
};

// Professional Loading Component
const LoadingSpinner = ({ message = "Loading analytics..." }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative mb-8">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{message}</h3>
      <p className="text-sm text-slate-500">Preparing your dashboard...</p>
    </div>
  </div>
);

// Professional Metric Card
const MetricCard = ({ title, value, change, changeType, icon: Icon, trend }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between mb-4">
      <div className="p-2 bg-slate-100 rounded-lg">
        <Icon className="w-5 h-5 text-slate-600" />
      </div>
      {change && (
        <div className={`flex items-center text-sm font-medium ${
          changeType === 'positive' ? 'text-green-600' : changeType === 'negative' ? 'text-red-600' : 'text-slate-500'
        }`}>
          {changeType === 'positive' && <ArrowUp className="w-4 h-4 mr-1" />}
          {changeType === 'negative' && <ArrowDown className="w-4 h-4 mr-1" />}
          {change}
        </div>
      )}
    </div>
    <div className="space-y-1">
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-sm text-slate-600">{title}</p>
    </div>
  </div>
);

// Professional Chart Container
const ChartContainer = ({ title, subtitle, children, actions }) => (
  <div className="bg-white rounded-lg border border-slate-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-600 mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center space-x-2">
          {actions}
        </div>
      )}
    </div>
    {children}
  </div>
);

// Professional Insight Card
const InsightCard = ({ title, content, priority = "medium", category }) => {
  const priorityColors = {
    high: "border-red-200 bg-red-50",
    medium: "border-amber-200 bg-amber-50", 
    low: "border-green-200 bg-green-50"
  };

  const priorityTextColors = {
    high: "text-red-800",
    medium: "text-amber-800",
    low: "text-green-800"
  };

  return (
    <div className={`rounded-lg border p-4 ${priorityColors[priority]}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className={`font-medium ${priorityTextColors[priority]}`}>{title}</h4>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          priority === 'high' ? 'bg-red-100 text-red-700' :
          priority === 'medium' ? 'bg-amber-100 text-amber-700' :
          'bg-green-100 text-green-700'
        }`}>
          {priority.toUpperCase()}
        </span>
      </div>
      <p className={`text-sm ${priorityTextColors[priority]} leading-relaxed`}>
        {content}
      </p>
    </div>
  );
};

// Navigation Sidebar
const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigationItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'academic', label: 'Academic Performance', icon: BookOpen },
    { id: 'technical', label: 'Technical Skills', icon: Code },
    { id: 'projects', label: 'Projects & Portfolio', icon: Rocket },
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'goals', label: 'Goals & Roadmap', icon: Target }
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Analytics</h2>
            <p className="text-xs text-slate-500">Student Dashboard</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Top Header
const Header = ({ student }) => (
  <div className="bg-white border-b border-slate-200 px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-slate-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{student?.name}</h1>
          <p className="text-sm text-slate-600">{student?.usn} • Semester {student?.semester?.current_semester}</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200">
          <Search className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

export default function ProfessionalStudentDashboard() {
  const [student, setStudent] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [githubData, setGithubData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const studentId = useParams().id; // Get student ID from URL params
  // Groq API Key - In production, store this securely
  const GROQ_API_KEY = import.meta.env.VITE_API_GROQ_API_KEY;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch student details
        const studentData = await getStudentDetails(studentId);
        console.log('🎯 Setting student data:', studentData);
        setStudent(studentData);
        
        if (!studentData) {
          throw new Error('No student data received');
        }
        
        // Extract usernames from URLs with better error handling
        const leetcodeUsername = studentData.leetcodeurl?.split('/u/')[1]?.replace('/', '');
        const githubUsername = studentData.githuburl?.split('github.com/')[1]?.split('/')[0];
        
        console.log('🔗 Extracted usernames:', { leetcodeUsername, githubUsername });
        
        // Fetch external data in parallel
        const [leetcodeStats, githubStats] = await Promise.allSettled([
          leetcodeUsername ? getLeetCodeStats(leetcodeUsername) : Promise.resolve(null),
          githubUsername ? getGitHubStats(githubUsername) : Promise.resolve(null)
        ]);
        
        if (leetcodeStats.status === 'fulfilled' && leetcodeStats.value) {
          console.log('✅ LeetCode data:', leetcodeStats.value);
          setLeetcodeData(leetcodeStats.value);
        }
        if (githubStats.status === 'fulfilled' && githubStats.value) {
          console.log('✅ GitHub data:', githubStats.value);
          setGithubData(githubStats.value);
        }
        
        // Generate comprehensive AI analysis for different categories
        if (GROQ_API_KEY) {
          const analysisPromises = Object.values(AI_ANALYSIS_CATEGORIES).map(async (category) => {
            const analysis = await analyzeStudentWithGroq(studentData, GROQ_API_KEY, category);
            return { category, analysis };
          });
          
          const analysisResults = await Promise.allSettled(analysisPromises);
          const analysisData = {};
          
          analysisResults.forEach((result) => {
            if (result.status === 'fulfilled') {
              analysisData[result.value.category] = result.value.analysis;
            }
          });
          
          setAiAnalysis(analysisData);
        }
        
      } catch (err) {
        console.error('❌ Dashboard error:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      fetchAllData();
    } else {
      setLoading(false);
      setError('No student ID provided');
    }
  }, [studentId, GROQ_API_KEY]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-slate-200">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg border border-slate-200">
          <User className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900">No student data available</h2>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  // Prepare chart data
  const semesterData = [];
  if (student?.marks) {
    for (let i = 1; i <= 6; i++) {
      const sem = student.marks[`sem${i}`];
      if (sem !== null && sem !== undefined) {
        semesterData.push({
          semester: `Sem ${i}`,
          marks: sem,
          target: 85
        });
      }
    }
  }

  const skillsArray = student?.resume?.skills?.split(', ') || [];
  const skillsData = skillsArray.slice(0, 6).map((skill, index) => ({
    name: skill,
    proficiency: [85, 78, 92, 88, 76, 90][index] || 80
  }));

  const leetcodeChartData = leetcodeData ? [
    { name: 'Easy', solved: leetcodeData.easySolved, total: leetcodeData.totalEasy },
    { name: 'Medium', solved: leetcodeData.mediumSolved, total: leetcodeData.totalMedium },
    { name: 'Hard', solved: leetcodeData.hardSolved, total: leetcodeData.totalHard }
  ] : [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current CGPA"
          value="8.75"
          change="+0.12"
          changeType="positive"
          icon={Trophy}
        />
        <MetricCard
          title="Problems Solved"
          value={leetcodeData?.totalSolved || 0}
          change="+23"
          changeType="positive"
          icon={Code}
        />
        <MetricCard
          title="GitHub Repos"
          value={githubData?.user?.public_repos || 0}
          change="+2"
          changeType="positive"
          icon={GitBranch}
        />
        <MetricCard
          title="Overall Score"
          value="92/100"
          change="+5"
          changeType="positive"
          icon={Target}
        />
      </div>

      {/* Academic Trend */}
      <ChartContainer 
        title="Academic Performance Trend" 
        subtitle="Semester-wise marks with target comparison"
        actions={[
          <button key="download" className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors duration-200">
            <Download className="w-4 h-4" />
          </button>
        ]}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={semesterData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="semester" stroke="#64748B" fontSize={12} />
            <YAxis stroke="#64748B" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #E2E8F0', 
                borderRadius: '8px',
                fontSize: '12px'
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="marks" 
              stroke="#3B82F6" 
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#DBEAFE' }}
            />
            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#94A3B8" 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Skills Radar */}
      <ChartContainer 
        title="Technical Skills Assessment" 
        subtitle="Proficiency levels across different technologies"
      >
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={skillsData}>
            <PolarGrid stroke="#E2E8F0" />
            <PolarAngleAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
            <PolarRadiusAxis 
              angle={45} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              tickCount={5}
            />
            <Radar 
              dataKey="proficiency" 
              stroke="#3B82F6" 
              fill="#DBEAFE" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );

  const renderAcademicTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer title="Semester Performance Analysis">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={semesterData}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="semester" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
                <Area 
                  type="monotone" 
                  dataKey="marks" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Academic Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Current CGPA</span>
                <span className="font-medium text-slate-900">8.75</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Class Rank</span>
                <span className="font-medium text-slate-900">12/180</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Credits Completed</span>
                <span className="font-medium text-slate-900">142/180</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Attendance</span>
                <span className="font-medium text-green-600">94%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Course Performance</h3>
            <div className="space-y-3">
              {[
                { subject: "Data Structures", score: 92, grade: "A+" },
                { subject: "Algorithms", score: 89, grade: "A" },
                { subject: "Database Systems", score: 88, grade: "A" },
                { subject: "Web Development", score: 95, grade: "A+" }
              ].map((course, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{course.subject}</p>
                    <p className="text-xs text-slate-600">{course.score}%</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    course.grade === 'A+' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {course.grade}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTechnicalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="LeetCode Performance">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={leetcodeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
              <YAxis stroke="#64748B" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #E2E8F0', borderRadius: '8px' }} />
              <Bar dataKey="solved" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="GitHub Activity">
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{githubData?.user?.public_repos}</div>
                <div className="text-xs text-slate-600">Repositories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{githubData?.user?.followers}</div>
                <div className="text-xs text-slate-600">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{githubData?.user?.following}</div>
                <div className="text-xs text-slate-600">Following</div>
              </div>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <h4 className="text-sm font-medium text-slate-900 mb-3">Recent Repositories</h4>
              {githubData?.repos?.slice(0, 4).map((repo, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{repo.name}</p>
                    <p className="text-xs text-slate-600 truncate">{repo.description}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Star className="w-3 h-3" />
                    <span>{repo.stargazers_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartContainer>
      </div>

      <ChartContainer title="Skill Proficiency Matrix">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillsData.map((skill, index) => (
            <div key={index} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">{skill.name}</span>
                <span className="text-xs text-slate-600">{skill.proficiency}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${skill.proficiency}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );

  const renderProjectsTab = () => (
    <div className="space-y-6">
      <ChartContainer title="Project Portfolio">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {student?.resume?.projects?.split('\n').filter(project => project.trim()).map((project, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-1">{project.split(' - ')[0]}</h3>
                  <p className="text-sm text-slate-600">{project.split(' - ')[1] || 'Project description'}</p>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Active</span>
                  <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Completed</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Star className="w-3 h-3" />
                  <span>{Math.floor(Math.random() * 20) + 5}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer title="Technology Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Frontend', value: 35, color: '#3B82F6' },
                  { name: 'Backend', value: 30, color: '#10B981' },
                  { name: 'Mobile', value: 20, color: '#F59E0B' },
                  { name: 'AI/ML', value: 15, color: '#8B5CF6' }
                ]}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {[
                  { name: 'Frontend', value: 35, color: '#3B82F6' },
                  { name: 'Backend', value: 30, color: '#10B981' },
                  { name: 'Mobile', value: 20, color: '#F59E0B' },
                  { name: 'AI/ML', value: 15, color: '#8B5CF6' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Project Impact Metrics">
          <div className="space-y-4">
            {[
              { metric: "Code Quality Score", value: "A+", color: "green" },
              { metric: "Performance Rating", value: "92/100", color: "blue" },
              { metric: "Innovation Index", value: "8.7/10", color: "purple" },
              { metric: "Team Collaboration", value: "Excellent", color: "green" }
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-600">{item.metric}</span>
                <span className={`font-medium ${
                  item.color === 'green' ? 'text-green-600' :
                  item.color === 'blue' ? 'text-blue-600' : 'text-purple-600'
                }`}>{item.value}</span>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-blue-900">AI-Powered Analytics</h2>
        </div>
        <p className="text-blue-700">Comprehensive analysis based on your academic and professional data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Key Insights</h3>
          <InsightCard
            title="Academic Excellence Trajectory"
            content="Your consistent upward trend in academic performance indicates strong learning capabilities. The 8.75 CGPA places you in the top 15% of your cohort."
            priority="high"
            category="academic"
          />
          <InsightCard
            title="Technical Skill Development"
            content="Strong foundation in core computer science concepts. Consider expanding into cloud technologies and DevOps to enhance market readiness."
            priority="medium"
            category="skills"
          />
          <InsightCard
            title="Project Portfolio Strength"
            content="Diverse project portfolio shows versatility. The e-commerce and AI chatbot projects demonstrate full-stack capabilities valued by employers."
            priority="low"
            category="projects"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Recommendations</h3>
          <InsightCard
            title="Interview Preparation Focus"
            content="LeetCode performance is solid at 284 problems. Focus on system design concepts and behavioral interview preparation for top-tier companies."
            priority="high"
            category="career"
          />
          <InsightCard
            title="Open Source Contribution"
            content="GitHub activity shows good development practices. Contributing to popular open-source projects could significantly boost your profile."
            priority="medium"
            category="professional"
          />
          <InsightCard
            title="Leadership Development"
            content="Teacher feedback highlights your collaborative nature. Consider taking on tech lead roles in upcoming projects."
            priority="medium"
            category="soft-skills"
          />
        </div>
      </div>

      <ChartContainer title="Competency Analysis" subtitle="Comparison against industry standards">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { category: "Technical Skills", current: 85, industry: 75, color: "blue" },
            { category: "Problem Solving", current: 92, industry: 80, color: "green" },
            { category: "Communication", current: 78, industry: 85, color: "amber" },
            { category: "Leadership", current: 82, industry: 70, color: "purple" },
            { category: "Innovation", current: 88, industry: 75, color: "pink" },
            { category: "Collaboration", current: 90, industry: 82, color: "teal" }
          ].map((skill, index) => (
            <div key={index} className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-900">{skill.category}</span>
                <span className="text-xs text-slate-600">{skill.current}%</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">You</span>
                  <span className="text-slate-600">Industry Avg</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`bg-${skill.color}-600 h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${skill.current}%` }}
                    ></div>
                  </div>
                  <div 
                    className="absolute top-0 w-0.5 h-2 bg-slate-400"
                    style={{ left: `${skill.industry}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  );

  const renderGoalsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartContainer title="Career Roadmap" subtitle="Strategic milestones for the next 12 months">
            <div className="space-y-6">
              {[
                {
                  phase: "Next 3 Months",
                  color: "blue",
                  goals: [
                    { task: "Complete advanced system design course", status: "in-progress", progress: 60 },
                    { task: "Build microservices portfolio project", status: "planned", progress: 0 },
                    { task: "Achieve LeetCode rating 2000+", status: "in-progress", progress: 75 },
                    { task: "Obtain AWS Cloud Practitioner certification", status: "planned", progress: 20 }
                  ]
                },
                {
                  phase: "3-6 Months",
                  color: "green",
                  goals: [
                    { task: "Secure software engineering internship", status: "planned", progress: 0 },
                    { task: "Contribute to 3 major open-source projects", status: "planned", progress: 0 },
                    { task: "Complete machine learning specialization", status: "planned", progress: 0 },
                    { task: "Build professional network (50+ connections)", status: "in-progress", progress: 30 }
                  ]
                },
                {
                  phase: "6-12 Months",
                  color: "purple",
                  goals: [
                    { task: "Full-time job offer from target companies", status: "planned", progress: 0 },
                    { task: "Tech conference presentation", status: "planned", progress: 0 },
                    { task: "Mentor junior developers", status: "planned", progress: 0 },
                    { task: "Launch personal tech blog/YouTube", status: "planned", progress: 10 }
                  ]
                }
              ].map((phase, phaseIndex) => (
                <div key={phaseIndex} className="border border-slate-200 rounded-lg p-6">
                  <h3 className={`text-lg font-semibold text-${phase.color}-700 mb-4`}>{phase.phase}</h3>
                  <div className="space-y-3">
                    {phase.goals.map((goal, goalIndex) => (
                      <div key={goalIndex} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{goal.task}</p>
                          <div className="flex items-center mt-2">
                            <div className="w-24 bg-slate-200 rounded-full h-1.5 mr-3">
                              <div 
                                className={`bg-${phase.color}-600 h-1.5 rounded-full transition-all duration-500`}
                                style={{ width: `${goal.progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-600">{goal.progress}%</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          goal.status === 'in-progress' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {goal.status.replace('-', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ChartContainer>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Priority Focus Areas</h3>
            <div className="space-y-3">
              {[
                { area: "System Design", priority: "High", color: "red" },
                { area: "Interview Skills", priority: "High", color: "red" },
                { area: "Cloud Technologies", priority: "Medium", color: "amber" },
                { area: "Leadership Experience", priority: "Medium", color: "amber" },
                { area: "Open Source", priority: "Low", color: "green" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-900">{item.area}</span>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    item.color === 'red' ? 'bg-red-100 text-red-700' :
                    item.color === 'amber' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Target Companies</h3>
            <div className="space-y-3">
              {[
                { company: "Google", match: "92%", status: "target" },
                { company: "Microsoft", match: "89%", status: "target" },
                { company: "Amazon", match: "86%", status: "backup" },
                { company: "Meta", match: "84%", status: "reach" },
                { company: "Netflix", match: "81%", status: "reach" }
              ].map((company, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{company.company}</p>
                    <p className="text-xs text-slate-600">Match: {company.match}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    company.status === 'target' ? 'bg-green-100 text-green-700' :
                    company.status === 'backup' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {company.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center space-x-2 mb-3">
              <Target className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Success Probability</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-700 mb-1">87%</div>
              <p className="text-sm text-blue-600">Based on current trajectory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'academic':
        return renderAcademicTab();
      case 'technical':
        return renderTechnicalTab();
      case 'projects':
        return renderProjectsTab();
      case 'insights':
        return renderInsightsTab();
      case 'goals':
        return renderGoalsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <Header student={student} />
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}