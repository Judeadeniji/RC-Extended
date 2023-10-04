import { Signal, batch } from "./signals.js"

export interface State {
  [key: string]: any
};
export type SignalState<S> = {
  [key: string]: Signal<S>
};
export type Getters = Record<string, (state: State) => any>;
export type Actions = Record<string, (...args: any[]) => State>;
export type Computed = Record<string, (state: any) => any>;
export type Effects = Record<string, ((state: State) => () => void)>;
export type ComputedSignals = Record<string, () => any>;
export type EffectSignals = Record<string, () => void>;
export type ActionSignals = Record<string, (...args: any[]) => typeof batch>;
export type GettersSignal = Record<string, (...args: any[]) => typeof batch>;
export type WrappedState = Record<string, Signal>;
export type CentralizedState = Record<string, any>
export type Unsubscribe = (() => void) | void

/**
 * Definitions for creating a store.
 */
export interface Definitions {
  state: () => State;
  actions?: Actions;
  computed?: Computed;
  effects?: Effects;
  getters?: Getters;
}
