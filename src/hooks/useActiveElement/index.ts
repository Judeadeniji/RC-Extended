import { useEffect } from 'react'
import { useEventListener } from '../useEventListener'
import type { ConfigurableDocumentOrShadowRoot, ConfigurableWindow } from '../../utils'
import { defaultWindow } from '../../utils'
import { $signal } from "../../store"

export interface UseActiveElementOptions extends ConfigurableWindow, ConfigurableDocumentOrShadowRoot {
  /**
   * Search active element deeply inside shadow dom
   *
   * @default true
   */
  deep?: boolean
}

/**
 * Reactive `document.activeElement`
 *
 * @see https://rc-extended/useActiveElement
 * @param options
 */
export function useActiveElement(
  options: UseActiveElementOptions = {},
) {
  const {
    window = defaultWindow,
    deep = true,
  } = options
  const document = options.document ?? window?.document
  const activeElement = $signal<Element | null | undefined>(null)

  const getDeepActiveElement = () => {
    let element = document?.activeElement
    if (deep) {
      while (element?.shadowRoot)
        element = element?.shadowRoot?.activeElement
    }
    
    activeElement.value = element;
  }

  const x = $signal(window)

  if (window) {
    // useEventListener(x, 'blur', (event: FocusEvent) => {
    //   if (event.relatedTarget !== null)
    //     return
    //   getDeepActiveElement()
    // }, true)
    useEventListener(x, 'focus', getDeepActiveElement, true)
  }

  return activeElement
}