import { $computed } from "../../store"
import { useMediaQuery } from "../useMediaQuery"

function usePreferredReduceMotion() {
  const matches = useMediaQuery("(prefers-reduced-motion: reduce)")
  const reduceMotion = $computed(() => matches.value)

  return reduceMotion
}

export { usePreferredReduceMotion }