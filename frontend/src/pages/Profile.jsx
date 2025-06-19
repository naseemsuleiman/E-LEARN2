import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4 text-purple-700">Your Profile</h1>
      {isLoggedIn ? (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">
            Profile information will be displayed here.
          </p>
        </div>
      ) : (
        <p className="text-red-600">Please login to view your profile.</p>
      )}
    </div>
  );
};

export default Profile;
