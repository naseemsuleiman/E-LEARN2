import React, { useEffect, useState } from 'react';
import api from '../services/api';
import SubmissionList from './SubmissionList';
import { useNavigate } from 'react-router-dom';

const AssignmentList = ({ courseId, showSubmissionForm }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [success, setSuccess] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get(`/assignments/?course=${courseId}`);
        setAssignments(res.data);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    await api.post(`/assignments/${selectedAssignment}/submissions/`, { text: submissionText });
    setSuccess(true);
    setSubmissionText('');
    setTimeout(() => setSuccess(false), 2000);
    // Show toast if available
    if (window.showToast) window.showToast('Submission successful!', 'success');
  };

  if (loading) return <div>Loading assignments...</div>;
  if (!assignments.length) return <div>No assignments found.</div>;

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Assignments</h2>
      <ul className="space-y-2">
        {assignments.map((a) => (
          <li key={a.id} className="bg-gray-100 rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-bold">{a.title}</div>
              <div className="text-gray-600">Due: {a.due_date}</div>
            </div>
            <div className="flex space-x-2 mt-2 md:mt-0">
              {showSubmissionForm && (
                <button
                  className="bg-purple-600 text-white px-3 py-1 rounded"
                  onClick={() => setSelectedAssignment(a.id)}
                >
                  Submit
                </button>
              )}
              {!showSubmissionForm && (
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => setShowSubmissions(a.id)}
                >
                  View Submissions
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {showSubmissionForm && selectedAssignment && (
        <form onSubmit={handleSubmit} className="mt-4 bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Submit Assignment</h3>
          <textarea
            value={submissionText}
            onChange={e => setSubmissionText(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Enter your answer or notes..."
            required
          />
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Submit</button>
          {success && <div className="text-green-600 mt-2">Submission successful!</div>}
        </form>
      )}
      {!showSubmissionForm && showSubmissions && (
        <SubmissionList assignmentId={showSubmissions} />
      )}
    </div>
  );
};

export default AssignmentList;