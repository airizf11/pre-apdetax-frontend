// frontend/src/components/ChatInput.jsx
import React, { useState } from 'react';

/**
 * Renders the input field and send button for the chat interface.
 * 
 * @param {{ onSendMessage: function, isSending: boolean }} props - Component props.
 * @param {function} props.onSendMessage - Callback function to send the message content when triggered.
 * @param {boolean} props.isSending - Flag indicating if a message is currently being processed 
 *                                    (used to disable input and button).
 */
function ChatInput({ onSendMessage, isSending }) {
  // State to hold the current value of the text input field
  const [message, setMessage] = useState('');

  /**
   * Updates the message state whenever the input field value changes.
   * @param {React.ChangeEvent<HTMLInputElement>} event - The input change event.
   */
  const handleInputChange = (event) => {
    setMessage(event.target.value);
  };

  /**
   * Handles the action of sending the message.
   * Trims the message, calls the onSendMessage callback if the message is not empty 
   * and not currently sending, then clears the input field.
   */
  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !isSending) {
      onSendMessage(trimmedMessage); // Call the parent's send function
      setMessage(''); // Clear the input field after sending
    }
  };

  /**
   * Handles key press events within the input field.
   * If the Enter key is pressed (without the Shift key), it prevents the default newline 
   * behavior and triggers the message send action.
   * @param {React.KeyboardEvent<HTMLInputElement>} event - The key press event.
   */
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) { 
      event.preventDefault();
      handleSend();
    }
  };

  return (
    // Use Bootstrap's input group to combine the input and button
    <div className="input-group mt-auto"> {/* mt-auto pushes it to the bottom if in flex container */}
      {/* Text input field */}
      <input
        type="text"
        className="form-control"
        // Placeholder text for the input field
        placeholder="Type your message here..." 
        value={message} // Bind value to state
        onChange={handleInputChange} // Update state on change
        onKeyPress={handleKeyPress} // Handle Enter key press
        disabled={isSending} // Disable input while a message is being sent/processed
        aria-label="Chat message input" // Accessibility label
      />
      {/* Send button */}
      <button
        className="btn btn-success" // Use success color for send button
        onClick={handleSend} // Trigger send action on click
        // Disable button if already sending or if the input (trimmed) is empty
        disabled={isSending || !message.trim()} 
        type="button" // Explicitly set type
      >
        {/* Conditional rendering for button content based on sending state */}
        {isSending ? (
          // Show spinner and "Sending..." text while processing
          <>
            <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
            Sending...
          </>
        ) : (
           'Send'
          // Alternatively, use an icon: <i className="bi bi-send-fill"></i>
        )}
      </button>
    </div>
  );
}

export default ChatInput;