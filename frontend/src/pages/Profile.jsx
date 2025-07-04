import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService, { api } from '../services/api';

const Profile = () => {
  const { isLoggedIn, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/api/profile/').then(res => {
        setProfile(res.data);
        setBio(res.data.bio || '');
        setLoading(false);
      });
    }
  }, [isLoggedIn]);

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('bio', bio);
    if (avatar) formData.append('avatar', avatar);
    await api.patch('/api/profile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  if (!isLoggedIn) return <p className="text-red-600">Please login to view your profile.</p>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8 bg-gradient-to-br from-emerald-50 via-white to-teal-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-emerald-700">Your Profile</h1>
      <div className="bg-white rounded-lg shadow-lg p-6 border border-emerald-100">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <img src={profile.avatar || '/default-avatar.png'} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-emerald-200" />
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-sm text-gray-600" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Username</label>
            <input type="text" value={user?.username} disabled className="bg-gray-100 p-2 rounded-lg w-full border border-gray-200" />
          </div>
          <div>
            <label className="block font-semibold text-gray-700">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="bg-gray-100 p-2 rounded-lg w-full border border-gray-200" />
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors">Update Profile</button>
          {success && <div className="text-emerald-600 font-medium">Profile updated!</div>}
        </form>
      </div>
    </div>
  );
};

export default Profile;
