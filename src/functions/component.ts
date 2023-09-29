import { ReactElement } from "react";
import { computed } from "../store"

// still working on this
function $Component(fn: (props: Record<string, any>) => ReactElement) {
  const computedComp = computed(() => fn)
  return computedComp.value
}

export {
  $Component as experimental__$Component
}