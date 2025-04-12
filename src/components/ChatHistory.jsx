// frontend/src/components/ChatHistory.jsx
import React, { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

/**
 * Displays the scrollable history of chat messages.
 * Automatically scrolls to the bottom when new messages are added.
 * 
 * @param {{ history: Array<object> }} props - Component props.
 * @param {Array<object>} props.history - An array of chat message objects 
 *                                        (e.g., { role: 'user'/'model'/'system', content: '...' }).
 */
function ChatHistory({ history }) {
  // Create a ref to target the end of the chat history for scrolling
  const historyEndRef = useRef(null);

  /**
   * Scrolls the chat history container to the bottom smoothly.
   */
  const scrollToBottom = () => {
    // Use optional chaining (?.) in case the ref isn't attached yet
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // useEffect hook to scroll to bottom whenever the history array changes.
  useEffect(() => {
    scrollToBottom();
  }, [history]); // Dependency array: run effect when 'history' prop changes

  return (
    // Container for the chat messages.
    // 'flex-grow-1' allows it to take up available vertical space.
    // 'overflowY: auto' enables vertical scrolling when content exceeds height.
    <div
      id="chatHistoryDisplay" // ID for potential styling or targeting
      className="flex-grow-1 mb-3" // Take available space, add margin bottom
      style={{ 
          border: '1px solid var(--border-main)', 
          overflowY: 'auto', // Enable vertical scroll
          backgroundColor: 'var(--bg-chat-history)', // Specific background for chat
          padding: '10px', // Inner padding for messages
          minHeight: '100px' // Ensure it has some height even when empty
       }}
    >
      {/* Conditionally render messages or a placeholder */}
      {history && history.length > 0 ? (
        // If history exists and is not empty, map through messages
        history.map((msg, index) => (
          // Render each message using ChatMessage component
          // Use index as key (generally okay if list isn't reordered/items removed from middle)
          // Using a unique ID from the message object would be more robust if available.
          <ChatMessage key={index} message={msg} /> 
        ))
      ) : (
        // If history is empty or null, display a placeholder message
        <p className="text-center mt-3" style={{ color: 'var(--text-muted)' }}> 
          {/* Placeholder text */}
          Chat history is empty. Start by sending a message!
        </p>
      )}
      {/* Empty div at the end to serve as the scroll target */}
      <div ref={historyEndRef} /> 
    </div>
  );
}

export default ChatHistory;