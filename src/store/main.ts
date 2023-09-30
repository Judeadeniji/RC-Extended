import { useState, useEffect, useMemo, useRef } from "react";
import { signal, effect, computed, batch, Signal } from "./signals.js";
import useReactive from "../hooks/reactive"

// find a way to fix this type `any`
const StoreMap = new Map<string, Store<any>>();

export type State<S> = Record<string, S>;
type SignalState<S> = Signal<State<S>>;
type Getters<S> = Record<string, (state: State<S>) => any>;
type Actions<S> = Record<string, (...args: any[]) => State<S>>;
type Computed<S> = Record<string, (state: State<S>) => any>;
type Effects<S> = Record<string, ((state: State<S>) => unknown | (() => unknown))>;
type ComputedSignals<T> = Record<string, () => T>;
type EffectSignals = Record<string, () => void>;
type ActionSignals = Record<string, (...args: any[]) => typeof batch>;
type GettersSignal = Record<string, (...args: any[]) => typeof batch>;
type WrappedState<S> = Record<string, Signal<S>>;
type CentralizedState<CS> = Record<string, CS>

/**
 * Definitions for creating a store.
 */
interface Definitions<S> {
  state: () => State<S>;
  actions?: Actions<S>;
  computed?: Computed<S>;
  effects?: Effects<S>;
  getters?: Getters<S>;
}

function centralizeState<S>(states: WrappedState<S>) {
  const merged: CentralizedState<S> = {}
  for (const key in states) {
    const state: Signal<S> = states[key]
    Object.defineProperty(merged, key, {
      get() {
        return state.value
      },
      set(value) {
        state.value = value
      }
    })
  };
  
  return merged;
}

/**
 * Wraps state properties.
 * @param {State} state - The state properties.
 * @returns an object with each items [key, signal(value)] as signals.
 */
function wrapState<S>(state: State<S>) {
  const wrappedState: WrappedState<S> = {};
  
  for (const key in state) {
    const element = state[key]
    wrappedState[key] = signal<S>(element)
  }
  
  return wrappedState;
}

/**
 * Wraps computed properties.
 * @param computedObj - The computed properties.
 * @param state - The state signal.
 * @returns Computed signals.
 */
function wrapComputed<S, T>(computedObj: Computed<S>, state: SignalState<S>): ComputedSignals<T | State<S>> {
  const wrappedComputed: ComputedSignals<T | State<S>> = {};

  for (const key in computedObj) {
    if (computedObj.hasOwnProperty(key)) {
      const element = computed(() => computedObj[key](state.value));

      wrappedComputed[key] = () => element.value as T;
    }
  }

  return wrappedComputed;
}

/**
 * Wraps effects.
 * @param effs - The effects.
 * @param store - The store.
 * @returns Effects.
 */
function wrapEffects<S>(effs: Effects<S>, store: Store<S>): EffectSignals {
  const effects: EffectSignals = {};
  
  // I'm fine with using any here no typecheking here is unnecessary 
  function getDependent(key: string, state: any, computed: any) {
    const s = state[key]
    const c = computed[key];
    if (!s && s == null || !s && s == undefined) {
      return s;
    }
    
    if (typeof c === "function") return c();
    
    // state -> computed > undefined;
    return s || c || undefined;
  }

  for (const key in effs) {
    if (effs.hasOwnProperty(key)) {
      const shouldDepend = key in store.centralState || key in store.computed;
      const element = effect(() => effs[key](shouldDepend ? getDependent(key, store.centralState, store.computed) :  undefined));

      effects[key] = element;
    }
  }

  return effects;
}

/**
 * Wraps actions.
 * @param actions - The actions.
 * @param state - The state signal.
 * @returns Action signals.
 */
//function wrapActions(actions: Actions, state: SignalState): ActionSignals {
function wrapActions<S>(actions: Actions<S>, store: Store<S>): ActionSignals {
  const acs: ActionSignals = {};
  const cs: CentralizedState<S> = store.centralState

  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      const element = actions[action];

      acs[action] = (...args: any[]) => {
        return batch<any>(() => {
          // const newState = element(state.value, ...args);
          const newState = element(cs, ...args);
          if (newState instanceof Promise) {
            // newState.then((r) => state.value = r);
            newState.then((r) => updateState(cs, r))
            // return state.value;
            return cs;
          }
          // return state.value = newState;
           return updateState(cs, newState)
        });
      };
    }
  }

  return acs;
}

