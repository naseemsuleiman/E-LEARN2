import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [thread, setThread] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const msgs = await apiService.getMessages();
      // Group by other user (instructor or sender)
      const users = {};
      msgs.forEach(m => {
        const other = m.sender.id === user.id ? m.instructor : m.sender;
        if (!users[other.id]) users[other.id] = { user: other, last: m, messages: [] };
        users[other.id].messages.push(m);
        if (!users[other.id].last || new Date(m.created_at) > new Date(users[other.id].last.created_at)) {
          users[other.id].last = m;
        }
      });
      setConversations(Object.values(users));
    } finally {
      setLoading(false);
    }
  };

  const openThread = async (otherUser) => {
    setSelectedUser(otherUser);
    setLoading(true);
    try {
      const msgs = await apiService.getMessageThread(otherUser.id);
      setThread(msgs);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;
    setSending(true);
    try {
      await apiService.sendMessage(selectedUser.id, message);
      setMessage('');
      openThread(selectedUser);
      fetchConversations();
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 flex">
      {/* Sidebar: Conversations */}
      <aside className="w-80 bg-emerald-700 text-white p-6 space-y-4">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        {loading && <div>Loading...</div>}
        <ul className="space-y-2">
          {conversations.map(conv => (
            <li key={conv.user.id}>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${selectedUser && selectedUser.id === conv.user.id ? 'bg-emerald-800' : 'hover:bg-emerald-600'}`}
                onClick={() => openThread(conv.user)}
              >
                <div className="font-semibold">{conv.user.username} ({conv.user.role})</div>
                <div className="text-emerald-100 text-xs truncate">{conv.last.content}</div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
      {/* Main: Thread */}
      <main className="flex-1 p-8">
        {selectedUser ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 flex items-center space-x-2">
              <span className="font-bold text-emerald-800">Chat with {selectedUser.username} ({selectedUser.role})</span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 mb-4 h-96 overflow-y-auto flex flex-col-reverse">
              <div>
                {[...thread].reverse().map((msg) => (
                  <div key={msg.id} className={`mb-4 flex ${msg.sender.id === user.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`px-4 py-2 rounded-lg max-w-xs ${msg.sender.id === user.id ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs text-emerald-200 mt-1">{new Date(msg.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Type your message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                disabled={sending}
              />
              <button
                type="submit"
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                disabled={sending || !message.trim()}
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          <div className="text-emerald-700 text-lg mt-20 text-center">Select a conversation to start messaging.</div>
        )}
      </main>
    </div>
  );
} 