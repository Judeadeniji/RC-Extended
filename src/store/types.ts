import { Signal, batch } from "./signals.js"

export type State<S> = Record<string, S>;
export type SignalState<S> = State<Signal<S>>;
export type Getters<S> = Record<string, (state: State<S>) => any>;
export type Actions<S> = Record<string, (...args: any[]) => State<S>>;
export type Computed<S> = Record<string, (state: S) => any>;
export type Effects<S> = Record<string, ((state: State<S>) => unknown | (() => unknown))>;
export type ComputedSignals<T> = Record<string, () => T>;
export type EffectSignals = Record<string, () => void>;
export type ActionSignals = Record<string, (...args: any[]) => typeof batch>;
export type GettersSignal = Record<string, (...args: any[]) => typeof batch>;
export type WrappedState<S> = Record<string, Signal<S>>;
export type CentralizedState<CS> = Record<string, CS>
export type Unsubscribe = (() => void) | void

/**
 * Definitions for creating a store.
 */
export interface Definitions<S> {
  state: () => State<S>;
  actions?: Actions<S>;
  computed?: Computed<S>;
  effects?: Effects<S>;
  getters?: Getters<S>;
}
