// import React, { useState } from 'react';
// import { studentAPI } from '../../api/student';

// const TeacherAssignment = ({ studentData, onUpdate }) => {
//   const [teacherId, setTeacherId] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(false);
// const teaschersavalible=async ()=>{const data=await studentAPI.getAllTeachers();console.log(data);return(data);}
// teaschersavalible();
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!teacherId || isNaN(teacherId)) {
//       setError('Please enter a valid teacher ID');
//       return;
//     }

//     try {
//       setLoading(true);
//       setError(null);
//       setSuccess(false);
      
//       await studentAPI.assignTeacher(parseInt(teacherId));
//       setSuccess(true);
//       setTeacherId('');
//       onUpdate();
      
//       setTimeout(() => setSuccess(false), 3000);
//     } catch (err) {
//       setError('Failed to assign teacher: ' + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-xl font-bold mb-6">Teacher Assignment</h2>
      
//       <div className="mb-6">
//         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//           <h3 className="font-semibold text-blue-800 mb-2">Current Status</h3>
//           {studentData.teacher_id ? (
//             <div className="flex items-center space-x-2">
//               <span className="text-green-600">✓</span>
//               <span className="text-gray-700">
//                 Assigned to Teacher ID: <strong>{studentData.teacher_id}</strong>
//               </span>
//             </div>
//           ) : (
//             <div className="flex items-center space-x-2">
//               <span className="text-orange-600">⚠</span>
//               <span className="text-gray-700">No teacher assigned</span>
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="space-y-6">
//         <div>
//           <h3 className="text-lg font-semibold mb-3">
//             {studentData.teacher_id ? 'Change Teacher Assignment' : 'Assign Teacher'}
//           </h3>
          
//           {error && (
//             <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
//               {error}
//             </div>
//           )}

//           {success && (
//             <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
//               Teacher assigned successfully!
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Teacher ID *
//               </label>
//               <input
//                 type="number"
//                 value={teacherId}
//                 onChange={(e) => setTeacherId(e.target.value)}
//                 required
//                 className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder="Enter teacher ID"
//               />
//               <p className="mt-1 text-sm text-gray-500">
//                 Contact your teacher to get their ID number
//               </p>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
//             >
//               {loading ? 'Assigning...' : (studentData.teacher_id ? 'Update Assignment' : 'Assign Teacher')}
//             </button>
//           </form>
//         </div>

//         <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
//           <h4 className="font-semibold text-gray-800 mb-2">How to Find Your Teacher</h4>
//           <ul className="space-y-1 text-sm text-gray-600">
//             <li>• Contact your teacher directly for their ID number</li>
//             <li>• Check your course materials or syllabus</li>
//             <li>• Ask your classmates who are already assigned</li>
//             <li>• Contact the academic office for assistance</li>
//           </ul>
//         </div>

//         {studentData.teacher_id && (
//           <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//             <h4 className="font-semibold text-green-800 mb-2">Benefits of Teacher Assignment</h4>
//             <ul className="space-y-1 text-sm text-green-700">
//               <li>• Receive personalized questions and assignments</li>
//               <li>• Get feedback on your academic progress</li>
//               <li>• Access to mentor guidance and support</li>
//               <li>• Participate in teacher-specific activities</li>
//             </ul>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };
// export default TeacherAssignment;
import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../api/student';

const TeacherAssignment = ({ studentData, onUpdate }) => {
  const [teacherId, setTeacherId] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Fetch all available teachers when component mounts
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await studentAPI.getAllTeachers();
        setTeachers(data); // expects an array like [{id, name, email, ...}]
      } catch (err) {
        console.error("Error fetching teachers:", err);
        setError("Failed to load teachers list");
      }
    };
    fetchTeachers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teacherId || isNaN(teacherId)) {
      setError('Please select a valid teacher');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await studentAPI.assignTeacher(parseInt(teacherId));
      setSuccess(true);
      setTeacherId('');
      onUpdate();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to assign teacher: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6">Teacher Assignment</h2>

      <div className="mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">Current Status</h3>
          {studentData.teacher_id ? (
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✓</span>
              <span className="text-gray-700">
                Assigned to Teacher ID: <strong>{studentData.teacher_id}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-orange-600">⚠</span>
              <span className="text-gray-700">No teacher assigned</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3">
            {studentData.teacher_id ? 'Change Teacher Assignment' : 'Assign Teacher'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Teacher assigned successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Teacher *
              </label>
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                required
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select a teacher --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading
                ? 'Assigning...'
                : studentData.teacher_id
                ? 'Update Assignment'
                : 'Assign Teacher'}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-800 mb-2">How to Find Your Teacher</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            <li>• Contact your teacher directly for their ID number</li>
            <li>• Check your course materials or syllabus</li>
            <li>• Ask your classmates who are already assigned</li>
            <li>• Contact the academic office for assistance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignment;
