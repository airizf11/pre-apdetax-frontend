// frontend/src/components/ChatWindow.jsx
import React from 'react';
import ChatHistory from './ChatHistory';
import ChatInput from './ChatInput';

/**
 * The main container component for the chat interface.
 * It arranges the chat history display and the message input area.
 * 
 * @param {object} props - Component props.
 * @param {Array<object>} props.history - An array of chat message objects 
 *                                        (e.g., { role: 'user'/'model'/'system', content: '...' }).
 * @param {function} props.onSendMessage - Callback function to send a new message from the user.
 * @param {boolean} props.isSending - Flag indicating if a message is currently being sent 
 *                                    (waiting for AI response).
 */
function ChatWindow({ history, onSendMessage, isSending }) {
  return (
    <div className="border rounded p-3 h-100 d-flex flex-column shadow-sm" style={{ backgroundColor: 'var(--bg-content)' }}>
      {/* Chat Window Title */}
      <h4 className="mb-3 text-center">Chat with AI</h4> 

      {/* Chat History Display Area */}
      {/* It receives the message history array. */}
      <ChatHistory history={history} />

      {/* Chat Input Area */}
      {/* It receives the sendMessage callback and the sending status. */}
      {/* Placed last, appears at the bottom due to flex-column layout. */}
      <ChatInput onSendMessage={onSendMessage} isSending={isSending} />
    </div>
  );
}

export default ChatWindow;