/**
 * Helper function to help wrapActions update the state
 */
  function updateState<CS>(oldState: CentralizedState<CS>, newState: State<CS>) {

    for (const [key, value] of Object.entries(newState)) {
      if (value != oldState[key]) {
        oldState[key] = newState[key]
      }
    }
     
     return oldState;
  }

/**
 * Wraps getters.
 * @param getters - The getters.
 * @param store - The store.
 * @returns Getters signals.
 */
function wrapGetters<S>(getters: Getters<S>, store: Store<S>): GettersSignal {
  const gtrrs: GettersSignal = {};

  for (const key in getters) {
    if (getters.hasOwnProperty(key)) {
      const element = getters[key];

      gtrrs[key] = () => {
        return batch<any>(() => {
          const provider: Record<string, any> = {
            ...store.signal.value,
            ...store.actions,
            ...store.computed,
            getSignal: () => store.signal,
            getActions: () => store.actions,
            getComputed: () => store.computed
          };
          const newState = element(provider);
          return newState;
        });
      };
    }
  }

  return gtrrs;
}

/**
 * Store class for managing state, actions, computed properties, effects, and getters.
 */
class Store<S> {
  readonly signal: SignalState<S>;
  public _state: State<S>;
  public state: WrappedState<S>;
  readonly centralState: CentralizedState<S>;
  readonly actions: ActionSignals;
  readonly getters: Getters<S>;
  readonly effects: EffectSignals;
  readonly computed: ComputedSignals<State<S>>;

  /**
   * Creates a new Store instance.
   * @param definitions - Definitions for the store.
   */
  constructor(private readonly storeName: string, definitions: Definitions<S>) {
    this._state = definitions.state();
    this.signal = signal(this._state);
    this.state = wrapState(this._state);
    this.centralState = centralizeState(this.state);
    this.actions = wrapActions(definitions.actions || {}, this);
    // this.actions = wrapActions(definitions.actions || {}, this.signal);
    this.computed = wrapComputed(definitions.computed || {}, this.signal);
    this.effects = wrapEffects(definitions.effects || {}, this);
    this.getters = wrapGetters(definitions.getters || {}, this);
  }
  
  get name() {
    return this.storeName;
  }

  /**
   * Gets the state signal.
   * @returns The state signal.
   */
  getSignal(): SignalState<S> {
    return this.signal;
  }

  /**
   * Gets the actions.
   * @returns The actions.
   */
  getActions() {
    return this.actions;
  }

  /**
   * Gets the computed properties.
   * @returns The computed properties.
   */
  getComputed() {
    return this.computed;
  }

  /**
   * Gets the effects.
   * @returns The effects.
   */
  getEffects() {
    return this.effects;
  }

  /**
   * Gets the getters.
   * @returns The getters.
   */
  getGetters() {
    return this.getters;
  }
  
  subscribe(listener: () => void) {
   const unsubscribe = this.signal.subscribe(listener);
   
   return unsubscribe;
  }
}

/**
 * Defines a new store.
 * @param storeName - The name of the store.
 * @param definitions - Definitions for the store.
 * @throws Error if a store with the same name already exists.
 * @returns A function to create and access the store.
 */
export function defineStore<S>(storeName: string, definitions: Definitions<S>): () => Store<S> {
  if (StoreMap.has(storeName)) {
    throw new Error(`Store with name "${storeName}" already exists. Use 'useStore("${storeName}")' to access it.`);
  }

  const store = new Proxy(new Store(storeName, definitions), {
    get(target: Store<S>, key: string) {
      const provider: Record<string, any> = {
        ...target.actions,
        ...target.computed,
        ...target.getters,
        getSignal: target.getSignal,
        getActions: target.getActions,
        getComputed: target.getComputed,
        getGetters: target.getGetters,
      };
      
      for(const key in target.state) {
        provider[key] = target.centralState[key]
      }

      if (key in provider) {
        return provider[key];
      } else if (key === "state") {
        return target.state
      } else {
        throw new Error(`Property '${key}' not found in store '${storeName}', This might be a bug in RC-Extended.`);
      }
    },
    set() {
      return false;
    }
  });

  StoreMap.set(storeName, store);

  return () => useStore(storeName);
}

