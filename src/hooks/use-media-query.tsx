import { useEffect, useState } from "react";

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const matchMedia = window.matchMedia(query);

    // Set initial value
    setMatches(matchMedia.matches);

    // Define the event handler
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add the event listener
    matchMedia.addEventListener("change", handler);

    // Clean up
    return () => {
      matchMedia.removeEventListener("change", handler);
    };
  }, [query]);

  return matches;
}
