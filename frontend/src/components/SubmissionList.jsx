import React, { useEffect, useState } from 'react';
import apiService, { api } from '../services/api';


const SubmissionList = ({ assignmentId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
  if (!assignmentId) return;

  const fetchSubmissions = async () => {
    try {
      const res = await api.get(`/api/assignments/${assignmentId}/submissions/`);
      setSubmissions(res.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      setSubmissions([]);
    } finally {
      setLoading(false); // <-- THIS IS MISSING!
    }
  };

  fetchSubmissions();
}, [assignmentId]);


 const handleGrade = async (e) => {
  e.preventDefault();
  if (!selectedSubmission) return;

  try {
    await api.patch(`/api/submissions/${selectedSubmission}/`, { grade, feedback });
    setSuccess(true);
    setGrade('');
    setFeedback('');

    // Optionally re-fetch submissions to reflect the new grade
    const res = await api.get(`/api/assignments/${assignmentId}/submissions/`);
    setSubmissions(res.data);

    setTimeout(() => setSuccess(false), 2000);
  } catch (error) {
    console.error('Failed to grade submission:', error);
    alert('Failed to submit grade');
  }
};

  if (loading) return <div>Loading submissions...</div>;
  if (!submissions.length) return <div>No submissions yet.</div>;

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Submissions</h3>
      <ul className="space-y-2">
        {submissions.map((s) => (
          <li key={s.id} className="bg-gray-50 rounded p-2 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-bold">{s.student?.username || 'Student'}</div>

              <div className="text-gray-600">Submitted: {new Date(s.submitted_at).toLocaleString()}</div>
              <div className="text-gray-700">{s.text}</div>
              {s.file && <a href={s.file} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Download File</a>}
              <div className="text-green-600">Grade: {s.grade || 'Not graded'}</div>
              <div className="text-gray-500">Feedback: {s.feedback || '-'}</div>
            </div>
            <button className="bg-purple-600 text-white px-3 py-1 rounded mt-2 md:mt-0" onClick={() => setSelectedSubmission(s.id)}>
              Grade
            </button>
          </li>
        ))}
      </ul>
      {selectedSubmission && (
        <form onSubmit={handleGrade} className="mt-4 bg-white p-4 rounded shadow">
          <h4 className="font-semibold mb-2">Grade Submission</h4>
          <input
            type="number"
            value={grade}
            onChange={e => setGrade(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Enter grade"
            required
          />
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            placeholder="Enter feedback"
          />
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Submit Grade</button>
          {success && <div className="text-green-600 mt-2">Graded successfully!</div>}
        </form>
      )}
    </div>
  );
};

export default SubmissionList;
