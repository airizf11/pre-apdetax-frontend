// frontend/src/components/ChatMessage.jsx
import React from 'react';
import { marked } from 'marked';

marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Renders a single chat message with appropriate styling based on the sender's role.
 * 
 * @param {{ message: object }} props - Component props.
 * @param {object} props.message - The message object. 
 *                                 Expected format: { role: 'user'|'model'|'system', content: string }
 */
function ChatMessage({ message }) {
  if (!message || !message.content) {
      console.warn("ChatMessage: Received invalid message data", message);
      return null; 
  }

  const { role, content } = message;
  let messageClass = 'chat-message'; // Base CSS class
  let renderedContent = null;

  // Determine styling and content based on the message role
  switch (role) {
    case 'user':
      messageClass += ' user-message'; // Add user-specific class
      // Optionally add a prefix like "You: " - can be styled with CSS pseudo-elements too
      // renderedContent = `You: ${content}`; 
      renderedContent = content; // Display user content directly
      break;
    case 'model':
      messageClass += ' model-message'; // Add model-specific class
      try {
        const parsedHtml = marked.parse(content);
        renderedContent = <div dangerouslySetInnerHTML={{ __html: parsedHtml }} />;
      } catch (error) {
         console.error("ChatMessage: Error parsing Markdown for model message", error);
         renderedContent = `(Error parsing content) ${content}`; 
         messageClass += ' text-danger';
      }
      break;
    case 'system':
      messageClass += ' system-message';
      renderedContent = content; 
      break;
    default:
      // Fallback for unknown roles
      console.warn(`ChatMessage: Received unknown message role: ${role}`);
      messageClass += ' system-message text-muted'; // Style as a muted system message
      renderedContent = `[Unknown Role: ${role}] ${content}`; 
      break;
  }

  // Render the message container with the determined classes and content
  return (
    <div className={messageClass}>
      {renderedContent}
    </div>
  );
}

export default ChatMessage;