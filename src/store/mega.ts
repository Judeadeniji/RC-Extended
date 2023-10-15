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
type Actions = Record<string, (...args: any[]) => void>;
type Computed = Record<string, (state: any) => any>;
type Effects = Record<string, (() => () => void)>;
type ComputedSignals = Record<string, () => any>;
type EffectSignals = Record<string, () => void>;
type ActionSignals = Record<string, (...args: any[]) => void>;
type WrappedState<T> = Record<string, Signal<T>>;
type CentralizedState = Record<string, any>
type Unsubscribe = (() => void) | void

interface Definitions {
  state: () => State;
  actions?: Actions;
  computed?: Computed;
  effects?: Effects;
}

type MapKeysUnion<T extends Record<string, any>> = T extends Map<infer K, any> ? K : never;

export const StoreMap = new Map<string, StoreType | Store | unknown>();

type StoreMapKeys = MapKeysUnion<typeof StoreMap>

type StoreType = CentralizedState & Actions & ComputedSignals
;

function noop(): any {}

function centralizeState<S>(states: SignalState<S>, subscriber: Function): CentralizedState {
  const merged: CentralizedState = {}
  for (const key in states) {
    const state = states[key]
    Object.defineProperty(merged, key, {
      get() {
        return state.value
      },
      set(value) {
        subscriber(key, state.peek(), value)
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
    if (key in state) {
      const element = computed(() => computedObj[key].call(state[key], state[key]));

     // wrappedComputed["$"+key] = () => element.value as T;
      
      Object.defineProperty(wrappedComputed, `$${key}`, {
        get() {
          return element.value as T
        }
      }) 
    } else {
      const element = computed(() => computedObj[key].call(state, state))
      Object.defineProperty(wrappedComputed, key, {
        get() {
          return element.value as T
        }
      })
      //wrappedComputed[key] = () => element.value
    }
  }

  return wrappedComputed;
}

function wrapEffects(effs: Effects, store: Store): EffectSignals {
  const effects: EffectSignals = {};

  for (const key in effs) {
    if (effs.hasOwnProperty(key)) {
      const disposeFn = effect(() => {
        return effs[key].call(store.state);
      });

      effects[key] = disposeFn;
    }
  }

  return effects;
}

function wrapActions(actions: Actions, state: typeof Store.prototype.state, subscriber: Function): ActionSignals {
  const acs: ActionSignals = {};

  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      const element = actions[action];

      acs[action] = (...args: any[]) => {
        const { onErrorCb, afterCb } = subscriber != noop ? subscriber(action, args) : { onErrorCb: noop, afterCb: noop }
        return batch<any>(() => {
          try {
            const newState: any | Promise<any> = element.call(state, state, ...args);
            if (newState instanceof Promise) {
              newState.then(afterCb).catch(onErrorCb).finally(noop);
            } else {
              afterCb(newState)
            }
          } catch (error: unknown) {
            onErrorCb(error as Error)
          }
        });
      };
    }
  }

  return acs;
}

 interface ActionEventCallbackParam {
   name: string;
   args: Array<any>;
   after: (cb: (result: any) => any) => void;
   onError: (cb: () => any) => void;
   storeInstance: Store;
 }

 type ActionEventCallback = (params: ActionEventCallbackParam) => void;
 
 interface StateEventCallbackParam<StateType> {
   name: string;
   current: StateType;
   next: StateType;
   storeInstance: Store;
 }

 type StateEventCallback<StateType> = (params: StateEventCallbackParam<StateType>) => void;
 
class Store {
  readonly _state: State;
  readonly signalState: SignalState<any>;
  private readonly defs: Definitions
  private readonly effects: EffectSignals;
  readonly state: CentralizedState;
  readonly actions: ActionSignals;
  readonly computed: ComputedSignals;
  private onActionCb: ((key: string, args: any[]) => {
    onErrorCb: (error: Error | unknown ) => void;
    afterCb: (results: any) => void
  });
  private onStateCb: (name: string, current: any, next: any) => any;

  constructor(private readonly storeName: string, definitions: Definitions) {
    this.onActionCb = noop;
    this.onStateCb = noop;
    this.defs = definitions;
    this._state = this.defs.state();
    this.signalState = wrapState(this._state);
    this.state = centralizeState<any>(this.signalState, this.onStateCb);
    this.actions = wrapActions(this.defs.actions || {}, this.state, this.onActionCb);
    this.computed = wrapComputed(this.defs.computed || {}, this.state);
    this.effects = wrapEffects(this.defs.effects || {}, this);
  }

  get name() {
    return this.storeName;
  }

  onAction(callback: ActionEventCallback) {
    const instance = this;
    instance.onActionCb = (key: string, args: any[]) => {
      let onErrorCb: (error: Error | unknown ) => void = noop;
      let afterCb: (results: any) => void = noop;
      
      function onError(callback: (error: Error | unknown ) => void) {
        onErrorCb = callback
      }
      
      function after(callback: (results: any) => void) {
        afterCb = callback
      }
      
      callback.call(instance, {
        storeInstance: instance,
        name: key,
        onError,
        after,
        args,
      })
      
      return {
        onErrorCb,
        afterCb
      }
    }
    
    return function unsubscribe() {
      instance.onActionCb = noop
    }
    // To be continued...
  }

  onState<StateType = any>(callback: StateEventCallback<StateType>) {
    const instance = this;
    
    instance.onStateCb = (name: string, current: StateType, next: StateType) => {
      callback.call(instance, { name, current, next, storeInstance: instance })
    }
    
    return function unsubscribe() {
      instance.onStateCb = noop
    }
  }

  disposeEffects() {
    for (const key in (this?.effects || {})) {
      this.disposeEffect(key);
    }
  }

  disposeEffect<Key extends keyof EffectSignals>(key: Key) {
    this.effects[key]?.()
  }

  subscribe<Key extends string>(this: Store, key: Key, listener: (newState: State[Key]) => void) {
   const store = this;
   const unsubscribe = store.signalState[key].subscribe(function (newState) {
     store._state[key] = newState;
     listener(newState)
   });
   
   return () => {
     unsubscribe?.();
     store.disposeEffect(key)
   };
  }
}

export function defineStore(storeName: string, definitions: Definitions): () => StoreType {
  if (typeof storeName !== "string") {
    throw new Error ("Store Name Must be a string")
  }
  
  if (StoreMap.has(storeName)) {
    throw new Error(`Store with name "${storeName}" already exists. Use 'useStore("${storeName}")' to access it.`);
  }

  const store = new Proxy(new Store(storeName, definitions), {
    get(target: Store, key: keyof Store) {
      
    type Provider = {
      subscribe: typeof target.subscribe,
    } & { [key: string]: any }
  
      const provider: Provider = {
        onAction: target.onAction,
        subscribe: target.subscribe,
      };
     
      if (key in provider) {
        return provider[key];
      } else if (key in target.state) {
        return target.state[key]
      } else if (key in target.computed) {
        return target.computed[key]
      } else if (key in target.actions) {
        return target.actions[key]
      } else if (key in target) {
        return target[key]
      } else {
        target.disposeEffects()
        throw new Error(`Property '${key}' not found in store '${storeName}', This might be a bug in RC-Extended.`);
      }
    },
    // set() {
    //   return false;
    // }
  }) as unknown;

  StoreMap.set(storeName, store as StoreType);

  return () => useStore(storeName);
}


export function derived(store: Store, fn: (parentState: State) => State) {
  const state = () => fn({ ...store.
  state})
  const derivedStore = new Store(store.name, { state });
  
  let unsubscribers: (() => void)[] = [];
  
  function subscribe() {
    unsubscribers = Object.keys(derivedStore._state).map(key => {
      return store.subscribe(key, (newState) => {
        const newDerivedState = fn({
          ...store.state,
          [key]: newState
        });
        for (const key in newDerivedState) {
          if (Object.prototype.hasOwnProperty.call(newDerivedState, key)) {
            const element = newDerivedState[key];
            
            if (key in derivedStore.state && (element != derivedStore.state[key])) {
              derivedStore.state[key] = element;
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
      return derivedStore.state
    },
    subscribe
  }
}

export function readonly(store: Store) {
  return {
    get value() {
      const cs: CentralizedState = store.state;
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

var StoreProvider: Context<StoreType | undefined>;

export function useStore(storeName: string) {
  const store = StoreMap.get(storeName);

  if (store === undefined) {
    throw new Error(`Store "${storeName}" not found. Make sure to define it using 'defineStore("${storeName}", definitions)'.`);
  }

// this why I don't really like react
  const [, setState] = useState<{}>({});

  useEffect(() => {
    let unsubscribers: (() => void)[] = [];
  
    function subscribe() {
      unsubscribers = Object.keys(store?._state).map(key => {
        return store?.subscribe(key, () => setState({}))
      })
      
      return function unsubscribe() {
        unsubscribers.forEach(fn => fn())
      }
    }
    
    return subscribe()
  }, [])
 
  return store;
}


export function useStoreActions(storeNameOrStore: string | StoreType): ActionSignals {
  const store = getStore(storeNameOrStore);
  return store.actions;
}

export function useStoreComputed(storeNameOrStore: string | StoreType) {
  const store = getStore(storeNameOrStore);
  return store.computed;
}


export function useSignal<T>(sig: Signal<T>): [T, (newState: ((prev: T) => T) | T) => void] {
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
        if (newState instanceof Function) {
          signalRef.current.value = newState(reactiveSignal.value);
          return;
        }
        signalRef.current.value = newState;
      });
    },
  ];
}

export function useSignalValue<T>(sig: Signal<T>): T {
  return useSignal(sig)[0] as T;
}

export function useSignalAction<T>(sig: Signal<T>) {
  return useSignal(sig)[1];
}

export function $computed<T>(callback: () => T) {
  return useMemo(() => computed(callback).value, [callback])
}

export function $watch<T>(sig: Signal<T>, callback: (newValue: T) => void | (() => void), shouldNotUnmount: boolean = false) {
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

StoreProvider = createContext<StoreType | undefined>(undefined);

interface ProviderProps {
  children: ReactElement<any, any>;
};

export function createProvider(_store: string | StoreType) {
  const store = getStore(_store);
  
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
      let unsubscribers: (() => void)[] = [];
    
      function subscribe() {
        unsubscribers = Object.keys(store._state).map(key => {
          return store.subscribe(key, () => setState({}))
        })
        
        return function unsubscribe() {
          unsubscribers.forEach(fn => fn())
        }
      }
      
      return subscribe()
    }, [])
  
  return actions;
}

export function getState() {
  const store = getStoreContext("getState()");
  
  const state = store.state;
  
  return state;
}

export function getSingleState(stateName: string) {
  const store = getStoreContext(`getSingleState(${stateName})`);
  
  const state = store.state[stateName];
  
  return state;
}

export function getStore(storeNameOrStore: string | StoreType): StoreType {
  let store: StoreType;
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
  Definitions,
}
