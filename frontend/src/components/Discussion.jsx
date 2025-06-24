import React, { useEffect, useState } from 'react';
import api from '../services/api';

const Discussion = ({ courseId }) => {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState('');
  const [selectedThread, setSelectedThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  useEffect(() => {
    api.get(`/courses/${courseId}/discussions/`).then(res => setThreads(res.data));
  }, [courseId]);

  const handleCreateThread = async (e) => {
    e.preventDefault();
    const res = await api.post(`/courses/${courseId}/discussions/`, { title: newThread });
    setThreads([...threads, res.data]);
    setNewThread('');
  };

  const handleSelectThread = async (threadId) => {
    setSelectedThread(threadId);
    const res = await api.get(`/discussions/${threadId}/posts/`);
    setPosts(res.data);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!selectedThread) return;
    const res = await api.post(`/discussions/${selectedThread}/posts/`, { content: newPost });
    setPosts([...posts, res.data]);
    setNewPost('');
  };

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Discussion Forum</h2>
      <form onSubmit={handleCreateThread} className="mb-4 flex">
        <input
          value={newThread}
          onChange={e => setNewThread(e.target.value)}
          className="flex-1 p-2 border rounded-l"
          placeholder="Start a new thread..."
          required
        />
        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-r">Post</button>
      </form>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-1/3">
          <ul className="space-y-2">
            {threads.map(t => (
              <li key={t.id} className={`p-2 rounded cursor-pointer ${selectedThread === t.id ? 'bg-purple-100' : 'bg-gray-100'}`}
                onClick={() => handleSelectThread(t.id)}>
                {t.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-2/3">
          {selectedThread ? (
            <>
              <ul className="space-y-2 mb-2">
                {posts.map(p => (
                  <li key={p.id} className="bg-white rounded p-2 border">
                    <div className="font-bold">{p.author}</div>
                    <div>{p.content}</div>
                    <div className="text-xs text-gray-500">{new Date(p.created_at).toLocaleString()}</div>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleCreatePost} className="flex">
                <input
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  className="flex-1 p-2 border rounded-l"
                  placeholder="Reply..."
                  required
                />
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-r">Reply</button>
              </form>
            </>
          ) : (
            <div className="text-gray-500">Select a thread to view posts.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Discussion;
