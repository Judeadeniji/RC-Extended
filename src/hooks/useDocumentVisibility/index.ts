import type { SignalRefObject } from '../../functions'
import { signalRef } from '../../functions'
import { defaultDocument, type ConfigurableDocument } from '../../utils'
import { useEventListener } from '../useEventListener'
import { $effect } from "../../store"

/**
 * Reactively track `document.visibilityState`.
 *
 * @see https://rc-extended/useDocumentVisibility
 */
export function useDocumentVisibility(options: ConfigurableDocument = {}): SignalRefObject<DocumentVisibilityState> {
  const { document = defaultDocument } = options
  const visibleRef = signalRef('visible' as DocumentVisibilityState)
  if (!document)
    return visibleRef;

  const visibility = signalRef(document.visibilityState)

  useEventListener(document, 'visibilitychange', () => {
    //@ts-ignore
    visibility.value = document.visibilityState
  })

  return visibility
}