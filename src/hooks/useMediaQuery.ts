import { useState, useEffect } from 'react';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Ensure window is defined (runs only client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    // Handler to update state on change
    const documentChangeHandler = () => setMatches(mediaQueryList.matches);

    // Set initial state
    documentChangeHandler();

    // Listen for changes
    try {
        // Use newer addEventListener method if available
        mediaQueryList.addEventListener('change', documentChangeHandler);
        // Cleanup listener on component unmount
        return () => {
            mediaQueryList.removeEventListener('change', documentChangeHandler);
        };
    } catch { // Fallback for older browsers (less likely needed with modern Next.js)
        try {
            mediaQueryList.addListener(documentChangeHandler);
            return () => {
                mediaQueryList.removeListener(documentChangeHandler);
            };
        } catch (fallbackError) {
            console.error("useMediaQuery: addListener fallback failed", fallbackError);
        }
    }
  }, [query]); // Re-run effect if query changes

  return matches;
}

export default useMediaQuery;
