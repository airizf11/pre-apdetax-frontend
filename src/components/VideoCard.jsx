// frontend/src/components/VideoCard.jsx
import React from 'react';
import { formatDuration, truncateText, formatDate } from '../utils/helpers'; 

/**
 * Renders a single YouTube video search result as a clickable Bootstrap card.
 * @param {{ video: object, onClick: function }} props - Component props.
 * @param {object} props.video - The video data object. Expected fields: id, title, channelTitle, 
 *                               thumbnail, thumbnailHigh, description, publishedAt, duration, 
 *                               viewCount, likeCount.
 * @param {function} props.onClick - Callback function to execute when the card is clicked, 
 *                                   typically passing the video ID.
 */
function VideoCard({ video, onClick }) {
    if (!video || !video.id || !video.title) {
        console.warn("VideoCard: Received invalid video data", video); // Log warning for debugging
        return null; // Return null to prevent rendering an incomplete card
    }

    const shortDescription = truncateText(video.description, 120); // Truncate description

    const displayDate = formatDate(video.publishedAt); 

    const displayDuration = formatDuration(video.duration);

    // Format view and like counts with commas for readability, provide fallback
    const formattedViewCount = video.viewCount ? Number(video.viewCount).toLocaleString() : 'N/A';
    const formattedLikeCount = video.likeCount ? Number(video.likeCount).toLocaleString() : 'N/A';

    return (
        // Main card element, made clickable
        <div 
            className="card video-card mb-3 shadow-sm" 
            style={{ cursor: 'pointer', backgroundColor: 'var(--bg-content)', borderColor: 'var(--border-main)' }} 
            onClick={() => onClick(video.id)} // Call onClick prop with video ID when clicked
            role="button" // Indicate clickability for accessibility
            tabIndex={0} // Make it focusable
            onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(video.id)} // Allow activation with Enter/Space
        >
            {/* Use Bootstrap's row for horizontal card layout */}
            <div className="row g-0"> 
                {/* Column for the thumbnail */}
                <div className="col-md-4 d-flex align-items-center justify-content-center" style={{ backgroundColor:'#222' }}> {/* Center image vertically/horizontally */}
                    <img
                        // Use high-res thumbnail with fallback to default
                        src={video.thumbnailHigh || video.thumbnail}
                        className="img-fluid rounded-start" // Responsive image, rounded corners on the left
                        alt={`Thumbnail for ${video.title}`} // Alt text for accessibility
                        style={{ 
                            width: '100%', 
                            height: '100%', // Make image fill the height of its container potentially
                            maxHeight: '150px', // Limit image height to prevent huge cards
                            objectFit: 'cover' // Cover ensures the image fills the area, might crop
                        }}
                        loading="lazy" // Lazy load images for performance
                    />
                </div>
                {/* Column for the video details */}
                <div className="col-md-8">
                    <div className="card-body d-flex flex-column h-100 p-2 p-md-3"> {/* Use flex column, adjust padding */}
                        {/* Video Title */}
                        <h5 className="card-title fs-6 mb-1" title={video.title}> {/* Add tooltip for long titles */}
                            {video.title}
                        </h5>
                        {/* Channel Title */}
                        <p className="card-text mb-1">
                            <small style={{ color: 'var(--text-main)' }}> 
                                <i className="bi bi-person-circle me-1"></i>
                                {video.channelTitle || 'Unknown Channel'} {/* Fallback */}
                            </small>
                        </p>
                        {/* Short Description */}
                        {shortDescription && ( // Only render if description exists
                            <p className="card-text mb-2" style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>
                                {shortDescription}
                            </p>
                        )}
                        
                        {/* Spacer to push stats to the bottom */}
                        <div className="mt-auto pt-2"> 
                            {/* Row for Date and Duration */}
                            <div className="d-flex justify-content-between align-items-center mb-2 small" style={{ color: 'var(--text-muted)' }}> 
                                <span> {/* Date */}
                                    <i className="bi bi-calendar3 me-1"></i>
                                    {displayDate}
                                </span>
                                <span> {/* Duration */}
                                    <i className="bi bi-clock-fill me-1"></i>
                                    {displayDuration}
                                </span>
                            </div>
                            {/* Row for Stats Badges */}
                            <div className="d-flex flex-wrap gap-1"> {/* Allow badges to wrap */}
                                <span className="badge bg-secondary">
                                    <i className="bi bi-eye-fill me-1"></i> 
                                    {formattedViewCount}
                                </span>
                                <span className="badge bg-secondary">
                                    <i className="bi bi-hand-thumbs-up-fill me-1"></i> 
                                    {formattedLikeCount}
                                </span>
                                {/* Optionally show dislike count if available and desired - Usually hidden now */}
                                {/* {video.dislikeCount && (
                                    <span className="badge bg-secondary">
                                        <i className="bi bi-hand-thumbs-down-fill me-1"></i> 
                                        {Number(video.dislikeCount).toLocaleString()}
                                    </span>
                                )} */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VideoCard;