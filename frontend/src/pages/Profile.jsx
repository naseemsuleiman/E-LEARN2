import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { isLoggedIn, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      api.get('/profile/').then(res => {
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
    await api.patch('/profile/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  if (!isLoggedIn) return <p className="text-red-600">Please login to view your profile.</p>;
  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4 text-purple-700">Your Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-4">
            <img src={profile.avatar || '/default-avatar.png'} alt="avatar" className="w-20 h-20 rounded-full object-cover border" />
            <input type="file" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <div>
            <label className="block font-semibold">Username</label>
            <input type="text" value={user?.username} disabled className="bg-gray-100 p-2 rounded w-full" />
          </div>
          <div>
            <label className="block font-semibold">Bio</label>
            <textarea value={bio} onChange={e => setBio(e.target.value)} className="bg-gray-100 p-2 rounded w-full" />
          </div>
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Update Profile</button>
          {success && <div className="text-green-600">Profile updated!</div>}
        </form>
      </div>
    </div>
  );
};

export default Profile;
