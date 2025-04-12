// frontend/src/components/WebResultList.jsx
import React from 'react';
import WebResultCard from './WebResultCard';

/**
 * Renders a list of WebResultCard components based on the provided results array.
 * @param {object} props - Component props.
 * @param {Array<object>} props.results - An array of web search result objects.
 */
function WebResultList({ results }) {
    // If the results array is null, undefined, or empty, display a message.
    if (!results || results.length === 0) {
        return (
            <p className="text-center text-muted mt-4" style={{ color: 'var(--text-muted)' }}>
                No web results to display.
            </p>
        );
    }

    // If there are results, map over the array and render a WebResultCard for each one.
    return (
        // Container div for the list of web results.
        <div className="web-result-list-container">
            {results.map((result, index) => (
                // Render the WebResultCard component for each result item.
                // Pass the individual result object as a prop.
                // Use a combination of link and index as the key for React's list rendering.
                // While link should ideally be unique, adding index provides a fallback.
                <WebResultCard key={`${result.link}-${index}`} result={result} />
            ))}
        </div>
    );
}

export default WebResultList;