/**
 * Hook to access a store by its name.
 * @param storeName - The name of the store.
 * @throws Error if the store is not found.
 * @returns The store.
 */
export function useStore<S>(storeName: string): Store<S> {
  const store = StoreMap.get(storeName);

  if (store === undefined) {
    throw new Error(`Store "${storeName}" not found. Make sure to define it using 'defineStore("${storeName}", definitions)'.`);
  }

// this why I don't really like react
  const [, setState] = useState<{}>({});

  useEffect(() => {
    
    // this implementation is slow as f**
    const unsubs = Object.entries(store.state).map(([, sig]) => {
      return sig.subscribe(() => setState({}))
    })
    
    return () => {
      unsubs.forEach(s => s())
    }
  }, []);

  return store;
}

/**
 * Helper function to get the store based on storeNameOrStore parameter.
 * @param {string | Store} storeNameOrStore - The name of the store or the store instance.
 * @returns {Store} The store.
 * @throws {Error} If the store is not found.
 */
function getStore<S>(storeNameOrStore: string | Store<S>): Store<S> {
  let store: Store<S>;
  if (typeof storeNameOrStore === "string") {
    const _store = StoreMap.get(storeNameOrStore);
    if (!_store) {
    throw new Error(`Store not found. Make sure to define it using 'defineStore("${storeNameOrStore}", definitions)'.`);
  }
    store = _store
  } else if (storeNameOrStore instanceof Store) {
    store = storeNameOrStore;
  } else {
    throw new Error("Invalid argument. Provide a store name (string) or a store instance.");
  }
  if (!store) {
    throw new Error(`Store not found. Make sure to define it using 'defineStore("${storeNameOrStore}", definitions)'.`);
  }
  return store;
}

/**
 * Hook to access actions from a store. Data flows from the store to the component.
 * @param {string | Store} storeNameOrStore - The name of the store or the store instance.
 * @throws {Error} If the store is not found.
 * @returns {Actions} The actions.
 */
export function useStoreActions<S>(storeNameOrStore: string | Store<S>): ActionSignals {
  const store = getStore(storeNameOrStore);
  return store.getActions();
}

/**
 * Access a store's internal signal.
 * @param {string | Store} storeNameOrStore - The name of the store or the store instance.
 * @throws {Error} If the store is not found.
 * @returns {SignalState} The state signal.
 */
export function useStoreSignal<S>(storeNameOrStore: string | Store<S>): SignalState<S> {
  const store = getStore(storeNameOrStore);
  return store.getSignal();
}

/**
 * Hook to access getters from a store. Data flows from the store to the component.
 * @param {string | Store} storeNameOrStore - The name of the store or the store instance.
 * @throws {Error} If the store is not found.
 * @returns {GettersSignal} The getters.
 */
export function useStoreGetters<S>(storeNameOrStore: string | Store<S>): GettersSignal {
  const store = getStore(storeNameOrStore);
  return store.getGetters();
}

/**
 * 
 * Access computed properties from a store. Data flows from the store to the component.
 * @param {string | Store} storeNameOrStore - The name of the store or the store instance.
 * @throws {Error} If the store is not found.
 * @returns {ComputedSignals<State>} The computed properties.
 */
export function useStoreComputed<S>(storeNameOrStore: string | Store<S>): ComputedSignals<State<S>> {
  const store = getStore(storeNameOrStore);
  return store.getComputed();
}


/**
 * Use a signal as a single source of truth in your Components to create a truly shareable state.
 * @param sig - The Signal you want to interact with.
 * @throws Error if a non-Signal value is provided.
 * @returns An array containing the current value of the Signal and a function to modify it.
 */
