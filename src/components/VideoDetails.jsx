// frontend/src/components/VideoDetails.jsx
import React from 'react';
import { formatDuration, formatDate, formatTimestamp } from '../utils/helpers'; 

/**
 * Displays detailed information about a selected YouTube video.
 * Description, Transcript, and Comments are now within a collapsible accordion.
 */
function VideoDetails({
    videoData,
    onBack,
    onGetTranscript,
    onAnalyzeComments,
    onSummarizeVideo,
    transcript, 
    isTranscriptLoading,
    transcriptError
 }) {
    if (!videoData) return null; 

    // Destructure video data
    const {
        id, title = 'Untitled Video', channelTitle = 'Unknown Channel', 
        thumbnailHigh, thumbnail, description = 'No description available.',
        publishedAt, duration, viewCount, likeCount, comments = [] 
    } = videoData;

    // Format metadata
    const displayDate = formatDate(publishedAt);
    const displayDuration = formatDuration(duration);
    const formattedViewCount = viewCount ? Number(viewCount).toLocaleString() : 'N/A';
    const formattedLikeCount = likeCount ? Number(likeCount).toLocaleString() : 'N/A';

    // Placeholder click handler
    const handleTimestampClick = (offsetSeconds) => {
      console.log("Timestamp clicked - Seek to:", offsetSeconds, "seconds"); 
    };

    return (
        <div className="video-details-container p-2"> 
            <div className="card border-secondary shadow-sm" style={{ backgroundColor: 'var(--bg-content)' }}>
                {/* Thumbnail */}
                <img
                    src={thumbnailHigh || thumbnail || 'placeholder.png'} 
                    className="card-img-top img-fluid" 
                    alt={`Thumbnail for ${title}`}
                    style={{ maxHeight: '60vh', objectFit: 'contain', backgroundColor: '#000' }} 
                />
                {/* Card Body */}
                <div className="card-body">
                    {/* Title */}
                    <h2 className="card-title fs-4 mb-3">{title}</h2>
                    
                    {/* Metadata Section */}
                    <div className="d-flex flex-wrap align-items-center mb-3 border-bottom border-secondary pb-2 small text-muted">
                         <span className="me-3 mb-1 d-inline-flex align-items-center"><i className="bi bi-person-circle me-1"></i> {channelTitle}</span>
                         <span className="me-3 mb-1 d-inline-flex align-items-center"><i className="bi bi-eye-fill me-1"></i> {formattedViewCount} views</span>
                         <span className="me-3 mb-1 d-inline-flex align-items-center"><i className="bi bi-hand-thumbs-up-fill me-1"></i> {formattedLikeCount} likes</span>
                         <span className="me-3 mb-1 d-inline-flex align-items-center"><i className="bi bi-calendar3 me-1"></i> {displayDate}</span>
                         <span className="mb-1 d-inline-flex align-items-center"><i className="bi bi-clock-fill me-1"></i> {displayDuration}</span>
                    </div>
                    
                    {/* --- DESCRIPTION SECTION REMOVED FROM HERE --- */}

                    {/* Action Buttons (Now appear directly after metadata) */}
                    <div className="mb-4 d-flex flex-wrap gap-2">
                       <button onClick={onBack} className="btn btn-outline-light btn-sm"><i className="bi bi-arrow-left me-1"></i> Back to Search</button>
                       <button onClick={() => onGetTranscript(id)} className="btn btn-secondary btn-sm" disabled={isTranscriptLoading} aria-live="polite">
                           {isTranscriptLoading ? (<><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Loading...</>) : (<i className="bi bi-file-text me-1"></i>)}
                           {transcript ? 'Reload Transcript' : 'Get Transcript'} 
                       </button>
                       <button onClick={() => onAnalyzeComments(id)} className="btn btn-info btn-sm" disabled={!comments || comments.length === 0} title={(!comments || comments.length === 0) ? "No comments available to analyze" : "Analyze comment sentiment and topics"}>
                           <i className="bi bi-chat-left-dots me-1"></i> Analyze Comments
                       </button>
                       <button onClick={() => onSummarizeVideo(id)} className="btn btn-success btn-sm"> <i className="bi bi-card-text me-1"></i> Summarize Video </button>
                       <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer" className="btn btn-danger btn-sm" title={`Watch "${title}" on YouTube`}>
                           <i className="bi bi-youtube me-1"></i> Watch on YouTube
                       </a>
                    </div>

                    {/* Accordion Section (Includes Description, Transcript, Comments) */}
                    <div className="accordion" id="detailsAccordion">

                        {/* --- Accordion Item: Description --- */}
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="descriptionHeading">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseDescription" aria-expanded="false" aria-controls="collapseDescription">
                                    View/Hide Description
                                </button>
                            </h2>
                            <div id="collapseDescription" className="accordion-collapse collapse" aria-labelledby="descriptionHeading" data-bs-parent="#detailsAccordion">
                                <div 
                                    className="accordion-body description-body"
                                    style={{ 
                                        maxHeight: '250px',
                                        overflowY: 'auto' 
                                    }}
                                >
                                    {/* Use pre tag for preserving formatting */}
                                    <pre 
                                        className="description-text mb-0" // Use a class for potential specific styling
                                        style={{ 
                                            whiteSpace: 'pre-wrap', 
                                            wordWrap: 'break-word', 
                                            fontFamily: 'inherit', // Use body font
                                            fontSize:'0.9em',      // Slightly smaller font
                                            color: 'var(--text-muted)', // Muted color for less emphasis
                                        }}
                                    >
                                        {description}
                                    </pre>
                                </div>
                            </div>
                        </div>
                        {/* --- END OF Accordion Item: Description --- */}


                        {/* Accordion Item: Transcript */}
                        <div className="accordion-item">
                            <h2 className="accordion-header" id="transcriptHeading">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTranscript" aria-expanded="false" aria-controls="collapseTranscript">
                                    View/Hide Transcript 
                                </button>
                            </h2>
                            <div id="collapseTranscript" className="accordion-collapse collapse" aria-labelledby="transcriptHeading" data-bs-parent="#detailsAccordion">
                                <div className="accordion-body" style={{ maxHeight: '300px', overflowY: 'auto' }}> 
                                    {/* Loading State */}
                                    {isTranscriptLoading && (
                                        <div className="d-flex justify-content-center p-3">
                                            <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="visually-hidden">Loading Transcript...</span>
                                            </div>
                                        </div>
                                    )}
                                    {/* Error State */}
                                    {transcriptError && !isTranscriptLoading && (
                                        <p className="text-danger small px-2 py-1">
                                            <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                            Error loading transcript: {transcriptError}
                                        </p>
                                    )}
                                    {/* Transcript Content */}
                                    {!isTranscriptLoading && !transcriptError && Array.isArray(transcript) && transcript.length > 0 && (
                                        <div className="transcript-list" style={{ fontFamily: 'monospace', fontSize: '0.9em' }}> 
                                            {transcript.map((entry, index) => {
                                                // console.log(`Transcript Entry ${index} Offset:`, entry.offset, typeof entry.offset); // Keep or remove debug line
                                                return ( 
                                                    <div key={index} className="transcript-entry mb-1 d-flex align-items-baseline" onClick={() => handleTimestampClick(entry.offset / 1000)} style={{ cursor: 'pointer' }} role="button" tabIndex={0} onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleTimestampClick(entry.offset / 1000)}>
                                                        <span className="transcript-timestamp me-2 text-muted flex-shrink-0" style={{ width: '55px', textAlign: 'right' }} aria-label={`Transcript line starts at ${formatTimestamp(entry.offset)}`}>{formatTimestamp(entry.offset)}</span>
                                                        <span className="transcript-text" style={{ color: 'var(--text-main)' }}>{entry.text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                    {/* Placeholder */}
                                    {!isTranscriptLoading && !transcriptError && (!Array.isArray(transcript) || transcript.length === 0) && (
                                        <p className="text-muted fst-italic small p-2"> 
                                            Click "Get Transcript" to load transcript data. Note: Not all videos have transcripts available.
                                        </p>
                                    )}
                                </div> 
                            </div> 
                        </div> 

                        {/* Accordion Item: Comments */}
                        <div className="accordion-item">
                             <h2 className="accordion-header" id="commentsHeading">
                                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseComments" aria-expanded="false" aria-controls="collapseComments">
                                    View/Hide Comments ({comments ? comments.length : 0}) 
                                </button>
                             </h2>
                             <div id="collapseComments" className="accordion-collapse collapse" aria-labelledby="commentsHeading" data-bs-parent="#detailsAccordion">
                                <div className="accordion-body comment-section" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                     {/* Comment rendering logic */}
                                     {comments && comments.length > 0 ? (
                                        comments.map(commentThread => {
                                            // Map each comment thread
                                            const topLevelComment = commentThread.snippet?.topLevelComment;
                                            const snippet = topLevelComment?.snippet;
                                            const authorName = snippet?.authorDisplayName ?? 'Unknown Author';
                                            const commentText = snippet?.textOriginal ?? 'Comment unavailable'; 
                                            const commentDate = snippet?.publishedAt ? new Date(snippet.publishedAt).toLocaleString() : '';
                                            const commentLikes = snippet?.likeCount ?? 0;

                                            if (topLevelComment && snippet && (authorName !== 'Unknown Author' || commentText !== 'Comment unavailable')) {
                                                return (
                                                    <div key={topLevelComment.id} className="comment mb-3 pb-2 border-bottom border-secondary">
                                                        {/* Top Level Comment */}
                                                        <p className="mb-1">
                                                            <strong style={{color: 'var(--text-main)'}}>{authorName}:</strong> 
                                                            <span style={{color: 'var(--text-main)', marginLeft: '5px'}}>{commentText}</span> 
                                                        </p>
                                                         <small className="text-muted d-block" style={{fontSize: '0.8em'}}>
                                                             {commentDate} 
                                                             {commentLikes > 0 && ` • ${commentLikes.toLocaleString()} Likes`}
                                                         </small>
                                                        {/* Replies Section */}
                                                        {commentThread.replies && commentThread.replies.comments && commentThread.replies.comments.length > 0 && (
                                                            <div className="replies mt-2 ps-3 border-start border-secondary" style={{marginLeft: '15px'}}>
                                                                {commentThread.replies.comments.map(reply => {
                                                                    // Map each reply
                                                                    const replySnippet = reply?.snippet;
                                                                    const replyAuthor = replySnippet?.authorDisplayName ?? 'Unknown Author';
                                                                    const replyText = replySnippet?.textOriginal ?? 'Reply unavailable';
                                                                    const replyDate = replySnippet?.publishedAt ? new Date(replySnippet.publishedAt).toLocaleString() : '';
                                                                    const replyLikes = replySnippet?.likeCount ?? 0;
                                                                    
                                                                    if (reply && replySnippet && (replyAuthor !== 'Unknown Author' || replyText !== 'Reply unavailable')) {
                                                                        return (
                                                                            <div key={reply.id} className="reply mb-2">
                                                                                <p className="mb-0">
                                                                                    <strong style={{color: 'var(--text-main)'}}>{replyAuthor}:</strong> 
                                                                                    <span style={{color: 'var(--text-main)', marginLeft: '5px'}}>{replyText}</span> 
                                                                                </p>
                                                                                 <small className="text-muted d-block" style={{fontSize: '0.8em'}}>
                                                                                    {replyDate}
                                                                                    {replyLikes > 0 && ` • ${replyLikes.toLocaleString()} Likes`}
                                                                                 </small>
                                                                            </div>
                                                                        );
                                                                    }
                                                                    return null; // Skip invalid replies
                                                                })}
                                                            </div>
                                                        )}
                                                    </div> 
                                                );
                                            }
                                            return null; // Skip invalid top-level comments
                                        })
                                    ) : (
                                        // Placeholder if no comments
                                        <p className="text-muted fst-italic small p-2">
                                            No comments available for this video, or comments might be disabled.
                                        </p>
                                    )} 
                                </div> 
                             </div>
                        </div> 
                    </div> {/* End Accordion */}
                </div> {/* End Card Body */}
            </div> {/* End Card */}
        </div> // End Container
    );
}

export default VideoDetails;