"use strict";
import { useState, useEffect, useMemo } from "react";
import { signal, effect, computed, batch, Signal } from "./signals.js";
import useReactive from "../hooks/reactive";
const StoreMap = /* @__PURE__ */ new Map();
function wrapComputed(computedObj, state) {
  const computedSignals = {};
  for (const key in computedObj) {
    if (computedObj.hasOwnProperty(key)) {
      const element = computed(() => computedObj[key](state.value));
      computedSignals[key] = () => element.value;
    }
  }
  return computedSignals;
}
function wrapEffects(effs, store) {
  const effects = {};
  for (const key in effs) {
    if (effs.hasOwnProperty(key)) {
      const shouldDepend = key in store.state.value || key in store.computed;
      const element = effect(() => effs[key](shouldDepend ? store.state.value[key] || store.computed[key]() : void 0));
      effects[key] = element;
    }
  }
  return effects;
}
function wrapActions(actions, state) {
  const acs = {};
  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      const element = actions[action];
      acs[action] = (...args) => {
        return batch(() => {
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
function wrapGetters(getters, store) {
  const gtrrs = {};
  for (const key in getters) {
    if (getters.hasOwnProperty(key)) {
      const element = getters[key];
      gtrrs[key] = () => {
        return batch(() => {
          const provider = {
            ...store.state.value,
            ...store.actions,
            ...store.computed,
            getState: () => store.state,
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
class Store {
  /**
   * Creates a new Store instance.
   * @param definitions - Definitions for the store.
   */
  constructor(definitions) {
    this.state = signal(definitions.state());
    this.actions = wrapActions(definitions.actions || {}, this.state);
    this.computed = wrapComputed(definitions.computed || {}, this.state);
    this.effects = wrapEffects(definitions.effects || {}, this);
    this.getters = wrapGetters(definitions.getters || {}, this);
  }
  /**
   * Gets the state signal.
   * @returns The state signal.
   */
  getState() {
    return this.state;
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
}
export function defineStore(storeName, definitions) {
  if (StoreMap.has(storeName)) {
    throw new Error(`Store with name "${storeName}" already exists. Use 'useStore("${storeName}")' to access it.`);
  }
  const store = new Proxy(new Store(definitions), {
    get(target, key) {
      const provider = {
        ...target.state.value,
        ...target.actions,
        ...target.computed,
        ...target.getters,
        state: target.state,
        getState: target.getState,
        getActions: target.getActions,
        getComputed: target.getComputed,
        getGetters: target.getGetters
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
export function useStore(storeName) {
  const store = StoreMap.get(storeName);
  if (store === void 0) {
    throw new Error(`Store "${storeName}" not found. Make sure to define it using 'defineStore("${storeName}", definitions)'.`);
  }
  const [, setState] = useState(store.getState());
  useEffect(() => store.getState().subscribe((newState) => {
    setState(signal(newState));
  }), []);
  return store;
}
function getStore(storeNameOrStore) {
  let store;
  if (typeof storeNameOrStore === "string") {
    const _store = StoreMap.get(storeNameOrStore);
    if (!_store) {
      throw new Error(`Store not found. Make sure to define it using 'defineStore("${storeNameOrStore}", definitions)'.`);
    }
    store = _store;
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
export function useActions(storeNameOrStore) {
  const store = getStore(storeNameOrStore);
  return store.getActions();
}
export function useStoreState(storeNameOrStore) {
  const store = getStore(storeNameOrStore);
  return store.getState();
}
export function useGetters(storeNameOrStore) {
  const store = getStore(storeNameOrStore);
  return store.getGetters();
}
export function useComputed(storeNameOrStore) {
  const store = getStore(storeNameOrStore);
  return store.getComputed();
}
export function useSignal(sig) {
  if (!(sig instanceof Signal)) {
    throw new Error("To use 'useSignal', you must provide a Signal as a value.");
  }
  const reactiveSignal = useReactive(sig);
  return [
    reactiveSignal.value.value,
    (newState) => {
      batch(() => {
        if (typeof newState === "function") {
          sig.value = newState(sig.value);
          reactiveSignal.value = sig;
          return;
        }
        sig.value = newState;
        reactiveSignal.value = sig;
      });
    }
  ];
}
export function useSignalValue(sig) {
  return useSignal(sig)[0];
}
export function useSignalAction(sig) {
  return useSignal(sig)[1];
}
export function useComputedSignal(signal2, callback) {
  return useMemo(() => computed(() => {
    return callback(signal2.value);
  }).value, [callback]);
}
export function watch(sig, callback, shouldNotUnmount = false) {
  useEffect(() => {
    const unsubscribe = sig.subscribe(callback);
    if (!shouldNotUnmount) {
      return unsubscribe;
    }
  }, [sig.value]);
}
export {
  Store
};
export * from "./signals.js";