export function useSignal<T extends Signal<T>>(sig: Signal<T>) {
  // Check if a Signal instance is provided
  if (!(sig instanceof Signal)) {
    throw new Error("To use 'useSignal', you must provide a Signal as a value.");
  }
  
  // Store the signal in a ref;
  const signalRef = useRef(sig)

  // Get a reactive version of the Signal value
  const reactiveSignal = useReactive<T>(signalRef.current.value);
  
  useEffect(() => {
    return signalRef.current.subscribe((newValue) => {
      reactiveSignal.value = newValue;
    })
  }, []);

  // Return the current value and a function to modify it
  return [
    reactiveSignal.value,
    (newState: ((prev: T) => T) | T): void => {
      batch(() => {
        // Update the Signal's value based on the provided newState
        if (typeof newState === "function") {
          signalRef.current.value = newState(reactiveSignal.value);
          return;
        }
        signalRef.current.value = newState;
      });
    },
  ];
}

/**
 * Hook to get the current value of a Signal.
 * @param sig - The Signal to get the value from.
 * @returns The current value of the Signal.
 */
export function useSignalValue<T extends Signal<T>>(sig: Signal<T>) {
  return useSignal(sig)[0];
}

/**
 * Returns a setter function for a particular signal.
 * @param sig - The Signal to perform actions on.
 * @returns A function to modify the Signal's value.
 */
export function useSignalAction<T extends Signal<T>>(sig: Signal<T>) {
  return useSignal(sig)[1];
}

/**
 * Create a computed Signal based on a callback function.
 *
 * @template T - The type of Signal.
 * @param {() => T} callback - The callback function to compute the new Signal value.
 * @returns {() => Signal<T>} A function that returns the computed Signal.
 */
export function $computed<T>(signal: Signal<T>,callback: (value: T) => T) {
  return useMemo(() => computed(() => {
    return callback(signal.value)
  }).value, [callback])
}


/**
 * Watches changes in a Signal and invokes a callback function when the Signal's value changes.
 *
 * @param {Signal<T>} sig - The Signal to watch for changes.
 * @param {(newValue: T) => void | (() => void)} callback - The callback function to invoke when the Signal changes.
 * @param {boolean} [shouldNotUnmount=false] - Set to true if you want to keep watching even after unmounting the component.
 */
export function $watch<T extends Signal<T>>(sig: Signal<T>, callback: (newValue: T) => void | (() => void), shouldNotUnmount: boolean = false) {
  useEffect(() => {
    // Subscribe to the Signal and store the unsubscribe function
    const unsubscribe = sig.subscribe(callback);
    
    // If shouldNotUnmount is false, return the unsubscribe function to clean up on unmount
    if (!shouldNotUnmount) {
      return unsubscribe;
    }
  }, [sig.value]); // Re-run the effect when the Signal's value changes
}

/**
 * Runs a callback function when a signal value changes.
 * @param {() => (void | (() => void))} cb - The callback function to run.
 * @returns {void} Nothing.
 */
export function $effect(cb: () => (undefined | (() => void))): void {
  return useEffect(() => {
    let unsubscribe: undefined | (() => void);
    effect(() => unsubscribe = cb());
    
    // there's a problem with this implementation unsubscribe might be called twice
    // one from signal.effect and the other by useEffect 
    if (unsubscribe && typeof unsubscribe === "function") {
      return () => {
        unsubscribe?.()
      };
    }
  }, [])
}

/**
 * Hook for creating a signal within a component. Handles automatic cleanup.
 * @template T
 * @param value - Initial value of the signal
 * @returns {Signal<T>} - instance of a Signal.
 */
export function $signal<T>(value: T) {
  const signalRef = useRef(signal<T>(value))
  const rxSignal = useReactive(signalRef.current.value)
  
  useEffect(() => {
    return signalRef.current.subscribe((newValue) => {
      rxSignal.value = newValue;
    })
  }, []);
  
  
  return signalRef.current;
}

export {
  Store,
  Definitions
}

export * from "./signals.js"