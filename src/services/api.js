// frontend/src/services/api.js

/**
 * Helper function to process fetch responses, handle errors, and parse JSON/text.
 * @param {Response} response - The Response object from the fetch call.
 * @returns {Promise<any>} - Resolves with parsed data or throws Error on failure.
 */
async function handleResponse(response) {
    const contentType = response.headers.get("content-type");
    let data;

    if (contentType && contentType.includes("application/json")) {
        // Handle potential empty JSON responses (e.g., 204 No Content)
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            data = {}; // Treat as empty object for consistency
        } else {
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error("API Error: Failed to parse JSON response.", jsonError, await response.text()); // Log raw text on error
                throw new Error(`Failed to parse JSON response from ${response.url}. Status: ${response.status}`);
            }
        }
    } else {
        // Handle non-JSON responses as text
        try {
           data = await response.text();
        } catch (textError) {
             console.error("API Error: Failed to read text response.", textError);
             throw new Error(`Failed to read text response from ${response.url}. Status: ${response.status}`);
        }
    }

    // Check if the response status code indicates success (2xx)
    if (!response.ok) {
        // Try to get a meaningful error message from JSON or text body, fallback to status text
        // Prioritize 'message' field from JSON error structure
        const errorMessage = data?.message || (typeof data === 'string' && data ? data : response.statusText) || `Request failed with status ${response.status}`;
        console.error("API Error Response:", { status: response.status, statusText: response.statusText, url: response.url, data: data });
        throw new Error(errorMessage); // Throw error for calling code to catch
    }

    return data; // Return parsed data on success
}

// --- API Function Definitions ---

/**
 * Searches YouTube videos via the backend API.
 * @param {string} query - The search query term(s).
 * @param {string} [order='relevance'] - The sorting order for results.
 * @param {string} [region=''] - The ISO 3166-1 alpha-2 region code. Empty for worldwide.
 * @returns {Promise<Array<object>>} - Promise resolving to an array of video result objects.
 */
export async function searchYoutube(query, order = 'relevance', region = '') {
    // Basic client-side validation
    if (!query || typeof query !== 'string' || query.trim() === '') {
        console.warn("searchYoutube called with empty query.");
        return []; // Return empty array immediately
    }

    // Build the base API URL
    let apiUrl = `/api/youtubesearch?q=${encodeURIComponent(query.trim())}&order=${encodeURIComponent(order)}`;

    // Append the regionCode parameter ONLY if a valid region is provided
    if (region && typeof region === 'string' && region.trim() !== '') {
        // --- CORRECTED LINE ---
        apiUrl += `&regionCode=${encodeURIComponent(region.trim())}`;
        // --------------------
    }

    console.log('Calling YouTube search API:', apiUrl);

    // Perform the fetch request
    const response = await fetch(apiUrl);
    // Process the response using the helper function
    return handleResponse(response);
}

/**
 * Fetches the aggregated news feed from the backend API.
 * @returns {Promise<Array<object>>} - Promise resolving to an array of news article objects.
 */
export async function getNewsFeed() {
    const response = await fetch('/api/rssnews');
    return handleResponse(response);
}

/**
 * Fetches detailed information for a specific YouTube video.
 * @param {string} videoId - The unique ID of the video.
 * @returns {Promise<object>} - Promise resolving to the video details object.
 */
export async function getVideoDetails(videoId) {
    if (!videoId) {
        // Throw error immediately if videoId is missing
        throw new Error("Video ID is required to fetch details.");
    }
    const response = await fetch(`/api/video/${videoId}`);
    return handleResponse(response);
}

/**
 * Fetches the transcript for a specific YouTube video.
 * @param {string} videoId - The unique ID of the video.
 * @returns {Promise<{transcript: Array<object>}>} - Promise resolving to object { transcript: [...] }.
 */
export async function getVideoTranscript(videoId) {
    if (!videoId) {
        throw new Error("Video ID is required to fetch the transcript.");
    }
    const response = await fetch(`/api/transcript/${videoId}`);
    return handleResponse(response);
}

