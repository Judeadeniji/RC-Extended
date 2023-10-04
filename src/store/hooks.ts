import { ReactElement, createElement, useState , useEffect, useRef, useMemo, createContext, useContext, Context } from "react";
import { Store, StoreMap, derived } from "./main.js";
import useReactive from "../hooks/reactive.js"
import { signal, Signal, batch, effect, computed } from "./signals.js"
import { ActionSignals, /*SignalState,*/ ComputedSignals, GettersSignal, State } from "./types.js";
import { getStore } from "./helpers.js";

// another `any` to change 
var StoreProvider: Context<Store<any> | undefined>;

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
      unsubs.forEach(s => s());
      //dispose all effects
      store.disposeEffects();
    }
  }, []);

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
 *//*
export function useStoreSignal<S>(storeNameOrStore: string | Store<S>): SignalState<S> {
  const store = getStore(storeNameOrStore);
  return store.getSignal();
}*/

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
    const dispose = effect(() => unsubscribe = cb());
    
    // there's a problem with this implementation unsubscribe might be called twice
    // one from signal.effect and the other by useEffect 
    if (unsubscribe && typeof unsubscribe === "function") {
      return () => {
        dispose()
        unsubscribe?.()
      };
    } else {
      return dispose
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

export function $derived<S>(store: Store<S>, fn: (parentState: State<S>) => State<S>) {
  const dy = useRef(derived<S>(store, fn)).current
  
  $effect(() => {
    return dy.subscribe();
  })
  
  return {
    get value() { return dy.value }
  }
}

StoreProvider = (<S>() => createContext<Store<S> | undefined>(undefined))();

interface ProviderProps {
  children: ReactElement<any, any>;
};

export function createProvider<S>(_store: string | Store<S>) {
  const store: Store<S> = getStore(_store);
  
  return function ({ children, ...props }: ProviderProps) {
    
    // we use an useEffect to dispose all effects when the component unmounts
    useEffect(() => {
      return store.disposeEffects
    }, [])
    
    return createElement(StoreProvider.Provider, { ...props, value: store }, children)
  }
}

function getStoreContext(hookName: string) {
  const ctx = useContext(StoreProvider);
  
  if (!ctx) {
    throw new ReferenceError(`You Should only use ${hookName} within a provider. You can create a provider using createProvider(store)`)
  }
  
  return ctx;
}

export function getActions<S>() {
  const store = getStoreContext("getActions()");
  
  const actions = store.actions;
  
  // this why I don't really like react
    const [, setState] = useState<{}>({});
  
    useEffect(() => {
      
      // this implementation is slow as f**
      const unsubs = Object.entries(store.state).map(([, sig]: [key:string, sig: Signal<S>]) => {
        return sig.subscribe(() => {
          setState({})
        })
      })
      return () => {
        unsubs.forEach(s => s())
      }
    }, []);
    
  
  return actions;
}

export function getState() {
  const store = getStoreContext("getState()");
  
  const state = store.centralState;
  
  return state;
}

export function getSingleState(stateName: string) {
  const store = getStoreContext(`getSingleState(${stateName})`);
  
  const state = store.centralState[stateName];
  
  return state;
}

export function getGetters() {
  const store = getStoreContext("getGetters()");
  
  const getters = store.getGetters();
  
  return getters;
}

