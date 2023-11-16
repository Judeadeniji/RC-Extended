// eslint-disable-next-line no-restricted-imports
import { useEffect } from "react"
import { $signal } from "../../store"

/**
 * Mounted state in signal.
 *
 * @see https://rc-extended/useMounted
 */
export function useMounted() {
  const isMounted = $signal(false)

  useEffect(() => {
    isMounted.value = true;
  }, [])

  return isMounted
}