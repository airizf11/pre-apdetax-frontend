// frontend/src/components/VideoList.jsx
import React from 'react';
import VideoCard from './VideoCard';

/**
 * Renders a list of VideoCard components.
 * @param {{ videos: Array<object>, onVideoSelect: function }} props - Component props.
 * @param {Array<object>} props.videos - An array of video data objects to be displayed.
 * @param {function} props.onVideoSelect - The callback function to execute when a VideoCard is clicked, 
 *                                         passing the selected video's ID.
 */
function VideoList({ videos, onVideoSelect }) {

    // If the videos array is null, undefined, or empty, display a message.
    if (!videos || videos.length === 0) {
        // Return a user-friendly message centered on the screen.
        // Ensure the text color is readable on the background.
        return (
            <p className="text-center text-muted mt-4" style={{ color: 'var(--text-muted)' }}> 
                No videos found matching your criteria.
            </p>
        );
    }

    // If there are videos, map over the array and render a VideoCard for each one.
    return (
        // Container div for the list of videos.
        <div className="video-list-container"> 
            {videos.map(video => (
                <VideoCard
                    // Use video.id as the unique key for each item in the list.
                    // React requires unique keys for efficient updates.
                    key={video.id} 
                    video={video} // Pass the individual video data object to the VideoCard.
                    // Pass the onVideoSelect function down to the VideoCard.
                    // The VideoCard itself will call this with the video ID when clicked.
                    onClick={onVideoSelect} 
                />
            ))}
        </div>
    );
}

export default VideoList;