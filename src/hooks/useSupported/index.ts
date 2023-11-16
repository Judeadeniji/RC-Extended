import { $computed } from '../../store'
import { useMounted } from '../useMounted'

export function useSupported(callback: () => unknown) {
  const isMounted = useMounted()

  return $computed(() => {
    // to trigger the signal
    // eslint-disable-next-line no-unused-expressions
    isMounted.value
    return Boolean(callback())
  })
}