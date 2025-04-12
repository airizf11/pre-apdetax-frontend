// frontend/src/components/SearchResultsView.jsx
import React, { useState } from 'react';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';
import Collapse from 'react-bootstrap/Collapse';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import VideoList from './VideoList';
import ArticleCard from './ArticleCard';
import WebResultList from './WebResultList'; // Import component for web results

/**
 * Displays search results from YouTube, Web (CSE), and News Feed within separate tabs.
 * Includes filtering for news articles and pagination for web results.
 */
function SearchResultsView({
    // YouTube Props
    youtubeResults,
    isYoutubeLoading,
    youtubeError,
    // News Props
    newsArticles,
    isNewsLoading,
    newsError,
    currentSearchQuery, // Shared prop
    newsCurrentPage,
    newsItemsPerPage,
    availableSources,
    selectedSources,
    onSourceFilterChange,
    onLoadMoreNews,
    onLoadLatestNews,
    // Web Search Props
    webSearchResults,
    isWebSearchLoading,
    webSearchError,
    webSearchNextPageStart,
    onLoadMoreWebResults, // Handler for web pagination
    // General Props
    onVideoSelect,
    activeTab,
    onSelectTab
}) {

    // State for news filter visibility
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // --- Render function for YouTube Tab Content ---
    const renderYoutubeContent = () => {
        if (isYoutubeLoading) {
            return ( <div className="d-flex justify-content-center p-4"><div className="spinner-border text-primary spinner-border-sm" role="status"><span className="visually-hidden">Loading YouTube results...</span></div></div> );
        }
        if (youtubeError) {
            return ( <div className="alert alert-warning small p-2 m-3" role="alert"><span><i className="bi bi-exclamation-triangle-fill me-1"></i> YouTube Search Error: {youtubeError}</span></div> );
        }
        return (
            <div className="p-2">
                 {youtubeResults.length > 0 ? (
                    <VideoList videos={youtubeResults} onVideoSelect={onVideoSelect} />
                 ) : (
                    currentSearchQuery
                        ? <p className="text-center text-muted fst-italic p-4">No YouTube videos found for "{currentSearchQuery}".</p>
                        : <p className="text-center text-muted fst-italic p-4">Enter a query above to search YouTube.</p>
                 )}
            </div>
        );
    };

    // --- Render function for Web Search Tab Content ---
    const renderWebContent = () => {
        // Show spinner only during initial load (when results are empty)
        if (isWebSearchLoading && webSearchResults.length === 0) {
            return (
                <div className="d-flex justify-content-center p-4">
                    <div className="spinner-border text-success spinner-border-sm" role="status">
                        <span className="visually-hidden">Loading web results...</span>
                    </div>
                </div>
            );
        }
        // Show error message if an error occurred
        if (webSearchError) {
            return (
                <div className="alert alert-warning small p-2 m-3" role="alert">
                    <span><i className="bi bi-exclamation-triangle-fill me-1"></i> Web Search Error: {webSearchError}</span>
                </div>
            );
        }
        // Display the main content (results list and load more button)
        return (
            <div className="p-2"> {/* Add padding around the content */}
                 {/* Conditionally render the list or a 'no results' message */}
                 {webSearchResults.length > 0 ? (
                    <>
                       {/* Render the list of web results */}
                       <WebResultList results={webSearchResults} />

                       {/* Load More Button - Only show if nextPageStart exists */}
                       {webSearchNextPageStart && (
                           <div className="text-center mt-3 mb-2">
                               <button
                                   className="btn btn-outline-success btn-sm" // Green outline button
                                   onClick={onLoadMoreWebResults} // Call the handler passed from App.jsx
                                   disabled={isWebSearchLoading} // Disable while loading more results
                               >
                                   {/* Show different text/spinner when loading */}
                                   {isWebSearchLoading ? (
                                       <>
                                           <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                           Loading...
                                       </>
                                   ) : (
                                       'Load More Web Results'
                                   )}
                               </button>
                           </div>
                       )}
                    </>
                 ) : (
                    // Show message if no results were found after loading
                    currentSearchQuery
                        ? <p className="text-center text-muted fst-italic p-4">No web results found for "{currentSearchQuery}".</p>
                        : <p className="text-center text-muted fst-italic p-4">Enter a query in the search bar above to search the web.</p>
                 )}
            </div>
        );
    };

     // --- Render function for News Tab Content ---
     const renderNewsContent = () => {
        // Filter logic (Source and Query)
        const sourceFilteredArticles = selectedSources.length === 0
            ? newsArticles
            : newsArticles.filter(article => selectedSources.includes(article.sourceName));
        const queryLower = currentSearchQuery.toLowerCase().trim();
        const finalFilteredArticles = queryLower
            ? sourceFilteredArticles.filter(article =>
                (article.title?.toLowerCase() || '').includes(queryLower) ||
                (article.snippet?.toLowerCase() || '').includes(queryLower)
              )
            : sourceFilteredArticles;

        const endIndex = newsCurrentPage * newsItemsPerPage;
        const articlesToDisplay = finalFilteredArticles.slice(0, endIndex);
        const remainingCount = finalFilteredArticles.length - endIndex;
        const hasMoreArticles = remainingCount > 0;

        // --- Render Logic (Loading, Error, Empty States) ---
        if (isNewsLoading && newsArticles.length === 0) {
            return ( <div className="d-flex justify-content-center p-4"><div className="spinner-border text-info spinner-border-sm" role="status"><span className="visually-hidden">Loading news feed...</span></div></div> );
        }
        if (newsError) {
            return ( <div className="alert alert-warning small p-2 m-3" role="alert"><span><i className="bi bi-exclamation-triangle-fill me-1"></i> News Feed Error: {newsError}</span></div> );
        }
        if (!isNewsLoading && newsArticles.length === 0) {
             return (
                <div className="text-center p-4">
                    <button className="btn btn-outline-info btn-sm mb-3" onClick={onLoadLatestNews} disabled={isNewsLoading}>
                        <i className="bi bi-arrow-clockwise me-1"></i> Load Latest News
                    </button>
                    <p className="text-muted fst-italic">No news articles available.</p>
                </div>
             );
        }
        if (articlesToDisplay.length === 0 && (selectedSources.length > 0 || queryLower)) {
            return (
                <div className="text-center p-4">
                    <button className="btn btn-outline-info btn-sm mb-3" onClick={onLoadLatestNews} disabled={isNewsLoading} title="Fetch the most recent news articles from all sources">
                        <i className="bi bi-arrow-clockwise me-1"></i> Load Latest News
                    </button>
                    <p className="text-muted fst-italic">No news articles found matching your filters.</p>
                    {selectedSources.length > 0 && (
                         <Button variant="link" size="sm" onClick={() => selectedSources.forEach(source => onSourceFilterChange(source, false))}>
                              Reset Source Filter
                         </Button>
                    )}
                </div>
           );
        }

        // --- Render Filter UI, Articles, and Load More Button ---
        return (
            <div className="article-list p-2">
                {/* News Source Filter Section */}
                <div className="mb-3 border-bottom pb-3">
                    <Button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        aria-controls="source-filter-collapse"
                        aria-expanded={isFilterOpen}
                        variant="outline-secondary"
                        size="sm"
                        className="d-flex align-items-center w-100" // Make button full width for better click area
                    >
                        <i className={`bi bi-filter me-1 ${selectedSources.length > 0 ? 'text-info' : ''}`}></i>
                        Filter by Source {selectedSources.length > 0 ? `(${selectedSources.length} selected)` : '(All)'}
                        <i className={`bi bi-chevron-${isFilterOpen ? 'up' : 'down'} ms-auto`}></i>
                    </Button>
                    <Collapse in={isFilterOpen}>
                        <div id="source-filter-collapse" className="mt-2 p-2 border rounded" style={{ backgroundColor: 'var(--bg-input)', maxHeight: '150px', overflowY: 'auto' }}>
                             {availableSources.length > 0 ? (
                                 availableSources.map(sourceName => (
                                     <Form.Check
                                         key={sourceName}
                                         type="checkbox"
                                         id={`source-filter-${sourceName.replace(/\s+/g, '-')}`}
                                         label={sourceName}
                                         checked={selectedSources.includes(sourceName)}
                                         onChange={(e) => onSourceFilterChange(sourceName, e.target.checked)}
                                         className="mb-1 small"
                                     />
                                 ))
                             ) : (
                                 <p className="text-muted small mb-0">No sources available to filter.</p>
                             )}
                             {selectedSources.length > 0 && (
                                  <Button variant="link" size="sm" className="mt-1 p-0" onClick={() => selectedSources.forEach(source => onSourceFilterChange(source, false))}>
                                       Reset Filter
                                  </Button>
                             )}
                        </div>
                    </Collapse>
                </div>

                {/* Load Latest News Button (optional to always show) */}
                 <div className="text-center mb-3">
                    <button
                        className="btn btn-outline-info btn-sm"
                        onClick={onLoadLatestNews}
                        disabled={isNewsLoading}
                        title="Fetch the most recent news articles from all sources"
                    >
                        <i className="bi bi-arrow-clockwise me-1"></i> Load Latest News
                    </button>
                </div>

                {/* Render article list */}
                {articlesToDisplay.map(article => (
                    <ArticleCard key={article.id} article={article} />
                ))}

                {/* Load More News Button */}
                {hasMoreArticles && (
                    <div className="text-center mt-3 mb-2">
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            onClick={onLoadMoreNews}
                            disabled={isNewsLoading}
                        >
                            {isNewsLoading && newsCurrentPage * newsItemsPerPage < finalFilteredArticles.length ? ( // Show spinner only when loading more
                                <> <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Loading... </>
                            ) : (
                                `Load More News (${remainingCount} remaining)`
                            )}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    // --- Main Return Statement with Tabs ---
    return (
        <Tabs
            id="search-results-tabs"
            activeKey={activeTab}
            onSelect={(k) => onSelectTab(k)} // Handler to update active tab state in App.jsx
            className="mb-0 search-tabs"    // Custom class for styling
            variant="underline"             // Visual style for tabs
            justify                         // Make tabs fill the width
        >
            {/* YouTube Tab */}
            <Tab eventKey="youtube" title={<><i className="bi bi-youtube me-1"></i> YouTube</>}>
                {renderYoutubeContent()}
            </Tab>

            {/* Web Search Tab (NEW) */}
            <Tab eventKey="web" title={<><i className="bi bi-google me-1"></i> Web Search</>}> {/* Updated Title */}
                {renderWebContent()}
            </Tab>

            {/* News Tab */}
            <Tab eventKey="news" title={<><i className="bi bi-newspaper me-1"></i> News</>}>
                {renderNewsContent()}
            </Tab>
        </Tabs>
    );
}

export default SearchResultsView;