import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  DocumentTextIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowUpTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function Assignments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [id]);

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/courses/${id}/assignments/`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!submissionText.trim() && !submissionFile) {
      alert('Please provide a submission text or file.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('text_submission', submissionText);
      if (submissionFile) {
        formData.append('file_submission', submissionFile);
      }

      await api.post(`/assignments/${assignmentId}/submissions/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setSubmissionText('');
      setSubmissionFile(null);
      setSelectedAssignment(null);
      
      // Refresh assignments
      fetchAssignments();
      
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getSubmissionStatus = (assignment) => {
    if (assignment.submissions && assignment.submissions.length > 0) {
      const submission = assignment.submissions[0];
      if (submission.grade !== null) {
        return { status: 'graded', grade: submission.grade };
      }
      return { status: 'submitted', grade: null };
    }
    return { status: 'not_submitted', grade: null };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Assignments</h1>
          <p className="text-gray-600">Complete and submit your assignments</p>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
            <p className="text-gray-600 mb-6">
              Your instructor hasn't created any assignments for this course yet.
            </p>
            <button
              onClick={() => navigate(`/courses/${id}/learn`)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              Back to Course
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map(assignment => {
              const submissionStatus = getSubmissionStatus(assignment);
              
              return (
                <div key={assignment.id} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {assignment.title}
                      </h3>
                      <p className="text-gray-600 mb-3">{assignment.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          <span>Due: {formatDate(assignment.due_date)}</span>
                        </div>
                        <div className="flex items-center">
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          <span>Max Points: {assignment.max_points}</span>
                        </div>
                      </div>

                      {/* Submission Status */}
                      <div className="mb-4">
                        {submissionStatus.status === 'graded' && (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="font-medium">Graded: {submissionStatus.grade}/{assignment.max_points} points</span>
                          </div>
                        )}
                        {submissionStatus.status === 'submitted' && (
                          <div className="flex items-center space-x-2 text-blue-600">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="font-medium">Submitted - Awaiting Grade</span>
                          </div>
                        )}
                        {submissionStatus.status === 'not_submitted' && (
                          <div className="flex items-center space-x-2 text-red-600">
                            <XCircleIcon className="h-5 w-5" />
                            <span className="font-medium">Not Submitted</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      {submissionStatus.status === 'not_submitted' && (
                        <button
                          onClick={() => setSelectedAssignment(assignment)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm"
                        >
                          Submit Assignment
                        </button>
                      )}
                      {submissionStatus.status === 'submitted' && (
                        <button
                          onClick={() => setSelectedAssignment(assignment)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          View Submission
                        </button>
                      )}
                      {submissionStatus.status === 'graded' && (
                        <button
                          onClick={() => setSelectedAssignment(assignment)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                        >
                          View Feedback
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Submission Form */}
                  {selectedAssignment?.id === assignment.id && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Submit Assignment</h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Text Submission
                          </label>
                          <textarea
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            rows={6}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Write your assignment here..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            File Submission (Optional)
                          </label>
                          <input
                            type="file"
                            onChange={(e) => setSubmissionFile(e.target.files[0])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            Accepted formats: PDF, DOC, DOCX, TXT, ZIP, RAR
                          </p>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleSubmitAssignment(assignment.id)}
                            disabled={submitting}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            <ArrowUpTrayIcon className="h-4 w-4" />
                            <span>{submitting ? 'Submitting...' : 'Submit Assignment'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAssignment(null);
                              setSubmissionText('');
                              setSubmissionFile(null);
                            }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 