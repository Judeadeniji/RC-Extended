import { $computed } from "../../store"
import { useMediaQuery } from "../useMediaQuery"

function usePreferredContrast() {
  const matches = useMediaQuery("(prefers-color-scheme: more)")
  const contrast = $computed(() => matches.value)

  return contrast
}

export { usePreferredContrast }