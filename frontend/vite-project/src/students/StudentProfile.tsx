import React from 'react';

const StudentProfile = ({ studentData, onUpdate }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Student Profile</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Name</label>
            <p className="text-lg text-gray-900">{studentData.name}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg text-gray-900">{studentData.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">USN</label>
            <p className="text-lg text-gray-900">{studentData.usn}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">User Type</label>
            <p className="text-lg text-gray-900 capitalize">{studentData.type}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">LeetCode Profile</label>
            {studentData.leetcodeurl ? (
              <a 
                href={studentData.leetcodeurl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg text-blue-600 hover:text-blue-800 block"
              >
                {studentData.leetcodeurl}
              </a>
            ) : (
              <p className="text-lg text-gray-400">Not provided</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">GitHub Profile</label>
            {studentData.githuburl ? (
              <a 
                href={studentData.githuburl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-lg text-blue-600 hover:text-blue-800 block"
              >
                {studentData.githuburl}
              </a>
            ) : (
              <p className="text-lg text-gray-400">Not provided</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Teacher ID</label>
            <p className="text-lg text-gray-900">
              {studentData.teacher_id || 'Not assigned'}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Current Semester</label>
            <p className="text-lg text-gray-900">
              {studentData.semester?.current_semester || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t">
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-800">Questions</div>
            <div className="text-blue-600">
              {studentData.questions ? 'Assigned' : 'None'}
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-800">Marks</div>
            <div className="text-green-600">
              {studentData.marks ? 'Recorded' : 'None'}
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded">
            <div className="font-medium text-purple-800">Interests</div>
            <div className="text-purple-600">
              {studentData.interests?.length || 0} items
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;