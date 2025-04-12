// frontend/src/components/ArticleCard.jsx (REVISED - Removed stretched-link for Accessibility & Copy-Paste)
import React from 'react';
import { truncateText, formatDate } from '../utils/helpers';

/**
 * Renders a single news article as a Bootstrap card.
 *
 * @param {{ article: object }} props - Component props.
 * @param {object} props.article - The article object data. Should contain at least link, title.
 *                                 Optional fields: snippet, sourceName, publishedAt.
 */
function ArticleCard({ article }) {
    // Don't render the card if essential article data (link or title) is missing.
    if (!article || !article.link || !article.title) {
        console.warn("ArticleCard: Received invalid article data", article);
        return null;
    }

    // Use the imported truncateText helper for the snippet
    const shortSnippet = truncateText(article.snippet, 150);

    // Use the imported formatDate helper for the publication date
    const displayDate = formatDate(article.publishedAt);

    return (
        <div className="card article-card mb-3 shadow-sm" style={{ backgroundColor: 'var(--bg-content)', borderColor: 'var(--border-main)' }}>
            <div className="card-body">
                {/* Card Title - Linked to the original article */}
                {/* --- PERUBAHAN DI SINI --- */}
                <h5 className="card-title fs-6 mb-2">
                    <a
                        href={article.link}
                        target="_blank" // Open link in a new tab
                        rel="noopener noreferrer" // Security measure
                        title={`Read article: ${article.title}`} // Tooltip tetap berguna
                    >
                        {article.title} {/* Display the article title */}
                    </a>
                </h5>
                {/* --- AKHIR PERUBAHAN --- */}

                {/* Display the truncated snippet if available */}
                {/* Sekarang lebih mudah diseleksi/dicopy */}
                {shortSnippet && (
                    <p className="card-text mb-2" style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>
                        {shortSnippet}
                    </p>
                )}

                {/* Footer section for metadata (Source Name and Date) */}
                {/* Sekarang lebih mudah diseleksi/dicopy */}
                <div className="d-flex justify-content-between align-items-center mt-2 small" style={{ color: 'var(--text-muted)' }}>
                    <span
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '60%' }}
                        title={`Source: ${article.sourceName || 'Unknown Source'}`}
                    >
                        <i className="bi bi-newspaper me-1"></i>
                        {article.sourceName || 'Unknown Source'}
                    </span>
                    <span>
                        <i className="bi bi-calendar3 me-1"></i>
                        {displayDate}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ArticleCard;