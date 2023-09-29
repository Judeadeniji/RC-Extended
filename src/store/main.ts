import { useState, useEffect, useMemo, useRef } from "react";
import { signal, effect, computed, batch, Signal } from "./signals.js";
import useReactive from "../hooks/reactive"

const StoreMap = new Map<string, Store>();

export type State = Record<string, any>;
type SignalState = Signal<State>;
type Getters = Record<string, (state: State) => any>;
type Actions = Record<string, (...args: any[]) => State>;
type Computed = Record<string, (state: State) => any>;
type Effects = Record<string, ((state: State) => unknown | (() => unknown))>;
type ComputedSignals<T> = Record<string, () => T>;
type EffectSignals = Record<string, () => void>;
type ActionSignals = Record<string, (...args: any[]) => typeof batch>;
type GettersSignal = Record<string, (...args: any[]) => typeof batch>;

/**
 * Definitions for creating a store.
 */
interface Definitions {
  state: () => State;
  actions?: Actions;
  computed?: Computed;
  effects?: Effects;
  getters?: Getters;
}

/**
 * Wraps computed properties.
 * @param computedObj - The computed properties.
 * @param state - The state signal.
 * @returns Computed signals.
 */
function wrapComputed<T>(computedObj: Computed, state: SignalState): ComputedSignals<T | State> {
  const computedSignals: ComputedSignals<T | State> = {};

  for (const key in computedObj) {
    if (computedObj.hasOwnProperty(key)) {
      const element = computed(() => computedObj[key](state.value));

      computedSignals[key] = () => element.value as T;
    }
  }

  return computedSignals;
}

/**
 * Wraps effects.
 * @param effs - The effects.
 * @param store - The store.
 * @returns Effects.
 */
function wrapEffects(effs: Effects, store: Store): EffectSignals {
  const effects: EffectSignals = {};

  for (const key in effs) {
    if (effs.hasOwnProperty(key)) {
      const shouldDepend = key in store.signal.value || key in store.computed;
      const element = effect(() => effs[key](shouldDepend ? store.signal.value[key] || store.computed[key]() : undefined));

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
function wrapActions(actions: Actions, state: SignalState): ActionSignals {
  const acs: ActionSignals = {};

  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      const element = actions[action];

      acs[action] = (...args: any[]) => {
        return batch<any>(() => {
          const newState = element(state.value, ...args);
          if (newState instanceof Promise) {
            newState.then((r) => state.value = r);
            return state.value;
          }
          return state.value = newState;
        });
      };
    }
  }

  return acs;
}

/**
 * Wraps getters.
 * @param getters - The getters.
 * @param store - The store.
 * @returns Getters signals.
 */
function wrapGetters(getters: Getters, store: Store): GettersSignal {
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
class Store {
  public signal: SignalState;
  readonly actions: Actions;
  readonly getters: Getters;
  readonly effects: EffectSignals;
  readonly computed: ComputedSignals<State>;

  /**
   * Creates a new Store instance.
   * @param definitions - Definitions for the store.
   */
  constructor(private readonly storeName: string, definitions: Definitions) {
    this.signal = signal(definitions.state());
    this.actions = wrapActions(definitions.actions || {}, this.signal);
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
  getSignal(): SignalState {
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
export function defineStore(storeName: string, definitions: Definitions): () => Store {
  if (StoreMap.has(storeName)) {
    throw new Error(`Store with name "${storeName}" already exists. Use 'useStore("${storeName}")' to access it.`);
  }

  const store = new Proxy(new Store(storeName, definitions), {
    get(target: Store, key: string) {
      const provider: Record<string, any> = {
        ...target.signal.value,
        ...target.actions,
        ...target.computed,
        ...target.getters,
        getSignal: target.getSignal,
        getActions: target.getActions,
        getComputed: target.getComputed,
        getGetters: target.getGetters,
      };

      if (key in provider) {
        return provider[key];
      } else {
        throw new Error(`Property '${key}' not found in store '${storeName}'.`);
      }
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
export function useStore(storeName: string): Store {
  const store = StoreMap.get(storeName);

  if (store === undefined) {
    throw new Error(`Store "${storeName}" not found. Make sure to define it using 'defineStore("${storeName}", definitions)'.`);
  }

// this why I don't really like react
  const [, setState] = useState<SignalState>(store.getSignal());

  useEffect(() => store.getSignal().subscribe((newState) => {
    setState(signal(newState));
  }), []);

  return store;
}

/**
 * Helper function to get the store based on storeNameOrStore parameter.
 * @param {string | Store} storeNameOrStore - The name of the store or the store instance.
 * @returns {Store} The store.
 * @throws {Error} If the store is not found.
 */
function getStore(storeNameOrStore: string | Store): Store {
  let store: Store;
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
export function useStoreActions(storeNameOrStore: string | Store): Actions {
  const store = getStore(storeNameOrStore);
  return store.getActions();
}

/**
 * Access a store's internal signal.
 * @param {string | Store} storeNameOrStore - The name of the store or the store instance.
 * @throws {Error} If the store is not found.
 * @returns {SignalState} The state signal.
 */
export function useStoreSignal(storeNameOrStore: string | Store): SignalState {
  const store = getStore(storeNameOrStore);
  return store.getSignal();
}

/**
 * Hook to access getters from a store. Data flows from the store to the component.
 * @param {string | Store} storeNameOrStore - The name of the store or the store instance.
 * @throws {Error} If the store is not found.
 * @returns {GettersSignal} The getters.
 */
export function useStoreGetters(storeNameOrStore: string | Store): GettersSignal {
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
export function useStoreComputed(storeNameOrStore: string | Store): ComputedSignals<State> {
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
export function $effect(cb: () => (void | (() => void))): void {
  return useEffect(() => {
    let unsubscribe;
    effect(() => unsubscribe = cb());
    
    // there's a problem with this implementation unsubscribe might be called twice
    // one from signal.effect and the other by useEffect 
    if (typeof unsubscribe === "function") {
      return () => {
        unsubscribe()
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