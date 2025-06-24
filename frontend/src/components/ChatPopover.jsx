import React, { useState } from 'react';
import { FiMessageSquare, FiX } from 'react-icons/fi';

function ChatPopover({ messages, onClose }) {
  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white border shadow-lg rounded-lg z-50">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="font-semibold text-lg">Messages</h2>
        <button onClick={onClose}>
          <FiX />
        </button>
      </div>
      <div className="p-4 max-h-80 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <p className="text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="border p-2 rounded">
              <strong>{msg.sender}</strong>: {msg.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ChatPopover;