/**
 * Sends a message to the backend chat API.
 * @param {string} message - The user's message text.
 * @returns {Promise<{message: string}>} - Promise resolving to the AI's response object.
 */
export async function postChatMessage(message) {
    if (!message || typeof message !== 'string' || message.trim() === '') {
        throw new Error("Cannot send an empty message.");
    }
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
    });
    return handleResponse(response);
}

/**
 * Sends a request to the backend API to analyze video comments.
 * @param {string} videoId - The unique ID of the video.
 * @returns {Promise<{analysis: string}>} - Promise resolving to the analysis object.
 */
export async function analyzeComments(videoId) {
    if (!videoId) {
        throw new Error("Video ID is required to analyze comments.");
    }
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
    });
    return handleResponse(response);
}

/**
 * Sends text to the backend API for summarization.
 * @param {string} text - The text content to be summarized.
 * @returns {Promise<{summary: string}>} - Promise resolving to the summary object.
 */
export async function summarizeText(text) {
     if (!text || typeof text !== 'string' || text.trim() === '') {
        throw new Error("Cannot summarize empty text.");
    }
    const response = await fetch('/api/summarize-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
    });
    return handleResponse(response);
}

/**
 * Sends a request to the backend API to fetch transcript and summarize directly.
 * @param {string} videoId - The unique ID of the video.
 * @returns {Promise<{summary: string}>} - Promise resolving to the summary object.
 */
export async function summarizeDirectly(videoId) {
    if (!videoId) {
        throw new Error("Video ID is required for direct summarization.");
    }
    const response = await fetch('/api/summarize-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId }),
    });
    return handleResponse(response);
}

// --- ADD THIS FUNCTION for Web Search ---
/**
 * Searches the web via the backend CSE API.
 * @param {string} query - The search term(s).
 * @param {number} [start=1] - The starting index for results (for pagination).
 * @returns {Promise<{items: Array<object>, nextPageStartIndex?: number | null}>}
 *          A promise resolving to an object containing the 'items' array
 *          and optionally 'nextPageStartIndex' for pagination.
 */
export async function searchWeb(query, start = 1) {
    // Basic validation on the frontend
    if (!query || typeof query !== 'string' || query.trim() === '') {
        console.warn("searchWeb called with empty query.");
        // Return expected structure to prevent errors in calling component
        return { items: [], nextPageStartIndex: null };
    }

    // Construct the API URL
    const apiUrl = `/api/websearch?q=${encodeURIComponent(query.trim())}&start=${start}`;
    console.log('Calling Web search API:', apiUrl); // Debug log

    // Perform the fetch request
    const response = await fetch(apiUrl);

    // Use the handleResponse helper
    // Expects backend to send { items: [...], nextPageStartIndex: ... } structure
    return handleResponse(response);
}
// ----------------------------------------


// --- Authentication API Functions ---

/**
 * Checks the current user's login status via the backend API.
 * @returns {Promise<{loggedIn: boolean, user: object | null}>} - Login status and user data.
 */
export async function checkLoginStatus() {
    try {
        // Crucial: send cookies with the request
        const response = await fetch('/api/auth/profile', { credentials: 'include' });
        // Use handleResponse to handle potential non-OK status correctly
        return await handleResponse(response);
    } catch (error) {
        // Handle network errors or cases where backend returns non-OK status for profile check
        console.error("Error during checkLoginStatus or user not authenticated:", error.message);
        // If handleResponse throws (e.g., 401 Unauthorized), this catch block handles it
        return { loggedIn: false, user: null }; // Assume logged out on error/non-OK response
    }
}

/**
 * Logs the current user out by calling the backend logout endpoint.
 * @returns {Promise<{message: string}>} - Success message.
 */
export async function logoutUser() {
    // Crucial: send cookies to identify the session to be destroyed
    const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // Send session cookie
    });
    // Expects { message: 'Logout successful' } on success
    return handleResponse(response);
}