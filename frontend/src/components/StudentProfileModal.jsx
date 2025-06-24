import React from 'react';

function StudentProfileModal({ student, onClose }) {
  if (!student) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold mb-2">{student.student}</h2>
        <p className="text-gray-500 mb-2">Course: {student.course}</p>
        {/* Add more student info and actions here */}
      </div>
    </div>
  );
}

export default StudentProfileModal;