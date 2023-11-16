import { $computed } from "../../store"
import { useMediaQuery } from "../useMediaQuery"

function usePreferredHighContrast() {
  const matches = useMediaQuery("(forced-colors)")
  const highContrast = $computed(() => matches.value)

  return highContrast
}

export { usePreferredHighContrast }