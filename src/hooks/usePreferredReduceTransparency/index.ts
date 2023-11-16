import { useEffect } from "react"
import { $computed, $signal } from "../../store"
import { useMediaQuery } from "../useMediaQuery"

function usePreferredReduceTransparency() {
  const matches = useMediaQuery("(prefers-reduced-transparency: reduce)")
  const reduceTransparency = $computed(() => matches.value)
 
  return reduceTransparency
}

export { usePreferredReduceTransparency }