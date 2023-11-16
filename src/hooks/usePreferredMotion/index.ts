import { $computed } from "../../store"
import { useMediaQuery } from "../useMediaQuery"

function usePreferredMotion() {
  const matches = useMediaQuery("(prefers-reduced-motion: reduce)")
  const motion = $computed(() => matches.value)
  
  return motion
}

export { usePreferredMotion }