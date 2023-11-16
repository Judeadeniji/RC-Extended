import { $computed } from "../../store";
import { useMediaQuery } from "../useMediaQuery";

function usepreferredColorScheme() {
  const matches = useMediaQuery("(prefers-color-scheme: dark)")
  const colorScheme = $computed<"dark" | "light">(() => matches.value ? "dark" : "light");

  return colorScheme
}


export { usepreferredColorScheme };