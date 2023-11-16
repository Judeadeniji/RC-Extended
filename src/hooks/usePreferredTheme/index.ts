import { $watch } from "../../store";
import { useStorage } from "../useStorage";
import { usepreferredColorScheme } from "../usePreferredColorScheme";

/**
 * @todo 
 * rename to `useTheme`
 * and also change implementation
 */
function usePreferredTheme(options: { storageKey?: string; storage?: Storage; }) {
    const { storageKey = "rc-theme", storage = localStorage } = options;
  const theme = usepreferredColorScheme()
  const local = useStorage(storageKey, theme.value, storage, { deep: false })

  $watch(theme, (theme) => {
    if (theme === local.peek()) return
    local.value = theme
  })

  function setTheme<T extends "dark" | "light">(theme: T) {
    if (theme === local.peek()) return
    local.value = theme;
  }

  return {
    get theme() {
      return theme.value
    },
    setTheme
  };
}

export { usePreferredTheme };