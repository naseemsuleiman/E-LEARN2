import React, { useEffect, useState } from 'react';
import apiService, { api } from '../services/api';

const daysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();

const Calendar = () => {
  const [assignments, setAssignments] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchAssignments = async () => {
      const res = await api.get('/api/assignments/');
      setAssignments(res.data);
    };
    fetchAssignments();
  }, []);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const days = daysInMonth(month, year);

  const assignmentsByDay = {};
  assignments.forEach(a => {
    const due = new Date(a.due_date);
    if (due.getMonth() === month && due.getFullYear() === year) {
      const day = due.getDate();
      if (!assignmentsByDay[day]) assignmentsByDay[day] = [];
      assignmentsByDay[day].push(a);
    }
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Assignment Calendar</h2>
      <div className="grid grid-cols-7 gap-2 bg-gray-100 p-2 rounded">
        {[...Array(days)].map((_, i) => (
          <div key={i} className="h-20 bg-white rounded shadow p-1 flex flex-col">
            <div className="font-bold text-xs">{i + 1}</div>
            {assignmentsByDay[i + 1]?.map(a => (
              <div key={a.id} className="text-xs text-purple-700 truncate" title={a.title}>{a.title}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
