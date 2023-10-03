import { Store, StoreMap } from "./main.js";

export function noop() {}

/**
 * Helper function to get the store based on storeNameOrStore parameter.
 * @param {string | Store} storeNameOrStore - The name of the store or the store instance.
 * @returns {Store} The store.
 * @throws {Error} If the store is not found.
 */
export function getStore<S>(storeNameOrStore: string | Store<S>): Store<S> {
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
