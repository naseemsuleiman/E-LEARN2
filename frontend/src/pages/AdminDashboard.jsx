import React, { useState, useEffect } from 'react'

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>Users</h2>
      <ul>
        {adminData.users.map((user) => (
          <li key={user.id}>
            {user.username} <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <h2>Courses</h2>
      <ul>
        {adminData.courses.map((course) => (
          <li key={course.id}>
            {course.title} <button onClick={() => handleDeleteCourse(course.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>

  );
}

export default AdminDashboard;
