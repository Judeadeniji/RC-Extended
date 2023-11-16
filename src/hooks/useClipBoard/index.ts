/* this implementation is original ported from https://github.com/logaretm/vue-use-web by Abdelrahman Awad */

import { toValue } from '../../functions/toValue'
import type { ReadonlySignal, Signal } from '../../store'
import { $computed, $signal } from '../../store'
import { useEventListener } from '../useEventListener'
import { useSupported } from '../useSupported'
import type { ConfigurableNavigator } from '../../utils'
import { defaultNavigator, noop } from '../../utils'
import { usePermission } from '../usePermission'
import { MaybeSignal } from '../../utils'
import { useTimeoutFn } from '../timers'

export interface UseClipboardOptions<Source> extends ConfigurableNavigator {
  /**
   * Enabled reading for clipboard
   *
   * @default false
   */
  read?: boolean

  /**
   * Copy source
   */
  source?: Source

  /**
   * Milliseconds to reset state of `copied` ref
   *
   * @default 1500
   */
  copiedDuring?: number

  /**
   * Whether fallback to document.execCommand('copy') if clipboard is undefined.
   *
   * @default false
   */
  legacy?: boolean

  onSuccess?: () => void
}

export interface UseClipboardReturn<Optional> {
  isSupported: Signal<boolean>
  text: ReadonlySignal<string>
  copied: ReadonlySignal<boolean>
  copy: Optional extends true ? (text?: string) => Promise<void> : (text: string) => Promise<void>
}

/**
 * Reactive Clipboard API.
 *
 * @see https://vueuse.org/useClipboard
 * @param options
 */
export function useClipboard(options?: UseClipboardOptions<undefined>): UseClipboardReturn<false>
export function useClipboard(options: UseClipboardOptions<MaybeSignal<string>>): UseClipboardReturn<true>
export function useClipboard(options: UseClipboardOptions<MaybeSignal<string> | undefined> = {}): UseClipboardReturn<boolean> {
  const {
    navigator = defaultNavigator,
    read = false,
    source,
    copiedDuring = 1500,
    legacy = false,
    onSuccess = noop,
  } = options

  const isClipboardApiSupported = useSupported(() => (navigator && 'clipboard' in navigator))
  const permissionRead = usePermission('clipboard-read')
  const permissionWrite = usePermission('clipboard-write')
  const isSupported = $computed(() => isClipboardApiSupported.value || legacy)
  const text = $signal('')
  const copied = $signal(false)
  const timeout = useTimeoutFn(() => copied.value = false, copiedDuring)

  function updateText() {
    if (isClipboardApiSupported.value && permissionRead.value !== 'denied') {
      navigator!.clipboard.readText().then((value) => {
        text.value = value
      })
    }
    else {
      text.value = legacyRead()
    }
  }

  if (isSupported.value && read)
    useEventListener(['copy', 'cut'], updateText)

  async function copy(value = toValue(source)) {
    if (isSupported.value && value != null) {
      if (isClipboardApiSupported.value && permissionWrite.value !== 'denied')
        await navigator!.clipboard.writeText(value)
      else
        legacyCopy(value)

      text.value = value
      copied.value = true
      onSuccess()
      timeout.start()
    }
  }

  function legacyCopy(value: string) {
    const ta = document.createElement('textarea')
    ta.value = value ?? ''
    ta.style.position = 'absolute'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    ta.remove()
  }

  function legacyRead() {
    return document?.getSelection?.()?.toString() ?? ''
  }

  return {
    isSupported,
    text: text as ReadonlySignal<string>,
    copied: copied as ReadonlySignal<boolean>,
    copy,
  }
}