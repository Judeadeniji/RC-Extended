import type { SignalRefObject } from '../functions'
import { ReadonlySignal, Signal } from '../store'

/**
 * Void function
 */
export type Fn = () => void

/**
 * Any function
 */
export type AnyFn = (...args: any[]) => any

/**
 * Maybe it's a computed ref, or a readonly value 
 */
export type ReadonlyRef<T> = ReadonlySignal<T>

export type Arrayable<T> = T[] | T

/**
 * Infers the element type of an array
 */
export type ElementOf<T> = T extends (infer E)[] ? E : never

export type WatchSource<T = any> = Signal<T>

export type ShallowUnwrapRef<T> = T extends SignalRefObject<infer P> ? P : T

export type Awaitable<T> = Promise<T> | T

export type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never

/**
 * Compatible with versions below TypeScript 4.5 Awaited
 */
export type Awaited<T> =
  T extends null | undefined ? T : // special case for `null | undefined` when not in `--strictNullChecks` mode
    T extends object & { then(onfulfilled: infer F, ...args: infer _): any } ? // `await` only unwraps object types with a callable `then`. Non-object types are not unwrapped
      F extends ((value: infer V, ...args: infer _) => any) ? // if the argument to `then` is callable, extracts the first argument
        Awaited<V> : // recursively unwrap the value
        never : // the argument to `then` was not callable
      T // non-object or non-thenable

export type Promisify<T> = Promise<Awaited<T>>

export type PromisifyFn<T extends AnyFn> = (...args: ArgumentsType<T>) => Promisify<ReturnType<T>>

export interface Pausable {
  /**
   * A ref indicate whether a pausable instance is active
   */
  isActive: Readonly<SignalRefObject<boolean>>

  /**
   * Temporary pause the effect from executing
   */
  pause: Fn

  /**
   * Resume the effects
   */
  resume: Fn
}

export interface Stoppable<StartFnArgs extends any[] = any[]> {
  /**
   * A ref indicate whether a stoppable instance is executing
   */
  isPending: Readonly<SignalRefObject<boolean>>

  /**
   * Stop the effect from executing
   */
  stop: Fn

  /**
   * Start the effects
   */
  start: (...args: StartFnArgs) => void
}

// Internal Types
export type MultiWatchSources = (WatchSource<unknown> | object)[]

export type MapSources<T> = {
  [K in keyof T]: T[K] extends WatchSource<infer V> ? V : never;
}
export type MapOldSources<T, Immediate> = {
  [K in keyof T]: T[K] extends WatchSource<infer V> ? Immediate extends true ? V | undefined : V : never;
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] }

export type MaybeRef<T> = T extends SignalRefObject<T> ? SignalRefObject<T> : Signal<T> | T

export type MaybeSignal<T> = T extends Signal<T> ? Signal<T> : MaybeRef<T> 

export type MaybeElementRef<T> = T extends SignalRefObject<HTMLElement> ? SignalRefObject<HTMLElement> : Signal<T> | T

// common types

export interface Position {
  x: number
  y: number
}

export interface RenderableComponent {
  /**
   * The element that the component should be rendered as
   *
   * @default 'div'
   */
  as?: Object | string
}

export type PointerType = 'mouse' | 'touch' | 'pen'