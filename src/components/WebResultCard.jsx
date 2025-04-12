// frontend/src/components/WebResultCard.jsx
import React from 'react';
import { truncateText } from '../utils/helpers';

/**
 * Renders a single web search result item as a card-like element.
 * @param {object} props - Component props.
 * @param {object} props.result - The web search result object from the backend.
 *                                Expected properties: title, link, snippet, displayLink.
 */
function WebResultCard({ result }) {
    // Basic validation: If essential data is missing, don't render the card.
    if (!result || !result.link || !result.title) {
        console.warn("WebResultCard: Received invalid result data", result);
        return null; // Return null to prevent rendering an empty card
    }

    // Truncate the snippet to a reasonable length
    const shortSnippet = truncateText(result.snippet, 180); // Adjust length as needed

    return (
        // Using similar styling to ArticleCard for consistency, but with a unique class
        <div className="card article-card web-result-card mb-3 shadow-sm" style={{ backgroundColor: 'var(--bg-content)', borderColor: 'var(--border-main)' }}>
            <div className="card-body p-2 p-md-3">
                {/* Result Title (Linked to the actual page) */}
                <h5 className="card-title fs-6 mb-1">
                    <a
                        href={result.link}
                        target="_blank" // Open in a new tab
                        rel="noopener noreferrer" // Security best practice
                        title={result.title} // Tooltip for full title
                        // Optional: Add styles for the link if needed
                    >
                        {result.title}
                    </a>
                </h5>

                {/* Display Link (Green URL typically seen in search results) */}
                <a
                    href={result.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-success small d-block mb-1" // Use text-success for green color
                    style={{ fontSize: '0.85em', textDecoration: 'none' }} // Smaller font, no underline
                    title={`Link to ${result.displayLink || result.link}`} // Tooltip
                >
                    {/* Show displayLink if available, otherwise fallback to the full link */}
                    {result.displayLink || result.link}
                </a>

                {/* Snippet (Truncated description) */}
                {shortSnippet && ( // Only render if snippet exists
                    <p className="card-text mb-0" style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>
                        {shortSnippet}
                    </p>
                )}
            </div>
        </div>
    );
}

export default WebResultCard;