import { $computed, $signal, ReadonlySignal } from '../../store'
import type { MaybeSignal, PointerType, Position } from '../../utils'
import { toSignals, toValue } from '../../functions'
import { defaultWindow, isClient } from '../../utils'
import { useEventListener } from '../useEventListener'

export interface UseDraggableOptions {
  /**
   * Only start the dragging when click on the element directly
   *
   * @default false
   */
  exact?: MaybeSignal<boolean>

  /**
   * Prevent events defaults
   *
   * @default false
   */
  preventDefault?: MaybeSignal<boolean>

  /**
   * Prevent events propagation
   *
   * @default false
   */
  stopPropagation?: MaybeSignal<boolean>

  /**
   * Whether dispatch events in capturing phase
   *
   * @default true
   */
  capture?: boolean

  /**
   * Element to attach `pointermove` and `pointerup` events to.
   *
   * @default window
   */
  draggingEl?: MaybeSignal<HTMLElement | SVGElement | Window | Document | null | undefined>

  /**
   * Element for calculating bounds (If not set, it will use the event's target).
   *
   * @default undefined
   */
  containerElement?: MaybeSignal<HTMLElement | SVGElement | null | undefined>

  /**
   * Handle that triggers the drag event
   *
   * @default target
   */
  handle?: MaybeSignal<HTMLElement | SVGElement | null | undefined>

  /**
   * Pointer types that listen to.
   *
   * @default PointerType ['mouse', 'touch', 'pen']
   */
  pointerTypes?: PointerType[]

  /**
   * Initial position of the element.
   *
   * @default Position { x: 0, y: 0 }
   */
  initialValue?: MaybeSignal<Position>

  /**
   * Callback when the dragging starts. Return `false` to prevent dragging.
   */
  onStart?: (position: Position, event: PointerEvent) => void | false

  /**
   * Callback during dragging.
   */
  onMove?: (position: Position, event: PointerEvent) => void

  /**
   * Callback when dragging end.
   */
  onEnd?: (position: Position, event: PointerEvent) => void

  /**
   * Axis to drag on.
   *
   * @default 'both'
   */
  axis?: 'x' | 'y' | 'both'
}

/**
 * Make elements draggable.
 * @see https://rc-extended/useDraggable
 * @param target
 * @param options
 */
export function useDraggable(
  target: MaybeSignal<HTMLElement | SVGElement | null | undefined>,
  options: UseDraggableOptions = {},
) {
  const {
    pointerTypes,
    preventDefault,
    stopPropagation,
    exact,
    onMove,
    onEnd,
    onStart,
    initialValue,
    axis = 'both',
    draggingEl = defaultWindow,
    containerElement,
    handle: draggingHandle = target,
  } = options

  const draggingElement = $signal(draggingEl)

  const position = $signal<Position>(
    toValue(initialValue) ?? { x: 0, y: 0 },
  )

  const pressedDelta = $signal<Position>(position.peek())

  const filterEvent = (e: PointerEvent) => {
    if (pointerTypes)
      return pointerTypes.includes(e.pointerType as PointerType)
    return true
  }

  const handleEvent = (e: PointerEvent) => {
    if (toValue(preventDefault))
      e.preventDefault()
    if (toValue(stopPropagation))
      e.stopPropagation()
  }

  const start = (e: PointerEvent) => {
    if (!filterEvent(e))
      return
    if (toValue(exact) && e.target !== toValue(target))
      return
    const container = toValue(containerElement) ?? toValue(target)
    const rect = container!.getBoundingClientRect()
    const pos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
    if (onStart?.(pos, e) === false)
      return
    pressedDelta.value = pos
    handleEvent(e)
  }
  const move = (e: PointerEvent) => {
    if (!filterEvent(e))
      return
    if (!pressedDelta.value)
      return

    let { x, y } = position.value
    if (axis === 'x' || axis === 'both')
      x = e.clientX - pressedDelta.value.x
    if (axis === 'y' || axis === 'both')
      y = e.clientY - pressedDelta.value.y
    position.value = {
      x,
      y,
    }
    onMove?.(position.value, e)
    handleEvent(e)
  }
  const end = (e: PointerEvent) => {
    if (!filterEvent(e))
      return
    if (!pressedDelta.value)
      return
    pressedDelta.value = undefined
    onEnd?.(position.value, e)
    handleEvent(e)
  }

  if (isClient) {
    const config = { capture: options.capture ?? true }
    useEventListener(draggingHandle, 'pointerdown', start, config)
    useEventListener(draggingElement as any, 'pointermove', move, config)
    useEventListener(draggingElement as any, 'pointerup', end, config)
  }
  
  const isDragging: ReadonlySignal<boolean> = $computed(() => !!pressedDelta.value);
  
  const style: ReadonlySignal<{ left: string; top: string; }> = $computed(() =>({
    left: `${Math.floor(position.value.x)}px`,
    top: `${Math.floor(position.value.y)}px`,
  }));

  return {
    ...toSignals(toValue(position)),
    isDragging,
    style,
  }
}

//export type UseDraggableReturn = ReturnType<typeof useDraggable>