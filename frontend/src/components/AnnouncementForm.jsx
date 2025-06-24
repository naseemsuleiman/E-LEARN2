import React, { useState } from 'react';

function AnnouncementForm({ onSubmit }) {
  const [text, setText] = useState('');
  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        if (!text.trim()) return;
        onSubmit(text);
        setText('');
      }}
      className="flex space-x-2"
    >
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write an announcement..."
        className="flex-1 border p-2 rounded"
      />
      <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded">
        Post
      </button>
    </form>
  );
}

export default AnnouncementForm;