import React, { useState, useEffect } from 'react';
import { studentAPI } from '../../api/student';

const StudentQuestions = ({ studentData, onUpdate }) => {
  const [questions, setQuestions] = useState(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (studentData?.questions) {
      setQuestions(studentData.questions);
      setFormData({
        answer1: studentData.questions.answer1 || '',
        answer2: studentData.questions.answer2 || '',
        answer3: studentData.questions.answer3 || '',
        answer4: studentData.questions.answer4 || '',
        answer5: studentData.questions.answer5 || ''
      });
    }
  }, [studentData]);

  const fetchQuestions = async () => {
    try {
      const data = await studentAPI.getQuestions();
      setQuestions(data);
      setFormData({
        answer1: data.answer1 || '',
        answer2: data.answer2 || '',
        answer3: data.answer3 || '',
        answer4: data.answer4 || '',
        answer5: data.answer5 || ''
      });
    } catch (err) {
      setError('Failed to load questions: ' + err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const updatedQuestions = await studentAPI.updateAnswers(formData);
      setQuestions(updatedQuestions);
      setEditing(false);
      onUpdate();
    } catch (err) {
      setError('Failed to update answers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    if (questions) {
      setFormData({
        answer1: questions.answer1 || '',
        answer2: questions.answer2 || '',
        answer3: questions.answer3 || '',
        answer4: questions.answer4 || '',
        answer5: questions.answer5 || ''
      });
    }
    setEditing(false);
    setError(null);
  };

  const questionPairs = [
    { questionKey: 'question1', answerKey: 'answer1', label: 'Question 1' },
    { questionKey: 'question2', answerKey: 'answer2', label: 'Question 2' },
    { questionKey: 'question3', answerKey: 'answer3', label: 'Question 3' },
    { questionKey: 'question4', answerKey: 'answer4', label: 'Question 4' },
    { questionKey: 'question5', answerKey: 'answer5', label: 'Question 5' }
  ];

  if (error && !questions) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Questions & Answers</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">❓</div>
          <p className="text-gray-600">No questions have been assigned by your teacher yet.</p>
        </div>
      </div>
    );
  }

  if (!questions && !error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">Questions & Answers</h2>
        <p className="text-gray-500">Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Questions & Answers</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit Answers
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Answers'}
            </button>
            <button
              onClick={cancelEdit}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {questionPairs.map(({ questionKey, answerKey, label }) => {
          const question = questions[questionKey];
          const answer = questions[answerKey];
          
          if (!question) return null;

          return (
            <div key={questionKey} className="border border-gray-200 rounded-lg p-4">
              <div className="mb-3">
                <h3 className="font-semibold text-gray-800 mb-2">{label}</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded">
                  {question}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer:
                </label>
                {editing ? (
                  <textarea
                    name={answerKey}
                    value={formData[answerKey]}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your answer here..."
                  />
                ) : (
                  <div className="bg-blue-50 p-3 rounded min-h-[100px]">
                    {answer ? (
                      <p className="text-gray-800 whitespace-pre-wrap">{answer}</p>
                    ) : (
                      <p className="text-gray-500 italic">No answer provided yet</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {questions && (
        <div className="mt-6 pt-6 border-t">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-800">Total Questions</div>
              <div className="text-xl font-bold text-blue-900">
                {questionPairs.filter(({questionKey}) => questions[questionKey]).length}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-green-800">Answered</div>
              <div className="text-xl font-bold text-green-900">
                {questionPairs.filter(({answerKey}) => questions[answerKey]).length}
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-sm font-medium text-orange-800">Pending</div>
              <div className="text-xl font-bold text-orange-900">
                {questionPairs.filter(({questionKey, answerKey}) => 
                  questions[questionKey] && !questions[answerKey]
                ).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentQuestions;