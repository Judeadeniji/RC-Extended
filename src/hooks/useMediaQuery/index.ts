import { useEffect } from "react";
import { $computed, $signal } from "../../store";

function useMediaQuery(query: string) {
  const matches = $signal(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia(query);
        matches.value = mediaQuery.matches;
    
        const handler = () => matches.value = mediaQuery.matches;
        mediaQuery.addEventListener('change', handler);
    
        return () => mediaQuery.removeEventListener('change', handler);
    }, [query]);

    return $computed(() => matches.value);
}

export { useMediaQuery }