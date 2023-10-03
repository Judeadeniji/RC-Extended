import { signal, effect, computed, batch, Signal } from "./signals.js";

import { State, Actions, Computed, Effects, Getters, ComputedSignals, ActionSignals, GettersSignal, /*WrappedState,*/ CentralizedState, SignalState, EffectSignals, Definitions } from "./types.js"
import { useStore } from "./hooks.js";

// find a way to fix this type `any`
export const StoreMap = new Map<string, Store<any>>();


function centralizeState<S>(states: SignalState<S>) {
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
  const wrappedState: SignalState<S> = {};
  
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
function wrapComputed<S, T>(computedObj: Computed<S>, state: CentralizedState<S>): ComputedSignals<T | State<S>> {
  const wrappedComputed: ComputedSignals<T | State<S>> = {};

  for (const key in computedObj) {
    if (computedObj.hasOwnProperty(key)) {
      const element = computed(() => computedObj[key](state[key]));

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
  function getDependent(key: string, state: any) {
    const s = state[key]
    if (!s && s == null || !s && s == undefined) {
      return s;
    }
    
    
    // state > undefined;
    return s || undefined;
  }

  for (const key in effs) {
    if (effs.hasOwnProperty(key)) {
      const shouldDepend = key in store.centralState || key in store.computed;
      const element = effect(() => effs[key](shouldDepend ? getDependent(key, store.centralState) :  undefined));

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

/**
 * Store class for managing state, actions, computed properties, effects, and getters.
 */
class Store<S> {
  readonly signal: (key: string) => Signal<S>;
  public _state: State<S>;
  public state: SignalState<S>;
  readonly defs: Definitions<S>
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
    this.defs = definitions;
    this._state = this.defs.state();
    this.state = wrapState(this._state);
    this.centralState = centralizeState(this.state);
    this.signal = (key: string) => this.state[key];
    this.actions = wrapActions(this.defs.actions || {}, this);
    // this.actions = wrapActions(definitions.actions || {}, this.signal);
    this.computed = wrapComputed(this.defs.computed || {}, this.centralState);
    this.effects = wrapEffects(this.defs.effects || {}, this);
    this.getters = wrapGetters(this.defs.getters || {}, this);
  }
  
  get name() {
    return this.storeName;
  }

  /**
   * Gets the state signal.
   * @param {string} key - The name of the state 
   * @returns The state signal.
   */
  getSignal(key: string): Signal<S> {
    return this.signal(key);
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
  
  subscribe(key: string, listener: (newState: S) => void) {
   const unsubscribe = this.state[key].subscribe(listener);
   
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
        subscribe: target.subscribe,
      };
      
      for(const key in target.state) {
        provider[key] = target.centralState[key]
      }

      if (key in provider) {
        return provider[key];
      } else if (key === "state" || key === "_state" || key === "defs" || key === "name" || key === "signal" || key === "centralState") {
        return target[key]
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

export function derived<S>(store: Store<S>, fn: (parentState: State<S>) => State<S>) {
  const state = () => fn({ ...store.centralState })
  const derivedStore = new Store<S>(store.name, { state });
  
  let unsubscribers: any[] = [];
  
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

export {
  Store,
  Definitions
}