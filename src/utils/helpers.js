// frontend/src/utils/helpers.js (FIXED formatTimestamp function)

/**
 * Formats an ISO 8601 duration string (PTnHnMnS) into a human-readable string (e.g., "1h 23m 45s").
 * @param {string | undefined | null} duration - The ISO 8601 duration string (e.g., "PT15M33S").
 * @returns {string} The formatted duration string (e.g., "15m 33s"), "N/A" if input is null/undefined, or "Unknown" if format is invalid.
 */
export function formatDuration(duration) {
    if (!duration) return 'N/A'; 

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?S))?/); 
    
    if (!match) { 
        console.warn(`Invalid duration format encountered: ${duration}`); 
        return 'Unknown'; 
    }
    
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10); 
    
    let formattedParts = [];
    if (hours > 0) { 
        formattedParts.push(`${hours}h`); 
    }
    if (minutes > 0) { 
        formattedParts.push(`${minutes}m`); 
    }
    if (seconds > 0 || (hours === 0 && minutes === 0)) { 
        formattedParts.push(`${seconds}s`); 
    }
    
    const result = formattedParts.join(' ');
    return result || '0s'; 
}

/**
 * Truncates text to a maximum length, optionally breaking at the last space before the limit.
 * Also removes simple HTML tags before truncating.
 * @param {string | undefined | null} text - The input text, potentially containing HTML tags.
 * @param {number} maxLength - The maximum desired length of the output string (excluding ellipsis).
 * @returns {string} The truncated text with "..." appended if truncation occurred, or the original text if shorter. Returns empty string for null/undefined input.
 */
export function truncateText(text, maxLength = 100) { 
    if (!text) return ''; 

    const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s{2,}/g, ' ').trim(); 
    
    if (plainText.length <= maxLength) {
        return plainText;
    }
    
    const lastSpaceIndex = plainText.lastIndexOf(' ', maxLength);
    
    const cutIndex = lastSpaceIndex === -1 ? maxLength : lastSpaceIndex;
    
    return plainText.substring(0, cutIndex) + '...';
}

/**
 * Formats a date string or Date object into a locale-specific, human-readable date string (e.g., "Apr 15, 2024").
 * @param {string | Date | undefined | null} dateInput - The date string (ISO 8601 recommended) or Date object.
 * @returns {string} The formatted date string, 'No Date' for null/undefined input, or 'Invalid Date' if parsing fails.
 */
export function formatDate(dateInput) {
    if (!dateInput) return 'No Date'; 

    try {
        const date = new Date(dateInput);
        
        if (isNaN(date.getTime())) {
            console.warn(`Invalid date input encountered: ${dateInput}`); 
            return 'Invalid Date';
        }
        
         return date.toLocaleDateString(undefined, { 
            year: 'numeric',
            month: 'short', 
            day: 'numeric'
        });

    } catch (e) {
        console.error(`Error formatting date input "${dateInput}":`, e); 
        return 'Invalid Date'; 
    }
}

/**
 * Formats an offset in SECONDS into a time string (MM:SS or HH:MM:SS).
 * @param {number | undefined | null} offsetSeconds - The offset time in SECONDS.
 * @returns {string} The formatted time string (e.g., "01:23", "01:15:45"), or "00:00" if input is invalid/null.
 */
export function formatTimestamp(offsetSeconds) { // <-- Parameter renamed for clarity
    // Handle null, undefined, NaN, or negative inputs gracefully
    if (offsetSeconds == null || isNaN(offsetSeconds) || offsetSeconds < 0) {
        return "00:00"; 
    }

    // *** FIX: Use the input directly as seconds, rounding down ***
    const totalSeconds = Math.floor(offsetSeconds); 
    // *** REMOVED: Division by 1000 ***

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format minutes and seconds with leading zeros using padStart
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    // Include hours in the output only if the duration is one hour or longer
    if (hours > 0) {
        const formattedHours = String(hours).padStart(2, '0');
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    } else {
        // Otherwise, just display minutes and seconds
        return `${formattedMinutes}:${formattedSeconds}`;
    }
}