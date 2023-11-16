import type { Arrayable, Fn, MaybeSignal, MaybeElementRef } from '../../utils'
import { isObject, noop, defaultWindow } from '../../utils'
import { toValue } from "../../functions"
import { $watch, $signal, Signal } from '../../store'
import { useEffect } from "react"

interface InferEventTarget<Events> {
  addEventListener(event: Events, fn?: any, options?: any): any
  removeEventListener(event: Events, fn?: any, options?: any): any
}

export type WindowEventName = keyof WindowEventMap
export type DocumentEventName = keyof DocumentEventMap

export interface GeneralEventListener<E = Event> {
  (evt: E): void
}

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 1: Omitted Window target
 *
 * @see https://rc-extended/useEventListener
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<E extends keyof WindowEventMap>(
  event: Arrayable<E>,
  listener: Arrayable<(this: Window, ev: WindowEventMap[E]) => any>,
  options?: MaybeSignal<boolean | AddEventListenerOptions>
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 2: Explicitly Window target
 *
 * @see https://rc-extended/useEventListener
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<E extends keyof WindowEventMap>(
  target: Window,
  event: Arrayable<E>,
  listener: Arrayable<(this: Window, ev: WindowEventMap[E]) => any>,
  options?: MaybeSignal<boolean | AddEventListenerOptions>
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 3: Explicitly Document target
 *
 * @see https://rc-extended/useEventListener
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<E extends keyof DocumentEventMap>(
  target: DocumentOrShadowRoot,
  event: Arrayable<E>,
  listener: Arrayable<(this: Document, ev: DocumentEventMap[E]) => any>,
  options?: MaybeSignal<boolean | AddEventListenerOptions>
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 4: Explicitly HTMLElement target
 *
 * @see https://rc-extended/useEventListener
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: MaybeSignal<HTMLElement | null | undefined>,
  event: Arrayable<E>,
  listener: (this: HTMLElement, ev: HTMLElementEventMap[E]) => any,
  options?: boolean | AddEventListenerOptions
): () => void

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 5: Custom event target with event type infer
 *
 * @see https://rc-extended/useEventListener
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<Names extends string, EventType = Event>(
  target: InferEventTarget<Names>,
  event: Arrayable<Names>,
  listener: Arrayable<GeneralEventListener<EventType>>,
  options?: MaybeSignal<boolean | AddEventListenerOptions>
): Fn

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 6: Custom event target fallback
 *
 * @see https://rc-extended/useEventListener
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<EventType = Event>(
  target: MaybeSignal<EventTarget | null | undefined>,
  event: Arrayable<string>,
  listener: Arrayable<GeneralEventListener<EventType>>,
  options?: MaybeSignal<boolean | AddEventListenerOptions>
): Fn

export function useEventListener(...args: any[]) {
  let target: Signal<EventTarget | undefined>
  let events: Arrayable<string>
  let listeners: Arrayable<Function>
  let options: MaybeSignal<boolean | AddEventListenerOptions> | undefined

  if (typeof args[0] === 'string' || Array.isArray(args[0])) {
    [events, listeners, options] = args
    target = $signal(defaultWindow)
  }
  else {
    [target, events, listeners, options] = args
  }

  if (!target)
    return noop

  if (!Array.isArray(events))
    events = [events]
  if (!Array.isArray(listeners))
    listeners = [listeners]

  const cleanups: Function[] = []
  const cleanup = () => {
    cleanups.forEach(fn => fn())
    cleanups.length = 0
  }

  const register = (el: any, event: string, listener: any, options: any) => {
    el.addEventListener(event, listener, options)
    return () => el.removeEventListener(event, listener, options)
  }

  const stopWatch = target?.subscribe && $watch(
    target,
    (el) => {
      if (!el)
        return noop

      // create a clone of options, to avoid it being changed reactively on removal
      const optionsClone = isObject(options) ? { ...options } : options
      cleanups.push(
        ...(events as string[]).flatMap((event) => {
          return (listeners as Function[]).map(listener => register(el, event, listener, optionsClone))
        }),
      )

      return () => {
        cleanup()
        stopWatch?.()
      }
    }
  )

  const stop = () => {
    stopWatch?.()
    cleanup()
  }

  useEffect(() => {
    return stop
  }, [])

  return stop
}