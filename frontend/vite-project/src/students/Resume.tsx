import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import ResumeAPI from '../../api/resume';

const ResumeUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [hasExistingResume, setHasExistingResume] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Check if user has existing resume on component mount
  React.useEffect(() => {
    checkExistingResume();
  }, []);

  const checkExistingResume = async () => {
    try {
      const exists = await ResumeAPI.hasResume();
      setHasExistingResume(exists);
    } catch (error) {
      console.error('Error checking existing resume:', error);
    }
  };

  const handleFileSelect = useCallback((file) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a PDF, DOCX, or TXT file'
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({
        type: 'error',
        message: 'File size must be less than 5MB'
      });
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const uploadResume = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadStatus(null);

    try {
      let result;
      if (hasExistingResume) {
        result = await ResumeAPI.updateResume(selectedFile);
        setUploadStatus({
          type: 'success',
          message: 'Resume updated successfully!'
        });
      } else {
        result = await ResumeAPI.uploadResume(selectedFile);
        setUploadStatus({
          type: 'success',
          message: 'Resume uploaded successfully!'
        });
        setHasExistingResume(true);
      }

      setResumeData(result);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('resume-file-input');
      if (fileInput) fileInput.value = '';

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.message || 'Failed to process resume. Please try again.'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    const fileInput = document.getElementById('resume-file-input');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {hasExistingResume ? 'Update Your Resume' : 'Upload Your Resume'}
        </h2>
        <p className="text-gray-600">
          {hasExistingResume 
            ? 'Upload a new resume to update your profile with the latest information'
            : 'Upload your resume to automatically extract and organize your information'
          }
        </p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-blue-400 bg-blue-50'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center space-y-4">
          {selectedFile ? (
            <FileText className="h-12 w-12 text-green-500" />
          ) : (
            <Upload className="h-12 w-12 text-gray-400" />
          )}
          
          {selectedFile ? (
            <div className="text-center">
              <p className="text-lg font-medium text-green-700">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-lg font-medium text-gray-700">
                Drag and drop your resume here
              </p>
              <p className="text-sm text-gray-500">
                or click to browse files
              </p>
            </div>
          )}

          <input
            id="resume-file-input"
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileInputChange}
            className="hidden"
          />
          
          <label
            htmlFor="resume-file-input"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
          >
            Choose File
          </label>
        </div>
      </div>

      {/* Status Messages */}
      {uploadStatus && (
        <div className={`mt-4 p-4 rounded-lg flex items-center space-x-2 ${
          uploadStatus.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex flex-wrap gap-3">
        {selectedFile && (
          <button
            onClick={uploadResume}
            disabled={isUploading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
          >
            {isUploading && <RefreshCw className="h-4 w-4 animate-spin" />}
            <span>
              {isUploading 
                ? 'Processing...' 
                : hasExistingResume 
                ? 'Update Resume' 
                : 'Upload Resume'
              }
            </span>
          </button>
        )}

        {selectedFile && (
          <button
            onClick={resetUpload}
            disabled={isUploading}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {/* File Format Info */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Supported File Formats:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• PDF files (.pdf)</li>
          <li>• Word documents (.docx)</li>
          <li>• Text files (.txt)</li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          Maximum file size: 5MB
        </p>
      </div>

      {/* Resume Data Preview */}
      {resumeData && (
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2 flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Resume Processed Successfully</span>
          </h3>
          <p className="text-sm text-blue-600">
            Your resume has been analyzed and the information has been extracted and organized automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;