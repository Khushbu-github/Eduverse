// import React, { useEffect, useState } from "react";
// import { studentAPI } from "../../api/student";

// const StudentMarks = ({ onUpdate }) => {
//   const [marks, setMarks] = useState({});
//   const [currentSemester, setCurrentSemester] = useState(null);
//   const [formData, setFormData] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [saving, setSaving] = useState(false);

//   const semesters = [
//     { key: "sem1_marks", label: "Semester 1", semNo: 1 },
//     { key: "sem2_marks", label: "Semester 2", semNo: 2 },
//     { key: "sem3_marks", label: "Semester 3", semNo: 3 },
//     { key: "sem4_marks", label: "Semester 4", semNo: 4 },
//     { key: "sem5_marks", label: "Semester 5", semNo: 5 },
//     { key: "sem6_marks", label: "Semester 6", semNo: 6 },
//     { key: "sem7_marks", label: "Semester 7", semNo: 7 },
//     { key: "sem8_marks", label: "Semester 8", semNo: 8 },
//   ];

//   // Build payload to send to backend
//   const buildPayload = () => {
//     const payload = {};
    
//     // Only include semesters that are less than current semester
//     semesters.forEach((sem) => {
//       if (currentSemester !== null && sem.semNo < currentSemester) {
//         const value = formData[sem.key];
//         if (value === "" || value === null || value === undefined) {
//           payload[sem.key] = null;
//         } else {
//           const numValue = parseFloat(value);
//           if (!isNaN(numValue)) {
//             payload[sem.key] = numValue;
//           } else {
//             payload[sem.key] = null;
//           }
//         }
//       }
//     });
    
//     return payload;
//   };

