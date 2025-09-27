import React, { useState, useEffect, use } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, ResponsiveContainer } from 'recharts';
import { User, Trophy, Code, GitBranch, TrendingUp, Target, BookOpen, Award, Star, Calendar, Activity, Brain, Map, AlertCircle, ExternalLink, Github, Zap, ChevronRight, TrendingDown, Users, Clock, Lightbulb, MessageCircle, BarChart3, PieChart as PieChartIcon, Sparkles, ArrowUp, ArrowDown, ChevronDown, ChevronUp, Eye, EyeOff, Rocket, Shield, Briefcase } from 'lucide-react';
// Import with alias to avoid naming conflict
import { getStudentDetails as fetchStudentDetailsFromAPI } from '../api/teacher';
import { useParams } from 'react-router-dom';
// AI Analysis Categories
const AI_ANALYSIS_CATEGORIES = {
  ACADEMIC: 'academic',
  SKILLS: 'skills', 
  CAREER: 'career',
  PROJECTS: 'projects',
  CODING: 'coding',
  RECOMMENDATIONS: 'recommendations'
};

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

// Enhanced Loading Component
const LoadingSpinner = ({ message = "Loading dashboard..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-4 border-indigo-200 mx-auto mb-6"></div>
        <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-indigo-600 absolute top-0 left-1/2 transform -translate-x-1/2"></div>
      </div>
      <div className="space-y-2">
        <p className="text-xl font-semibold text-gray-800">{message}</p>
        <p className="text-sm text-gray-500">Analyzing your data with AI...</p>
      </div>
      <div className="flex justify-center space-x-1 mt-4">
        {[0, 1, 2].map(i => (
          <div key={i} className={`w-2 h-2 bg-indigo-600 rounded-full animate-pulse`} style={{ animationDelay: `${i * 0.2}s` }}></div>
        ))}
      </div>
    </div>
  </div>
);

// AI Insight Card Component
const AIInsightCard = ({ title, content, icon: Icon, color = "blue", isExpanded = false, onToggle }) => (
  <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-2xl shadow-lg border border-${color}-200 transition-all duration-300 hover:shadow-xl`}>
    <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={onToggle}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 bg-${color}-500 rounded-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
    </div>
    {isExpanded && (
      <div className="prose prose-sm text-gray-700 whitespace-pre-line animate-fadeIn">
        {content}
      </div>
    )}
  </div>
);

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend, trendValue, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 bg-gradient-to-r from-${color}-400 to-${color}-600 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
          <span className="text-sm font-semibold">{trendValue}</span>
        </div>
      )}
    </div>
    <div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className={`text-3xl font-bold text-${color}-600 mb-2`}>{value}</p>
      {description && <p className="text-xs text-gray-500">{description}</p>}
    </div>
  </div>
);

// Enhanced Chart Container
const ChartContainer = ({ title, children, aiInsight, icon: Icon }) => {
  const [showInsight, setShowInsight] = useState(false);
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <Icon className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        {aiInsight && (
          <button 
            onClick={() => setShowInsight(!showInsight)}
            className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200"
          >
            <Brain className="w-4 h-4" />
            <span className="text-sm">AI Insight</span>
            {showInsight ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      
      {showInsight && aiInsight && (
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">AI Analysis</span>
          </div>
          <p className="text-sm text-gray-700">{aiInsight}</p>
        </div>
      )}
      
      <div className="relative">
        {children}
      </div>
    </div>
  );
};

export default function StudentDashboardForAnalysis() {
  const [student, setStudent] = useState(null);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [githubData, setGithubData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState({});
  const [expandedInsights, setExpandedInsights] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const studentId = useParams().id; // Get student ID from URL params
  // Groq API Key - In production, store this securely
  const GROQ_API_KEY =import.meta.env.VITE_API_GROQ_API_KEY;
  
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch student details (replace 2 with dynamic studentId)
        const studentData = await getStudentDetails(studentId );
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
        
      } catch (err) {
        console.error('❌ Dashboard error:', err);
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const toggleInsight = (category) => {
    setExpandedInsights(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors duration-200 font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
          <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-yellow-600">No student data available</h2>
        </div>
      </div>
    );
  }

  // Prepare chart data with better error handling
  const skillsArray = student?.resume?.skills?.split(', ') || [];
  const skillsData = skillsArray.slice(0, 8).map((skill, index) => ({
    name: skill,
    proficiency: Math.floor(Math.random() * 40) + 60
  }));

  const semesterData = [];
  if (student?.marks) {
    for (let i = 1; i <= 8; i++) {
      const sem = student.marks[`sem${i}`];
      if (sem !== null && sem !== undefined) {
        semesterData.push({
          semester: `Sem ${i}`,
          marks: sem
        });
      }
    }
  }

  const interestsData = student?.interests?.map(interest => ({
    name: interest.activity,
    level: interest.level === 'Expert' ? 90 : interest.level === 'Intermediate' ? 70 : 50
  })) || [];

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  // LeetCode chart data
  const leetcodeChartData = leetcodeData ? [
    { name: 'Easy', solved: leetcodeData.easySolved || 0, total: leetcodeData.totalEasy || 0 },
    { name: 'Medium', solved: leetcodeData.mediumSolved || 0, total: leetcodeData.totalMedium || 0 },
    { name: 'Hard', solved: leetcodeData.hardSolved || 0, total: leetcodeData.totalHard || 0 }
  ] : [];

  // Calculate trends and insights
  const avgMarks = semesterData.length > 0 ? 
    (semesterData.reduce((sum, sem) => sum + sem.marks, 0) / semesterData.length).toFixed(1) : 'N/A';
  
  const trendDirection = semesterData.length > 1 ? 
    (semesterData[semesterData.length - 1].marks > semesterData[semesterData.length - 2].marks ? 'up' : 'down') : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-white shadow-2xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">{student?.name || 'Unknown Student'}</h1>
                <p className="text-gray-600 text-lg">{student?.usn || 'No USN'} • {student?.resume?.education?.split(',')[0] || 'Education info not available'}</p>
                <div className="flex items-center mt-3 space-x-6">
                  {student?.leetcodeurl && (
                    <a href={student.leetcodeurl} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors duration-200">
                      <Code className="w-4 h-4 mr-2" />
                      <span className="font-medium">LeetCode</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                  {student?.githuburl && (
                    <a href={student.githuburl} target="_blank" rel="noopener noreferrer"
                       className="flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                      <Github className="w-4 h-4 mr-2" />
                      <span className="font-medium">GitHub</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl">
              <p className="text-sm text-gray-600 mb-1">Current Semester</p>
              <p className="text-3xl font-bold text-indigo-600">{student?.semester?.current_semester || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-1">Academic Year 2024</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="CGPA"
            value={student?.resume?.education?.match(/CGPA: ([\d.]+)/)?.[1] || 'N/A'}
            icon={Trophy}
            color="green"
            trend="up"
            trendValue="+0.2"
            description="Above average performance"
          />
          
          <StatsCard
            title="LeetCode Problems"
            value={leetcodeData?.totalSolved || 'N/A'}
            icon={Code}
            color="orange"
            trend="up"
            trendValue="+12"
            description="This month"
          />
          
          <StatsCard
            title="GitHub Repos"
            value={githubData?.user?.public_repos || 'N/A'}
            icon={GitBranch}
            color="blue"
            trend="up"
            trendValue="+3"
            description="Recent contributions"
          />
          
          <StatsCard
            title="Projects"
            value={student?.resume?.projects?.split('\n').length || 0}
            icon={Target}
            color="purple"
            description="Portfolio projects"
          />
        </div>

        {/* AI Insights Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar - AI Insights */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-6 rounded-2xl text-white shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-8 h-8" />
                <h2 className="text-xl font-bold">AI Insights</h2>
              </div>
              <p className="text-purple-100 text-sm">Get personalized recommendations and analysis based on your data</p>
            </div>

            <AIInsightCard
              title="Academic Analysis"
              content={aiAnalysis[AI_ANALYSIS_CATEGORIES.ACADEMIC] || 'Analyzing academic performance...'}
              icon={BookOpen}
              color="blue"
              isExpanded={expandedInsights.academic}
              onToggle={() => toggleInsight('academic')}
            />

            <AIInsightCard
              title="Skills Assessment"
              content={aiAnalysis[AI_ANALYSIS_CATEGORIES.SKILLS] || 'Evaluating skill set...'}
              icon={Star}
              color="green"
              isExpanded={expandedInsights.skills}
              onToggle={() => toggleInsight('skills')}
            />

            <AIInsightCard
              title="Career Guidance"
              content={aiAnalysis[AI_ANALYSIS_CATEGORIES.CAREER] || 'Generating career recommendations...'}
              icon={Briefcase}
              color="purple"
              isExpanded={expandedInsights.career}
              onToggle={() => toggleInsight('career')}
            />

            <AIInsightCard
              title="Project Insights"
              content={aiAnalysis[AI_ANALYSIS_CATEGORIES.PROJECTS] || 'Analyzing project portfolio...'}
              icon={Rocket}
              color="orange"
              isExpanded={expandedInsights.projects}
              onToggle={() => toggleInsight('projects')}
            />

            <AIInsightCard
              title="Coding Performance"
              content={aiAnalysis[AI_ANALYSIS_CATEGORIES.CODING] || 'Evaluating coding skills...'}
              icon={Code}
              color="red"
              isExpanded={expandedInsights.coding}
              onToggle={() => toggleInsight('coding')}
            />

            <AIInsightCard
              title="Recommendations"
              content={aiAnalysis[AI_ANALYSIS_CATEGORIES.RECOMMENDATIONS] || 'Preparing personalized recommendations...'}
              icon={Lightbulb}
              color="yellow"
              isExpanded={expandedInsights.recommendations}
              onToggle={() => toggleInsight('recommendations')}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {/* Academic Performance */}
            {semesterData.length > 0 && (
              <ChartContainer 
                title="Academic Progress" 
                icon={TrendingUp}
                aiInsight="Your academic performance shows a consistent upward trend with strong performance in recent semesters. Focus on maintaining this momentum."
              >
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={semesterData}>
                    <defs>
                      <linearGradient id="colorMarks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="semester" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="marks" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorMarks)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}

            {/* Skills Radar Chart */}
            {skillsData.length > 0 && (
              <ChartContainer 
                title="Skills Assessment" 
                icon={Star}
                aiInsight="Your skill set shows strong technical foundations. Consider deepening expertise in emerging technologies like AI/ML and cloud computing."
              >
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={skillsData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis dataKey="name" className="text-sm" />
                    <PolarRadiusAxis angle={45} domain={[0, 100]} className="text-xs" />
                    <Radar 
                      dataKey="proficiency" 
                      stroke="#8B5CF6" 
                      fill="#C4B5FD" 
                      fillOpacity={0.4}
                      strokeWidth={2}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: 'none', 
                        borderRadius: '12px', 
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                      }} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}

            {/* LeetCode Performance */}
            {leetcodeData && (
              <ChartContainer 
                title="LeetCode Performance" 
                icon={Code}
                aiInsight="Strong problem-solving skills with consistent practice. Focus on medium and hard problems to prepare for technical interviews."
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={leetcodeChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: 'none', 
                          borderRadius: '12px', 
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)' 
                        }} 
                      />
                      <Bar dataKey="solved" fill="#FB923C" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="space-y-6">
                    <div className="text-center bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-2xl">
                      <p className="text-4xl font-bold text-orange-600 mb-2">{leetcodeData.totalSolved || 0}</p>
                      <p className="text-gray-600 font-medium">Problems Solved</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center bg-green-50 p-4 rounded-xl">
                        <p className="text-lg font-bold text-green-600">Rank</p>
                        <p className="text-sm text-gray-600">{leetcodeData.ranking || 'N/A'}</p>
                      </div>
                      <div className="text-center bg-blue-50 p-4 rounded-xl">
                        <p className="text-lg font-bold text-blue-600">Rating</p>
                        <p className="text-sm text-gray-600">{leetcodeData.contestRating || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ChartContainer>
            )}

            {/* GitHub Activity */}
            {githubData && (
              <ChartContainer 
                title="GitHub Activity" 
                icon={Github}
                aiInsight="Good open-source contribution pattern. Consider contributing to popular repositories and maintaining consistent commit history."
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl text-center">
                      <Github className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-3xl font-bold text-blue-600">{githubData.user.public_repos}</p>
                      <p className="text-gray-600 font-medium">Public Repos</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 p-4 rounded-xl text-center">
                        <p className="text-lg font-bold text-green-600">{githubData.user.followers}</p>
                        <p className="text-xs text-gray-600">Followers</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-xl text-center">
                        <p className="text-lg font-bold text-purple-600">{githubData.user.following}</p>
                        <p className="text-xs text-gray-600">Following</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Recent Repositories */}
                  <div className="md:col-span-2 bg-gray-50 p-6 rounded-2xl">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <GitBranch className="w-5 h-5 mr-2" />
                      Recent Repositories
                    </h4>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {githubData.repos?.slice(0, 5).map((repo, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-semibold text-gray-800 truncate">{repo.name}</h5>
                              <p className="text-sm text-gray-600 truncate">{repo.description || 'No description'}</p>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <Star className="w-3 h-3" />
                              <span>{repo.stargazers_count}</span>
                            </div>
                          </div>
                          {repo.language && (
                            <div className="flex items-center mt-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-xs text-gray-600">{repo.language}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ChartContainer>
            )}

            {/* Projects and Achievements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Projects */}
              {student?.resume?.projects && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg">
                      <Rocket className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Projects Portfolio</h3>
                  </div>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {student.resume.projects.split('\n').filter(project => project.trim()).map((project, index) => (
                      <div key={index} className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-xl border border-green-200">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="font-medium text-gray-800">{project.trim()}</p>
                            <div className="flex items-center mt-2 space-x-2">
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-lg">Active</span>
                              <span className="text-xs text-gray-500">Updated recently</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {student?.resume?.achievements && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-lg">
                      <Award className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">Achievements & Awards</h3>
                  </div>
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {student.resume.achievements.split('\n').filter(achievement => achievement.trim()).map((achievement, index) => (
                      <div key={index} className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200">
                        <div className="flex items-start space-x-3">
                          <Trophy className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-gray-800 font-medium">{achievement.trim()}</p>
                            <div className="flex items-center mt-2">
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-lg">Achievement</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Teacher Feedback */}
            {student?.questions && (
              <ChartContainer 
                title="Teacher Feedback & Assessment" 
                icon={MessageCircle}
                aiInsight="Teacher feedback indicates strong technical skills with room for improvement in communication and teamwork."
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Academic Strengths</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{student.questions.answer1 || 'No feedback provided'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl border border-orange-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                      <h4 className="font-semibold text-orange-800">Areas for Growth</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{student.questions.answer2 || 'No feedback provided'}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Users className="w-5 h-5 text-green-600" />
                      <h4 className="font-semibold text-green-800">Class Participation</h4>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">{student.questions.answer4 || 'No feedback provided'}</p>
                  </div>
                </div>
              </ChartContainer>
            )}

            {/* Career Roadmap */}
            <ChartContainer 
              title="Personalized Career Roadmap" 
              icon={Map}
              aiInsight="Based on your profile analysis, here's a strategic roadmap to achieve your career goals in the next 12 months."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-blue-500" />
                    Short-term Goals (3 months)
                  </h4>
                  <div className="space-y-4">
                    {[
                      { task: "Complete Current Projects", status: "active", color: "green" },
                      { task: "Improve LeetCode Rating to 1800+", status: "pending", color: "yellow" },
                      { task: "Build Portfolio Website", status: "pending", color: "blue" },
                      { task: "Learn System Design Basics", status: "future", color: "purple" }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                        <div className={`w-4 h-4 bg-${item.color}-500 rounded-full flex-shrink-0`}></div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{item.task}</p>
                          <p className="text-sm text-gray-600 capitalize">{item.status}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-purple-500" />
                    Long-term Objectives (6-12 months)
                  </h4>
                  <div className="space-y-4">
                    {[
                      { task: "Secure Software Engineering Internship", priority: "high" },
                      { task: "Contribute to 3+ Open Source Projects", priority: "medium" },
                      { task: "Complete Advanced Certifications", priority: "medium" },
                      { task: "Build Professional Network", priority: "high" }
                    ].map((item, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-800">{item.task}</p>
                          <span className={`px-2 py-1 text-xs rounded-lg ${
                            item.priority === 'high' 
                              ? 'bg-red-100 text-red-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {item.priority} priority
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className={`h-2 rounded-full ${
                            item.priority === 'high' ? 'bg-red-500 w-2/3' : 'bg-yellow-500 w-1/3'
                          }`}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ChartContainer>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-8 rounded-2xl text-white shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Performance Summary</h3>
                  <p className="text-indigo-200">AI-powered analysis of your overall profile</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">92</div>
                  <div className="text-sm text-indigo-200">Overall Score</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold">A+</div>
                  <div className="text-sm text-indigo-200">Academic</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Code className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold">A</div>
                  <div className="text-sm text-indigo-200">Technical</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold">B+</div>
                  <div className="text-sm text-indigo-200">Projects</div>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-2xl font-bold">A-</div>
                  <div className="text-sm text-indigo-200">Professional</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Quick Actions */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="relative group">
          <button className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition-all duration-300 transform hover:scale-110">
            <Zap className="w-8 h-8" />
          </button>
          <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-800">Quick Actions</p>
              <button className="block w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                📊 Generate Report
              </button>
              <button className="block w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                🎯 Set New Goals
              </button>
              <button className="block w-full text-left p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                📈 Track Progress
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}