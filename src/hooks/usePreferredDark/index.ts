import { useEffect } from "react";
import { $computed, $effect, $signal, ReadonlySignal } from "../../store";
import { noop } from "../../utils";
import { useMediaQuery } from "../useMediaQuery";

function useDark() {
  const matches = useMediaQuery("(prefers-color-scheme: dark)")
  const dark = $computed(() => matches.value)
  
  return dark as ReadonlySignal;
}

export {
    useDark
}