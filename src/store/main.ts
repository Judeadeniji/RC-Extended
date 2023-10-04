import { signal, effect, computed, batch, Signal } from "./signals.js";

import { State, Actions, Computed, Effects, Getters, ComputedSignals, ActionSignals, GettersSignal, CentralizedState, SignalState, EffectSignals, Definitions } from "./types.js"
import { useStore } from "./hooks.js";

/**
 * Create a map to store instances of the Store class.
 * @type {Map<string, Store<any>>}
 */
export const StoreMap = new Map<string, Store>();

/**
 * Type representing the StoreMap.
 * @typedef {typeof StoreMap} StoreMapType
 */
export type StoreMapType = typeof StoreMap;

/**
 * Centralize state properties into a single object.
 * @param {SignalState} states - State properties.
 * @returns {CentralizedState} - Centralized state object.
 */
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

/**
 * Wrap state properties as signals.
 * @param {State} state - The state properties.
 * @returns {SignalState} - An object with each item [key, signal(value)] as signals.
 */
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

/**
 * Wrap computed properties and their dependencies.
 * @param {Computed} computedObj - Computed properties.
 * @param {CentralizedState} state - The centralized state.
 * @returns {ComputedSignals<T | State>} - Computed signals.
 */
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

/**
 * Wrap effects with dependencies.
 * @param {Effects} effs - Effects.
 * @param {Store} store - The store.
 * @returns {EffectSignals} - Effects.
 */
function wrapEffects(effs: Effects, store: Store): EffectSignals {
  const effects: EffectSignals = {};

  /**
   * Get the dependent state value if it exists.
   * @param {string} key - The key.
   * @param {any} state - The state object.
   * @returns {any} - The state value or undefined.
   */
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

/**
 * Wrap actions with a batch function.
 * @param {Actions} actions - Actions.
 * @param {Store} store - The store.
 * @returns {ActionSignals} - Action signals.
 */
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

/**
 * Update the state properties with new values.
 * @param {CentralizedState<CS>} oldState - The old state.
 * @param {State<CS>} newState - The new state.
 * @returns {CentralizedState<CS>} - The updated state.
 */
function updateState(oldState: CentralizedState, newState: State) {

  for (const [key, value] of Object.entries(newState)) {
    if (value != oldState[key]) {
      oldState[key] = newState[key]
    }
  }
  
  return oldState;
}

/**
 * Wrap getters with batch function and provide access to other store properties.
 * @param {Getters} getters - Getters.
 * @param {Store} store - The store.
 * @returns {GettersSignal} - Getters signals.
 */
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

/**
 * Subscribe type for signals and effects.
 * @typedef {keyof EffectSignals & keyof SignalState} Subscribe
 */
 type Subscribe<Type> = keyof EffectSignals & keyof SignalState<Type>;

/**
 * Store class for managing state, actions, computed properties, effects, and getters.
 * @class
 * @template S - The type of state managed by the store.
 */
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

  /**
   * Creates a new Store instance.
   * @constructor
   * @param {string} storeName - The name of the store.
   * @param {Definitions} definitions - Definitions for the store.
   */
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

  /**
   * Get the store's name.
   * @returns {string} - The store name.
   */
  get name() {
    return this.storeName;
  }

  /**
   * Gets the state signal.
   * @param {string} key - The name of the state.
   * @returns {Signal} - The state signal.
   */
  getSignal(key: string): Signal {
    return this.signal(key);
  }

  /**
   * Gets the actions.
   * @returns {ActionSignals} - The actions.
   */
  getActions() {
    return this.actions;
  }

  /**
   * Gets the computed properties.
   * @returns {ComputedSignals<State>} - The computed properties.
   */
  getComputed() {
    return this.computed;
  }

  /**
   * Dispose All Effects.
   * @returns {void}
   */
  disposeEffects() {
    for (const key in this.effects) {
      const dispose = this.effects[key];
      dispose();
    }
  }

  /**
   * Disposes a single effect.
   * @param {keyof EffectSignals} key - The name of the effect fn.
   * @returns {void}
   */
  disposeEffect<Key extends keyof EffectSignals>(key: Key) {
    this.effects[key]()
  }

  /**
   * Gets the getters.
   * @returns {Getters} - The getters.
   */
  getGetters() {
    return this.getters;
  }

  /**
   * Subscribe to a state signal or effect.
   * @param {Subscribe} key - The key to subscribe to.
   * @param {(newState: S) => void} listener - The listener function.
   * @returns {() => void} - A function to unsubscribe.
   */
  subscribe<Key extends string>(key: Key, listener: (newState: State[Key]) => void) {
   const unsubscribe = this.state[key].subscribe(listener);
   
   return () => {
     unsubscribe?.();
     this.disposeEffect(key)
   };
  }
}

/**
 * Defines a new store.
 * @template S
 * @template Name
 * @param {Name} storeName - The name of the store.
 * @param {Definitions} definitions - Definitions for the store.
 * @throws {Error} - If a store with the same name already exists.
 * @returns {() => Store} - A function to create and access the store.
 */
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

/**
 * Create a derived store based on the parent store and a function to derive state.
 * @template S - The type of state managed by the store.
 * @param {Store} store - The parent store.
 * @param {(parentState: State) => State} fn - The function to derive state.
 * @returns {{value: CentralizedState, subscribe: () => void}} - The derived store object.
 */
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

/**
 * Create a readonly view of a store.
 * @template S - The type of state managed by the store.
 * @param {Store} store - The store.
 * @returns {{value: Record<string, any>, subscribe: (cb: (key: keyof typeof store.state, newValue: S) => void) => () => void}} - Readonly store object.
 */
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

/**
 * Export the Store and Definitions classes.
 */
export {
  Store,
  Definitions
}