//   // Fetch marks + current semester
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         const [marksData, semData] = await Promise.all([
//           studentAPI.getMarks(),
//           studentAPI.getCurrentSemester()
//         ]);

//         // Handle semester data - backend returns int directly
//         const sem = typeof semData === "number" ? semData : semData?.current_semester || 1;
        
//         setMarks(marksData || {});
//         setFormData(marksData || {});
//         setCurrentSemester(sem);
//       } catch (err) {
//         console.error("Failed to fetch data", err);
//         setError("Failed to load marks data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Handle input change
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // Handle submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     try {
//       setSaving(true);
//       setError(null);
      
//       const payload = buildPayload();
      
//       // Check if there's actually something to update
//       if (Object.keys(payload).length === 0) {
//         setError("No marks to update for completed semesters.");
//         return;
//       }

//       await studentAPI.updateMarks(payload);
//       const updatedMarks = await studentAPI.getMarks();
      
//       setMarks(updatedMarks);
//       setFormData(updatedMarks);
      
//       if (onUpdate) {
//         onUpdate(updatedMarks);
//       }
      
//       // Optional: Show success message
//       console.log("Marks updated successfully");
      
//     } catch (err) {
//       console.error("Failed to update marks", err);
//       setError(err.message || "Failed to update marks. Please try again.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <p>Loading marks data...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="error-container">
//         <p style={{ color: 'red' }}>{error}</p>
//         <button onClick={() => window.location.reload()}>
//           Retry
//         </button>
//       </div>
//     );
//   }

//   // Filter semesters that can have marks entered (completed semesters only)
//   const allowedSemesters = semesters.filter(
//     (sem) => currentSemester !== null && sem.semNo < currentSemester
//   );

//   return (
//     <div className="student-marks-container">
//       <h3>Update Your Marks</h3>
      
//       <div className="semester-info">
//         <p><strong>Current Semester:</strong> {currentSemester}</p>
//         <p><em>You can only enter marks for completed semesters.</em></p>
//       </div>

//       {currentSemester === 1 ? (
//         <div className="no-marks-message">
//           <p>You cannot add marks yet because you are in Semester 1.</p>
//           <p>Complete your first semester to start entering marks.</p>
//         </div>
//       ) : allowedSemesters.length === 0 ? (
//         <div className="no-marks-message">
//           <p>No completed semesters found to enter marks for.</p>
//         </div>
//       ) : (
//         <form onSubmit={handleSubmit} className="marks-form">
//           <div className="marks-grid">
//             {semesters.map((sem) => {
//               const isAllowed = sem.semNo < currentSemester;
//               const currentValue = formData[sem.key] ?? "";
              
//               return (
//                 <div key={sem.key} className="marks-field">
//                   <label htmlFor={sem.key}>
//                     {sem.label}:
//                     {!isAllowed && <span className="disabled-label"> (Not completed)</span>}
//                   </label>
//                   <input
//                     id={sem.key}
//                     type="number"
//                     name={sem.key}
//                     value={currentValue}
//                     onChange={handleChange}
//                     placeholder={isAllowed ? "Enter marks (0–10)" : "N/A"}
//                     min="0"
//                     max="10"
//                     step="0.1"
//                     disabled={!isAllowed || saving}
//                     className={!isAllowed ? "disabled-input" : ""}
//                   />
//                 </div>
//               );
//             })}
//           </div>

//           <div className="form-actions">
//             <button 
//               type="submit" 
//               disabled={saving || allowedSemesters.length === 0}
//               className="save-button"
//             >
//               {saving ? "Saving..." : "Save Marks"}
//             </button>
//           </div>
//         </form>
//       )}

//       <style jsx>{`
//         .student-marks-container {
//           max-width: 600px;
//           margin: 0 auto;
//           padding: 20px;
//         }

//         .semester-info {
//           background-color: #f5f5f5;
//           padding: 15px;
//           border-radius: 8px;
//           margin-bottom: 20px;
//         }

//         .semester-info p {
//           margin: 5px 0;
//         }

//         .no-marks-message {
//           background-color: #e3f2fd;
//           padding: 20px;
//           border-radius: 8px;
//           text-align: center;
//         }

//         .marks-grid {
//           display: grid;
//           grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
//           gap: 15px;
//           margin-bottom: 20px;
//         }

//         .marks-field {
//           display: flex;
//           flex-direction: column;
//         }

//         .marks-field label {
//           font-weight: 600;
//           margin-bottom: 5px;
//           color: #333;
//         }

//         .disabled-label {
//           color: #999;
//           font-size: 0.9em;
//         }

//         .marks-field input {
//           padding: 8px 12px;
//           border: 1px solid #ddd;
//           border-radius: 4px;
//           font-size: 14px;
//         }

//         .marks-field input:focus {
//           outline: none;
//           border-color: #4CAF50;
//           box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
//         }

//         .disabled-input {
//           background-color: #f5f5f5 !important;
//           color: #999 !important;
//           cursor: not-allowed !important;
//         }

//         .form-actions {
//           text-align: center;
//           padding-top: 20px;
//           border-top: 1px solid #eee;
//         }

//         .save-button {
//           background-color: #4CAF50;
//           color: white;
//           padding: 12px 30px;
//           border: none;
//           border-radius: 6px;
//           font-size: 16px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.3s ease;
//         }

//         .save-button:hover:not(:disabled) {
//           background-color: #45a049;
//           transform: translateY(-1px);
//         }

//         .save-button:disabled {
//           background-color: #cccccc;
//           cursor: not-allowed;
//           transform: none;
//         }

//         .loading-container, .error-container {
//           text-align: center;
//           padding: 40px 20px;
//         }

//         .error-container button {
//           background-color: #f44336;
//           color: white;
//           padding: 10px 20px;
//           border: none;
//           border-radius: 4px;
//           cursor: pointer;
//           margin-top: 10px;
//         }

//         .error-container button:hover {
//           background-color: #d32f2f;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default StudentMarks;
import React, { use, useEffect, useState } from "react";
import { studentAPI } from "../../api/student";
import { useNavigate } from "react-router-dom";
const StudentMarks = ({ onUpdate }) => {
  const [marks, setMarks] = useState({});
  const [currentSemester, setCurrentSemester] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
const nav=useNavigate();
  const semesters = [
    { key: "sem1_marks", label: "Semester 1", semNo: 1, apiKey: "sem1" },
    { key: "sem2_marks", label: "Semester 2", semNo: 2, apiKey: "sem2" },
    { key: "sem3_marks", label: "Semester 3", semNo: 3, apiKey: "sem3" },
    { key: "sem4_marks", label: "Semester 4", semNo: 4, apiKey: "sem4" },
    { key: "sem5_marks", label: "Semester 5", semNo: 5, apiKey: "sem5" },
    { key: "sem6_marks", label: "Semester 6", semNo: 6, apiKey: "sem6" },
    { key: "sem7_marks", label: "Semester 7", semNo: 7, apiKey: "sem7" },
    { key: "sem8_marks", label: "Semester 8", semNo: 8, apiKey: "sem8" },
  ];

  // Helper function to map backend data to frontend form data
  const mapBackendToFormData = (backendData) => {
    const mappedData = {};
    semesters.forEach((semester) => {
      // Map from backend key (sem1) to frontend key (sem1_marks)
      const backendValue = backendData[semester.apiKey];
      mappedData[semester.key] = backendValue !== null && backendValue !== undefined ? backendValue : "";
    });
    return mappedData;
  };

  // Build payload to send to backend
  const buildPayload = () => {
    const payload = {};
    
    // Only include semesters that are less than current semester
    semesters.forEach((sem) => {
      if (currentSemester !== null && sem.semNo < currentSemester) {
        const value = formData[sem.key];
        if (value === "" || value === null || value === undefined) {
          payload[sem.apiKey] = null; // Use apiKey (sem1, sem2, etc.) for backend
        } else {
          const numValue = parseInt(value, 10);
          if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
            payload[sem.apiKey] = numValue; // Use apiKey (sem1, sem2, etc.) for backend
          } else {
            payload[sem.apiKey] = null;
          }
        }
      }
    });
    
    return payload;
  };

  // Fetch marks + current semester
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [marksData, semData] = await Promise.all([
          studentAPI.getMarks(),
          studentAPI.getCurrentSemester()
        ]);

        // Handle semester data - backend returns int directly
        const sem = typeof semData === "number" ? semData : semData?.current_semester || 1;
        
        console.log("Fetched marks data:", marksData); // Debug log
        
        setMarks(marksData || {});
        
        // Map backend data to form data format
        const mappedFormData = mapBackendToFormData(marksData || {});
        console.log("Mapped form data:", mappedFormData); // Debug log
        
        setFormData(mappedFormData);
        setCurrentSemester(sem);
      } catch (err) {
        console.error("Failed to fetch data", err);
        setError("Set semster first. " + (err.message || "Failed to load marks data. Please try again."));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate input - only allow integers between 0-10
    if (value !== "" && (isNaN(value) || parseInt(value) < 0 || parseInt(value) > 10)) {
      return; // Don't update state for invalid values
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError(null);
      
      const payload = buildPayload();
      
      // Debug: Log the payload
      console.log("Sending marks payload:", payload);
      console.log("Current semester:", currentSemester);
      
      // Check if there's actually something to update
      if (Object.keys(payload).length === 0) {
        setError("No marks to update for completed semesters.");
        return;
      }

      const response = await studentAPI.updateMarks(payload);
      console.log("Update response:", response);
      const updatedMarks = await studentAPI.getMarks();
      
      // Map backend response to frontend form data
      const mappedFormData = mapBackendToFormData(updatedMarks || {});
      
      setMarks(updatedMarks);
      setFormData(mappedFormData);
      
      if (onUpdate) {
        onUpdate(updatedMarks);
      }
      
      // Optional: Show success message
      console.log("Marks updated successfully");
      
    } catch (err) {
      console.error("Failed to update marks", err);
      setError(err.message || "Failed to update marks. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marks data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter semesters that can have marks entered (completed semesters only)
  const allowedSemesters = semesters.filter(
    (sem) => currentSemester !== null && sem.semNo < currentSemester
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800">Update Your Marks</h3>
        </div>
        
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <p className="font-medium text-blue-800">Current Semester: {currentSemester}</p>
            </div>
            <p className="text-blue-700 text-sm">
              You can only enter marks for completed semesters (0-10).
            </p>
          </div>

          {currentSemester === 1 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-yellow-600 mb-2">
                <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-yellow-800 font-medium mb-2">No marks to enter yet</p>
              <p className="text-yellow-700">
                You cannot add marks yet because you are in Semester 1. Complete your first semester to start entering marks.
              </p>
            </div>
          ) : allowedSemesters.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-600">No completed semesters found to enter marks for.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semesters.map((sem) => {
                  const isAllowed = sem.semNo < currentSemester;
                  const currentValue = formData[sem.key] ?? "";
                  
                  return (
                    <div key={sem.key} className="space-y-2">
                      <label 
                        htmlFor={sem.key}
                        className={`block text-sm font-medium ${
                          isAllowed ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {sem.label}
                        {!isAllowed && (
                          <span className="text-xs text-gray-400 ml-1">(Not completed)</span>
                        )}
                      </label>
                      <input
                        id={sem.key}
                        type="number"
                        name={sem.key}
                        value={currentValue}
                        onChange={handleChange}
                        placeholder={isAllowed ? "Enter marks (0–10)" : "N/A"}
                        min="0"
                        max="10"
                        step="1"
                        disabled={!isAllowed || saving}
                        className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                          !isAllowed 
                            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                            : saving
                            ? 'bg-gray-50 border-gray-200 cursor-not-allowed'
                            : 'border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-center pt-4 border-t border-gray-200">
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || allowedSemesters.length === 0}
                  className={`px-6 py-3 rounded-md font-medium text-white transition-all ${
                    saving || allowedSemesters.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-500 hover:bg-green-600 hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                >
                  {saving ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    'Save Marks'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentMarks;