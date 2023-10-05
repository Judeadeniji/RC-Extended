import { Signal, batch, signal, effect, computed } from "./signals.js"
import { ReactElement, createElement, useState , useEffect, useRef, useMemo, createContext, useContext, Context } from "react";
import useReactive from "../hooks/reactive.js"

// types.ts
interface State {
  [key: string]: any
};
type SignalState<S> = {
  [key: string]: Signal<S>
};
type Getters = Record<string, (state: State) => any>;
type Actions = Record<string, (...args: any[]) => State>;
type Computed = Record<string, (state: any) => any>;
type Effects = Record<string, ((state: State) => () => void)>;
type ComputedSignals = Record<string, () => any>;
type EffectSignals = Record<string, () => void>;
type ActionSignals = Record<string, (...args: any[]) => typeof batch>;
type GettersSignal = Record<string, (...args: any[]) => typeof batch>;
type WrappedState = Record<string, Signal>;
type CentralizedState = Record<string, any>
type Unsubscribe = (() => void) | void

interface Definitions {
  state: () => State;
  actions?: Actions;
  computed?: Computed;
  effects?: Effects;
  getters?: Getters;
}


export const StoreMap = new Map<string, Store>();


type StoreMapType = typeof StoreMap;


function centralizeState<S>(states: SignalState<S>) {
  const merged = {}
  for (const key in states) {
    const state = states[key]
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

function wrapState(state: State) {
  const wrappedState: {
    [key: string]: Signal<State[typeof key]>
  } = {};

  for (const key in state) {
    const element = state[key]
    wrappedState[key] = signal(element)
  }

  return wrappedState;
}

function wrapComputed<T>(computedObj: Computed, state: CentralizedState) {
  const wrappedComputed: ComputedSignals = {};

  for (const key in computedObj) {
    if (computedObj.hasOwnProperty(key)) {
      const element = computed(() => computedObj[key](state[key]));

      wrappedComputed[key] = () => element.value as T;
    }
  }

  return wrappedComputed;
}

function wrapEffects(effs: Effects, store: Store): EffectSignals {
  const effects: EffectSignals = {};

  function getDependent(key: string, state: any) {
    const s = state[key]
    if (!s && s == null || !s && s == undefined) {
      return s;
    }

    return s || undefined;
  }

  for (const key in effs) {
    if (effs.hasOwnProperty(key)) {
      const shouldDepend = key in store.centralState || key in store.computed;
      const disposeFn = effect(() => effs[key](shouldDepend ? getDependent(key, store.centralState) :  undefined));

      effects[key] = disposeFn;
    }
  }

  return effects;
}

function wrapActions(actions: Actions, store: Store): ActionSignals {
  const acs: ActionSignals = {};
  const cs: CentralizedState = store.centralState

  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      const element = actions[action];

      acs[action] = (...args: any[]) => {
        return batch<any>(() => {
          const newState = element(cs, ...args);
          if (newState instanceof Promise) {
            newState.then((r) => updateState(cs, r))
            return cs;
          }
          return updateState(cs, newState)
        });
      };
    }
  }

  return acs;
}

function updateState(oldState: CentralizedState, newState: State) {

  for (const [key, value] of Object.entries(newState)) {
    if (value != oldState[key]) {
      oldState[key] = newState[key]
    }
  }
  
  return oldState;
}

function wrapGetters(getters: Getters, store: Store): GettersSignal {
  const gtrrs: GettersSignal = {};

  for (const key in getters) {
    if (getters.hasOwnProperty(key)) {
      const element = getters[key];

      gtrrs[key] = () => {
        return batch<any>(() => {
          const provider: Record<string, any> = {
            ...store.centralState,
            ...store.actions,
            ...store.computed,
            getSignal: store.getSignal,
            getActions: store.getActions,
            getComputed: store.getComputed
          };
          const newState = element(provider);
          return newState;
        });
      };
    }
  }

  return gtrrs;
}

 type Subscribe<Type> = keyof EffectSignals & keyof SignalState<Type>;

class Store {
  readonly signal: (key: string) => Signal;
  public _state: State;
  public state;
  readonly defs: Definitions
  readonly centralState: CentralizedState;
  readonly actions: ActionSignals;
  readonly getters: Getters;
  readonly effects: EffectSignals;
  readonly computed: ComputedSignals;

  constructor(private readonly storeName: string, definitions: Definitions) {
    this.defs = definitions;
    this._state = this.defs.state();
    this.state = wrapState(this._state);
    this.centralState = centralizeState(this.state);
    this.signal = (key: string) => this.state[key];
    this.actions = wrapActions(this.defs.actions || {}, this);
    this.computed = wrapComputed(this.defs.computed || {}, this.centralState);
    this.effects = wrapEffects(this.defs.effects || {}, this);
    this.getters = wrapGetters(this.defs.getters || {}, this);
  }

 
  get name() {
    return this.storeName;
  }

  getSignal(key: string): Signal {
    return this.signal(key);
  }

  getActions() {
    return this.actions;
  }

  getComputed() {
    return this.computed;
  }

  disposeEffects() {
    for (const key in this.effects) {
      const dispose = this.effects[key];
      dispose();
    }
  }

  disposeEffect<Key extends keyof EffectSignals>(key: Key) {
    this.effects[key]()
  }

  getGetters() {
    return this.getters;
  }

  subscribe<Key extends string>(key: Key, listener: (newState: State[Key]) => void) {
   const unsubscribe = this.state[key].subscribe(listener);
   
   return () => {
     unsubscribe?.();
     this.disposeEffect(key)
   };
  }
}

export function defineStore(storeName: string, definitions: Definitions): () => Store {
  if (typeof storeName !== "string") {
    throw new Error ("Store Name Must be a string")
  }
  
  if (StoreMap.has(storeName)) {
    throw new Error(`Store with name "${storeName}" already exists. Use 'useStore("${storeName}")' to access it.`);
  }

  
  const store = new Proxy(new Store(storeName, definitions), {
    get(target: Store, key: keyof Store) {
      
    type Provider = {
      getSignal: typeof target.getSignal,
      getActions: typeof target.getActions,
      getComputed: typeof target.getComputed,
      getGetters: typeof target.getGetters,
      subscribe: typeof target.subscribe,
    }
  
      const provider: Provider & Record<string, any> = {
        ...target.actions,
        ...target.computed,
        ...target.getters,
        getSignal: target.getSignal,
        getActions: target.getActions,
        getComputed: target.getComputed,
        getGetters: target.getGetters,
        subscribe: target.subscribe,
      };
      
      for(const key in target.state) {
        provider[key] = target.centralState[key]
      }

      if (key in provider) {
        return provider[key];
      } else if (key === "state" || key === "_state" || key === "defs" || key === "name" || key === "signal" || key === "centralState" || key === "actions" || key === "getters") {
        return target[key as keyof Store]
      } else {
        target.disposeEffects()
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


export function derived(store: Store, fn: (parentState: State) => State) {
  const state = () => fn({ ...store.centralState })
  const derivedStore = new Store(store.name, { state });
  
  let unsubscribers: (() => void)[] = [];
  
  function subscribe() {
    unsubscribers = Object.keys(derivedStore._state).map(key => {
      return store.subscribe(key, (newState) => {
        const newDerivedState = fn({
          ...store.centralState,
          [key]: newState
        });
        for (const key in newDerivedState) {
          if (Object.prototype.hasOwnProperty.call(newDerivedState, key)) {
            const element = newDerivedState[key];
            
            if (key in derivedStore.centralState && (element != derivedStore.centralState[key])) {
              derivedStore.centralState[key] = element;
            }
          }
        }
      })
    })
    
    return function unsubscribe() {
      unsubscribers.forEach(fn => fn())
    }
  }
  
  return  {
    get value() {
      return derivedStore.centralState
    },
    subscribe
  }
}

export function readonly(store: Store) {
  return {
    get value() {
      const cs: CentralizedState = store.centralState;
      type Cs = typeof cs
      return new Proxy(cs, {
        get<Key extends keyof Cs>(target: Cs, key: Key): Cs[Key] {
          return target[key]
        },
        set(): false {
          return false
        }
      })
    },
    subscribe<Key extends keyof typeof store.state>(cb: (key: Key, newValue: State[Key]) => void) {
      const fns = Object.entries(store.state).map(([key, signal]: [key: string, signal: Signal]) => {
        return signal.subscribe((newValue) => cb(key as Key, newValue))
      })
      
      return () => fns.forEach(f => f())
    }
  }
}

// hooks.ts

// another `any` to change 
var StoreProvider: Context<Store | undefined>;

export function useStore(storeName: string): Store {
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


export function useStoreActions(storeNameOrStore: string | Store): ActionSignals {
  const store = getStore(storeNameOrStore);
  return store.getActions();
}

export function useStoreGetters(storeNameOrStore: string | Store): GettersSignal {
  const store = getStore(storeNameOrStore);
  return store.getGetters();
}


export function useStoreComputed(storeNameOrStore: string | Store) {
  const store = getStore(storeNameOrStore);
  return store.getComputed();
}


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

export function useSignalValue<T extends Signal<T>>(sig: Signal<T>) {
  return useSignal(sig)[0];
}

export function useSignalAction<T extends Signal<T>>(sig: Signal<T>) {
  return useSignal(sig)[1];
}

export function $computed<T>(signal: Signal<T>,callback: (value: T) => T) {
  return useMemo(() => computed(() => {
    return callback(signal.value)
  }).value, [callback])
}



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

export function $derived(store: Store, fn: (parentState: State) => State) {
  const dy = useRef(derived(store, fn)).current
  
  $effect(() => {
    return dy.subscribe();
  })
  
  return {
    get value() { return dy.value }
  }
}

StoreProvider = (() => createContext<Store | undefined>(undefined))();

interface ProviderProps {
  children: ReactElement<any, any>;
};

export function createProvider(_store: string | Store) {
  const store: Store = getStore(_store);
  
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

export function getActions() {
  const store = getStoreContext("getActions()");
  
  const actions = store.actions;
  
  // this why I don't really like react
    const [, setState] = useState<{}>({});
  
    useEffect(() => {
      
      // this implementation is slow as f**
      const unsubs = Object.entries(store.state).map(([, sig]: [key:string, sig: Signal]) => {
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

export function noop() {}

export function getStore(storeNameOrStore: string | Store): Store {
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


export {
  Store,
  Definitions
}
