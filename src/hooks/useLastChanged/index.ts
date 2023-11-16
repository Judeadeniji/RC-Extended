import { Signal, $signal, $watch } from '../../store'
import { timestamp } from '../../utils'

export interface UseLastChangedOptions<InitialValue extends number | null | undefined = undefined> {
  initialValue?: InitialValue
}

/**
 * Records the timestamp of the last change
 *
 * @see https://rc-extended/useLastChanged
 */
export function useLastChanged(source: Signal , options?: UseLastChangedOptions<number>): Signal<number | null>
export function useLastChanged(source: Signal, options: UseLastChangedOptions | UseLastChangedOptions<number>): Signal<number>
export function useLastChanged(source: Signal, options: UseLastChangedOptions<any> = {}): Signal<number | null> {
  const ms = $signal<number | null>(options.initialValue ?? null)

  const stop = $watch(source, () => {
    ms.value = timestamp() 

    return stop
  })

  return ms
}