// frontend/src/App.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
    searchYoutube,
    getNewsFeed,
    getVideoDetails,
    getVideoTranscript,
    postChatMessage,
    analyzeComments,
    summarizeText,
    summarizeDirectly,
    checkLoginStatus,
    logoutUser,
    searchWeb // Import for web search API
} from './services/api';

import SearchBar from './components/SearchBar';
import VideoDetails from './components/VideoDetails';
import ChatWindow from './components/ChatWindow';
import SearchResultsView from './components/SearchResultsView';

// Simple logger functions
const log = (level, ...args) => { console.log(`[${level.toUpperCase()}]`, ...args); };
const debugLog = (...args) => { console.debug('[DEBUG]', ...args); };

function App() {
  const currentYear = new Date().getFullYear();
  const NEWS_ITEMS_PER_PAGE = 20;

  // --- State ---
  // YouTube Search State
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // General Search State
  const [currentSearchQuery, setCurrentSearchQuery] = useState('');

  // Video Details State
  const [selectedVideoId, setSelectedVideoId] = useState(null);
  const [selectedVideoDetails, setSelectedVideoDetails] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);

  // Transcript State
  const [currentTranscript, setCurrentTranscript] = useState(null);
  const [isTranscriptLoading, setIsTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState(null);

  // News Feed State
  const [newsArticles, setNewsArticles] = useState([]);
  const [isNewsLoading, setIsNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState(null);
  const [newsCurrentPage, setNewsCurrentPage] = useState(1);
  const [selectedSources, setSelectedSources] = useState([]);

  // Chat State
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatSending, setIsChatSending] = useState(false);

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // UI State
  const [activeTab, setActiveTab] = useState('youtube');

  // Web Search State
  const [webSearchResults, setWebSearchResults] = useState([]);
  const [isWebSearchLoading, setIsWebSearchLoading] = useState(false);
  const [webSearchError, setWebSearchError] = useState(null);
  const [webSearchNextPageStart, setWebSearchNextPageStart] = useState(null);

  // --- Effects ---
  // Check login status on initial mount
  useEffect(() => {
    const fetchLoginStatus = async () => {
      log('info','Checking user login status...');
      setIsAuthLoading(true);
      try {
        const status = await checkLoginStatus();
        setIsLoggedIn(status.loggedIn);
        setUserData(status.user);
        log('info', `Login status: ${status.loggedIn}`);
      } catch (error) {
        console.error("Login check failed:", error);
        setIsLoggedIn(false);
        setUserData(null);
      } finally {
        setIsAuthLoading(false);
      }
    };
    fetchLoginStatus();
  }, []);

  // --- Handlers ---
  const fetchNews = useCallback(async () => {
    log('info', 'Fetching news...');
    setIsNewsLoading(true);
    setNewsError(null);
    try {
      const articles = await getNewsFeed();
      setNewsArticles(articles);
      log('info', `Fetched ${articles.length} news.`);
    } catch (err) {
      console.error("News fetch error:", err);
      setNewsError(err.message || 'Failed to load news.');
      setNewsArticles([]);
    } finally {
      setIsNewsLoading(false);
    }
  }, []);

  // Handler for initiating search (YouTube, Web, and News)
  const handleSearch = useCallback(async (query, order, region) => {
    const trimmedQuery = query.trim();
    setCurrentSearchQuery(trimmedQuery);
    log('info', 'Search/Filter triggered:', { query: trimmedQuery, order, region });

    // Reset all relevant states before starting new searches
    setIsSearchLoading(true); setSearchError(null); setSearchResults([]); // YouTube
    setSelectedVideoId(null); setSelectedVideoDetails(null); setDetailError(null); // Video Details
    setCurrentTranscript(null); setTranscriptError(null); // Transcript
    setIsNewsLoading(false); setNewsError(null); setNewsCurrentPage(1); // News (reset page, ensure loading is off before fetch)
    setIsWebSearchLoading(true); setWebSearchError(null); setWebSearchResults([]); setWebSearchNextPageStart(null); // Web Search

    if (trimmedQuery) {
      log('info', `Starting searches for query: "${trimmedQuery}"`);

      // --- Run searches in parallel ---
      const youtubePromise = searchYoutube(trimmedQuery, order, region)
          .then(videos => setSearchResults(videos))
          .catch(err => {
              console.error("YT Search error:", err);
              setSearchError(err.message || 'Failed to fetch YT results.');
              setSearchResults([]); // Clear results on error
          })
          .finally(() => setIsSearchLoading(false));

      const webSearchPromise = searchWeb(trimmedQuery, 1) // Start web search from page 1
          .then(data => {
              setWebSearchResults(data.items);
              setWebSearchNextPageStart(data.nextPageStartIndex); // Store pagination token
          })
          .catch(err => {
              console.error("Web Search error:", err);
              setWebSearchError(err.message || 'Failed to fetch web results.');
              setWebSearchResults([]); // Clear results on error
              setWebSearchNextPageStart(null); // Clear pagination on error
          })
          .finally(() => setIsWebSearchLoading(false));

      const newsPromise = fetchNews(); // fetchNews handles its own state

      try {
          await Promise.all([youtubePromise, webSearchPromise, newsPromise]);
          log('info', 'All initial search fetches complete.');
      } catch (aggregateError) {
          log('warn', 'One or more search fetches failed (details logged above).');
      }
    } else {
      // If query is empty, clear results and loading flags
      log('info', 'Empty query received, clearing results.');
      setSearchResults([]);
      setWebSearchResults([]);
      setIsSearchLoading(false);
      setIsWebSearchLoading(false);
      await fetchNews(); // Optionally fetch latest news
    }
  }, [fetchNews]); // Dependency

  // Handler for loading more web search results (Pagination)
  const handleLoadMoreWebResults = useCallback(async () => {
    if (!webSearchNextPageStart || isWebSearchLoading || !currentSearchQuery) {
      log('warn', 'Load More Web: Conditions not met.');
      return;
    }
    log('info', `Loading more web results, starting from index: ${webSearchNextPageStart}`);
    setIsWebSearchLoading(true);
    setWebSearchError(null);

    try {
      const data = await searchWeb(currentSearchQuery, webSearchNextPageStart);
      setWebSearchResults(prevResults => [...prevResults, ...data.items]); // Append results
      setWebSearchNextPageStart(data.nextPageStartIndex); // Update next start index
      log('info', `Loaded ${data.items.length} more web results. Next start index: ${data.nextPageStartIndex}`);
    } catch (err) {
         console.error("Load More Web Search error:", err);
         setWebSearchError(err.message || 'Failed to load more web results.');
    } finally {
        setIsWebSearchLoading(false);
    }
  }, [currentSearchQuery, webSearchNextPageStart, isWebSearchLoading]); // Dependencies

  // Handler for fetching video details
  const fetchVideoDetails = useCallback(async (videoId) => {
    if (!videoId) return;
    log('info', 'Fetching video details:', videoId);
    setIsDetailLoading(true);
    setDetailError(null);
    setSelectedVideoDetails(null);
    setCurrentTranscript(null);
    setTranscriptError(null);
    try {
      const details = await getVideoDetails(videoId);
      setSelectedVideoDetails(details);
      log('info', `Details fetched for ${videoId}.`);
    } catch (err) {
      console.error("Video Detail error:", err);
      setDetailError(err.message || `Failed to load details for ${videoId}.`);
    } finally {
      setIsDetailLoading(false);
    }
  }, []); // No dependencies needed if getVideoDetails doesn't rely on App state

  // Handler for getting video transcript
  const handleGetTranscript = useCallback(async (videoId) => {
    if (!videoId) return;
    log('info', 'Requesting transcript:', videoId);
    setIsTranscriptLoading(true);
    setTranscriptError(null);
    try {
      const data = await getVideoTranscript(videoId);
      setCurrentTranscript(data.transcript);
      log('info', `Transcript loaded for ${videoId}.`);
    } catch (err) {
       console.error("Transcript fetch error:", err);
       setTranscriptError(err.message || 'Could not load transcript.');
       setCurrentTranscript(null);
    } finally {
        setIsTranscriptLoading(false);
    }
  }, []); // No dependencies needed

  // Handler for analyzing video comments
  const handleAnalyzeComments = useCallback(async (videoId) => {
    if (!videoId) return;
    log('info', 'Requesting comment analysis:', videoId);
    const systemMessage = { role: 'system', content: `Analyzing comments for ${videoId}...` };
    setChatHistory(prev => [...prev, systemMessage]);
    setIsChatSending(true);
    try {
      const data = await analyzeComments(videoId);
      const analysisResult = { role: 'model', content: data.analysis };
      setChatHistory(prev => [...prev, analysisResult]);
      log('info', `Analysis complete for ${videoId}.`);
    } catch (err) {
        console.error("Analyze Comments error:", err);
        const errorMessage = { role: 'system', content: `Error analyzing: ${err.message || 'Failed.'}` };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatSending(false);
    }
  }, []); // No dependencies needed

  // Handler for summarizing video (uses existing transcript if available)
  const handleSummarizeVideo = useCallback(async (videoId) => {
    if (!videoId) return;
    log('info', 'Requesting video summary:', videoId);
    const systemMessage = { role: 'system', content: `Summarizing ${videoId}...` };
    setChatHistory(prev => [...prev, systemMessage]);
    setIsChatSending(true);
    try {
      let summary = '';
      if (Array.isArray(currentTranscript) && currentTranscript.length > 0) {
        log('info', "Summarizing existing transcript...");
        const transcriptText = currentTranscript.map(entry => entry.text).join(' ');
        const data = await summarizeText(transcriptText);
        summary = data.summary;
      } else {
        log('info', "Requesting direct summary (fetching transcript first)...");
        const data = await summarizeDirectly(videoId); // This fetches transcript and summarizes
        summary = data.summary;
      }
      const summaryResult = { role: 'model', content: `**Summary (${videoId}):**\n\n${summary}` };
      setChatHistory(prev => [...prev, summaryResult]);
      log('info', `Summarization complete for ${videoId}.`);
    } catch (err) {
        console.error("Summarize Video error:", err);
        const errText = err.message.includes('Transcript') || err.message.includes('transcript')
            ? 'Cannot summarize: Transcript unavailable or disabled.'
            : `Error summarizing: ${err.message || 'Failed.'}`;
        const errorMessage = { role: 'system', content: errText };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatSending(false);
    }
  }, [currentTranscript]); // Depends on currentTranscript state

  // Handler for sending chat messages
  const handleSendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;
    log('info', 'Sending chat message...');
    const newUserMessage = { role: 'user', content: userMessage };
    setChatHistory(prev => [...prev, newUserMessage]);
    setIsChatSending(true);
    try {
       const data = await postChatMessage(userMessage);
       const modelResponse = { role: 'model', content: data.message };
       setChatHistory(prev => [...prev, modelResponse]);
       log('info', 'Received chat response.');
    } catch (err) {
        console.error("Chat API error:", err);
        const errorMessage = { role: 'system', content: `Error: ${err.message || 'Failed.'}` };
        setChatHistory(prev => [...prev, errorMessage]);
    } finally {
        setIsChatSending(false);
    }
  }, []); // No dependencies needed

  // Handler for user logout
   const handleLogout = useCallback(async () => {
     log('info', 'Attempting logout...');
     try {
       await logoutUser();
       setIsLoggedIn(false);
       setUserData(null);
       // Clear sensitive states on logout? Maybe chat history?
       // setChatHistory([]);
       log('info', 'Logout successful.');
     } catch (error) {
       console.error("Logout error:", error);
       // alert(`Logout failed: ${error.message || 'Unknown error.'}`); // Avoid alert in prod
     }
   }, []); // No dependencies needed

  // Handler for loading more news articles
  const handleLoadMoreNews = useCallback(() => {
    setNewsCurrentPage(prev => prev + 1);
    log('info', `Load more news, page ${newsCurrentPage + 1}`);
  }, [newsCurrentPage]); // Depends on newsCurrentPage

  // Handler for selecting a video from the list
  const handleVideoSelect = useCallback((videoId) => {
    log('info', 'Video selected:', videoId);
    setSelectedVideoId(videoId);
    setActiveTab('youtube'); // Switch tab to YouTube if a video is selected from another tab? Optional.
    fetchVideoDetails(videoId);
  }, [fetchVideoDetails]); // Depends on fetchVideoDetails

  // Handler for going back from video details to search results
  const handleBackToSearch = useCallback(() => {
    log('info', 'Back to search results.');
    setSelectedVideoId(null);
    setSelectedVideoDetails(null);
    setDetailError(null);
    setCurrentTranscript(null);
    setTranscriptError(null);
  }, []); // No dependencies needed

  // Handler for clicking the brand logo (go home)
  const handleGoHome = useCallback((event) => {
    event.preventDefault();
    log('info', "Navigating home (Resetting states)...");
    // Reset all search/detail states
    setSearchResults([]); setSearchError(null); setIsSearchLoading(false);
    setSelectedVideoId(null); setSelectedVideoDetails(null); setDetailError(null);
    setCurrentTranscript(null); setTranscriptError(null); setIsTranscriptLoading(false);
    setNewsArticles([]); setNewsError(null); setIsNewsLoading(false);
    setCurrentSearchQuery(''); setNewsCurrentPage(1);
    setActiveTab('youtube'); setSelectedSources([]);
    // Reset web search state
    setWebSearchResults([]); setWebSearchError(null); setWebSearchNextPageStart(null); setIsWebSearchLoading(false);
    fetchNews(); // Fetch initial news
  }, [fetchNews]); // Depends on fetchNews

  // Handler for explicitly loading the latest news feed
  const handleLoadLatestNews = useCallback(async () => {
    log('info', 'Loading latest news manually...');
    setNewsCurrentPage(1); // Reset pagination
    setNewsArticles([]); // Clear existing articles before fetching
    setActiveTab('news'); // Switch to news tab
    setSelectedSources([]); // Clear source filters
    await fetchNews(); // Fetch the news
  }, [fetchNews]); // Depends on fetchNews

  // Handler for changing news source filters
  const handleSourceFilterChange = useCallback((sourceName, isChecked) => {
    setSelectedSources(prev => {
        const newSet = new Set(prev);
        if (isChecked) {
            newSet.add(sourceName);
        } else {
            newSet.delete(sourceName);
        }
        return Array.from(newSet);
    });
    setNewsCurrentPage(1); // Reset page when filters change
  }, []); // No dependencies needed

  // --- Render Logic ---
  // Determines what to show in the left column (Video Details or Search Results)
  const renderLeftColumnContent = () => {
    if (isDetailLoading) {
        return ( <div className="d-flex justify-content-center align-items-center h-100 p-3"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading details...</span></div></div> );
    }
    if (detailError) {
        return ( <div className="alert alert-danger m-3">Error loading details: {detailError}<button onClick={handleBackToSearch} className="btn btn-sm btn-outline-danger ms-2 float-end"><i className="bi bi-arrow-left"></i> Back</button></div> );
    }
    if (selectedVideoDetails) {
        return ( <VideoDetails videoData={selectedVideoDetails} onBack={handleBackToSearch} onGetTranscript={handleGetTranscript} onAnalyzeComments={handleAnalyzeComments} onSummarizeVideo={handleSummarizeVideo} transcript={currentTranscript} isTranscriptLoading={isTranscriptLoading} transcriptError={transcriptError} /> );
    }
    // If no video selected, show the SearchResultsView with all props
    return (
         <SearchResultsView
            // YouTube Props
            youtubeResults={searchResults}
            isYoutubeLoading={isSearchLoading}
            youtubeError={searchError}
            // News Props
            newsArticles={newsArticles}
            isNewsLoading={isNewsLoading}
            newsError={newsError}
            newsCurrentPage={newsCurrentPage}
            newsItemsPerPage={NEWS_ITEMS_PER_PAGE}
            availableSources={ Array.from(new Set(newsArticles.map(a => a.sourceName))).sort() }
            selectedSources={selectedSources}
            onSourceFilterChange={handleSourceFilterChange}
            onLoadMoreNews={handleLoadMoreNews}
            onLoadLatestNews={handleLoadLatestNews}
             // Web Search Props
             webSearchResults={webSearchResults}
             isWebSearchLoading={isWebSearchLoading}
             webSearchError={webSearchError}
             webSearchNextPageStart={webSearchNextPageStart}
             onLoadMoreWebResults={handleLoadMoreWebResults} // Pass the handler down
            // General Props
            currentSearchQuery={currentSearchQuery}
            onVideoSelect={handleVideoSelect}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
         />
    );
  };

  // --- Main JSX Return ---
  return (
    <div className="d-flex flex-column vh-100">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm px-3">
         <a className="navbar-brand fs-4 fw-bold me-auto" href="#" onClick={handleGoHome}>ApdetaX</a>
         <div className="d-flex align-items-center">
              {isAuthLoading ? ( <div className="spinner-border spinner-border-sm text-light" role="status"><span className="visually-hidden">Loading...</span></div> )
              : isLoggedIn && userData ? ( <> {userData.picture && ( <img src={userData.picture} alt="Profile" className="rounded-circle me-2" style={{ width: '30px', height: '30px' }} referrerPolicy="no-referrer" onError={(e) => { e.target.style.display = 'none'; }} /> )} <span className="navbar-text text-light me-3" title={userData.email || ''}> Hi, {userData.name || 'User'} </span> <button onClick={handleLogout} className="btn btn-outline-light btn-sm"> Logout </button> </> )
              : ( <a href="/api/auth/google" className="btn btn-outline-light btn-sm" role="button"><i className="bi bi-google me-1"></i> Login</a> )}
         </div>
      </nav>

      {/* Main Content */}
      <div className="container-fluid mt-3 flex-grow-1">
        <div className="row h-100">
          {/* Left Column */}
          <div className="col-lg-7 d-flex flex-column h-100 mb-3 mb-lg-0">
             <SearchBar onSearch={handleSearch} />
             <div className="results-container border rounded flex-grow-1" style={{ backgroundColor: 'var(--bg-content)', overflowY: 'auto', position: 'relative' }}>
                {renderLeftColumnContent()}
             </div>
          </div>
          {/* Right Column (Chat) */}
          <div className="col-lg-5 d-flex flex-column h-100 chat-container">
             <ChatWindow history={chatHistory} onSendMessage={handleSendMessage} isSending={isChatSending} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-2 mt-auto small" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-main)'}}>
         <p className="mb-0">© {currentYear} ApdetaX | by Riziyan</p>
      </footer>
    </div>
  );
}

export default App;