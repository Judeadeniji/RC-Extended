import { Signal, batch, signal, effect, computed } from "./signals.js";
import { noop } from "../utils";
import {
  ReactElement,
  createElement,
  useState,
  useEffect,
  useRef,
  useMemo,
  createContext,
  useContext,
  Context,
  useSyncExternalStore,
} from "react";
import useReactive from "../hooks/reactive.js";

type Prettier<T> = {
  [K in keyof T]: T[K];
} & {}

// type RecordKeyInclude<T, K> = {
//   [P in keyof T]: T[P] extends K ? P : never;
// }[keyof T];


// types.ts
interface State {
  [key: string]: any;
}
type SignalState<S> = {
  [key: string]: Signal<S>;
};

type Computed = Record<string, (state: any) => any>;
type Effects = Record<string, () => () => void>;
type ComputedSignals = Record<string, () => any>;
type EffectSignals = Record<string, () => void>;
type ActionSignals = Record<string, (...args: any[]) => void>;
type CentralizedState = Record<string, any>;

interface Definitions<StoreState, StoreActions = Record<string, (this: StoreState, ...args: any[]) => any>, StoreComputed = Record<string, (this: StoreState) => any>> {
  state: () => StoreState;
  actions?: StoreActions & {
    [key: string]: (this: StoreState, ...args: any[]) => any;
  };
  computed?: StoreComputed & {
    [key: string]: (this: StoreState) => any;
  };
  effects?: Effects;
}

// type MapKeysUnion<T extends Record<string, any>> = T extends Map<infer K, any>
//   ? K
//   : never;

export const StoreMap = new Map();

type StoreType<StoreState, A, C extends Record<string, (this: StoreState, ...args: any[]) => any>> = Prettier<StoreState & A & C>;


function centralizeState<S, A, C extends Record<string, (this: S, ...args: any[]) => any>>(
  this: Store<S, A, C>,
  states: SignalState<S>,
  subscriber: Function
): CentralizedState {
  const store = this;
  const merged: CentralizedState = {};
  for (const key in states) {
    const state = states[key];
    Object.defineProperty(merged, key, {
      get() {
        return state.value;
      },
      set(value) {
        state.value = value;
        subscriber(key, state.peek(), value);
        store._updateStore({ ...store._state, [key]: value })
      },
    });
  }

  return merged;
}

function wrapState(state: State) {
  const wrappedState: {
    [key: string]: Signal<State[typeof key]>;
  } = {};

  for (const key in state) {
    const element = state[key];
    wrappedState[key] = signal(element);
  }

  return wrappedState;
}

function wrapComputed<T>(store: Store<any, {}, any>) {
  const computedObj = store.defs.computed || {};
  const wrappedComputed: ComputedSignals = {};

  for (const key in computedObj) {
    if (key in store._state) {
      const element = computed(() =>
        computedObj[key].call(store.state[key], store.state[key])
      );

      // wrappedComputed["$"+key] = () => element.value as T;

      Object.defineProperty(wrappedComputed, `$${key}`, {
        get() {
          return () => element.value as T;
        },
      });
    } else {
      const element = computed(() => computedObj[key].call(store.state, store.state));
      Object.defineProperty(wrappedComputed, key, {
        get() {
          return () => element.value as T;
        },
      });
      //wrappedComputed[key] = () => element.value
    }
  }

  return wrappedComputed;
}

function wrapEffects<S, A, C extends Record<string, (this: S, ...args: any[]) => any>>(effs: Effects, store: Store<S, A, C>): EffectSignals {
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

function wrapActions<S, A, C extends Record<string, (this: S, ...args: any[]) => any>>(store: Store<S, A, C>, subscriber: Function = noop): ActionSignals {
  const acs: ActionSignals = {};
  const actions = store.defs.actions || {};

  for (const action in actions) {
    if (actions.hasOwnProperty(action)) {
      const actionFn = actions[action];

      acs[action] = (...args: Parameters<typeof actionFn>) => {
        const { onErrorCb, afterCb } =
          subscriber != noop
            ? subscriber(action, args)
            : { onErrorCb: noop, afterCb: noop };
        return batch<any>(() => {
          try {
            const newState: unknown | Promise<unknown> | undefined | void =
              actionFn.call(store.state, store.state, ...args);
            if (newState instanceof Promise) {
              newState.then(afterCb).catch(onErrorCb).finally(noop);
            } else if (newState) {
              store._updateStore(newState);
              afterCb(newState);
            }
          } catch (error: unknown) {
            onErrorCb(error as Error);
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
  storeInstance: Store<any, {}, {}>;
}

type ActionEventCallback = (params: ActionEventCallbackParam) => void;

interface StateEventCallbackParam<StateType> {
  name: string;
  current: StateType;
  next: StateType;
  storeInstance: Store<StateType, {}, {}>;
}

type StateEventCallback<StateType> = (
  params: StateEventCallbackParam<StateType>
) => void;


// interface Definitions<StoreState, StoreActions extends Record<string, (this: StoreState, ...args: any[]) => any>, StoreComputed extends Record<string, (this: StoreState) => any>> 
class Store<StoreState = State, StoreActions extends Record<string, any> = {}, StoreComputed extends Record<string, (this: StoreState) => any> = {}> {
  _state: State;
  syncStore: () => void = noop;
  private signalState: SignalState<StoreState>;
  readonly defs: Definitions<StoreState, StoreActions, StoreComputed>;
  private readonly effects: EffectSignals;
  private $state: CentralizedState;
  readonly actions: ActionSignals;
  computed: ComputedSignals;
  private onActionCb: (
    key: string,
    args: any[]
  ) => {
    onErrorCb: (error: Error | unknown) => void;
    afterCb: (results: any) => void;
  };
  private onStateCb: (name: string, current: any, next: any) => any;

  constructor(
    private readonly storeName: string,
    definitions: Definitions<StoreState, StoreActions, StoreComputed>
  ) {
    this.onActionCb = noop;
    this.onStateCb = noop;
    this.defs = definitions;
    this._state = this.defs.state();
    this.signalState = wrapState(this._state);
    this.$state = centralizeState.call(this, this.signalState, this.onStateCb);
    this.actions = wrapActions(this, this.onActionCb);
    this.computed = wrapComputed(this);
    this.effects = wrapEffects(this.defs.effects || {}, this);
  }

  get name() {
    return this.storeName;
  }

  get state() {
    return this.$state;
  }

  _updateStore(newState: State) {
    this._state = newState;
    this.signalState = wrapState(this._state);
    this.$state = centralizeState.call(this, this.signalState, this.onStateCb);
    this.computed = wrapComputed(this);
    this.disposeEffects();
    this.syncStore();
  }

  onAction(callback: ActionEventCallback) {
    const instance = this;
    instance.onActionCb = (key: string, args: any[]) => {
      let onErrorCb: (error: Error | unknown) => void = noop;
      let afterCb: (results: any) => void = noop;

      function onError(callback: (error: Error | unknown) => void) {
        onErrorCb = callback;
      }

      function after(callback: (results: any) => void) {
        afterCb = callback;
      }

      callback.call(instance, {
        storeInstance: instance,
        name: key,
        onError,
        after,
        args,
      });

      return {
        onErrorCb,
        afterCb,
      };
    };

    return function unsubscribe() {
      instance.onActionCb = noop;
    };
    // To be continued...
  }

  onState<StateType = any>(callback: StateEventCallback<StateType>) {
    const instance = this;

    instance.onStateCb = (
      name: string,
      current: StateType,
      next: StateType
    ) => {
      callback.call(instance, { name, current, next, storeInstance: instance });
    };

    return function unsubscribe() {
      instance.onStateCb = noop;
    };
  }

  disposeEffects() {
    for (const key in this?.effects || {}) {
      this.disposeEffect(key);
    }
  }

  disposeEffect<Key extends keyof EffectSignals>(key: Key) {
    this.effects[key]?.();
  }

  subscribe<Key extends string>(
    this: Store,
    key: Key,
    listener: (newState: State[Key]) => void
  ) {
    const store = this;
    const unsubscribe = store.signalState[key].subscribe(function (newState) {
      store._state[key] = newState;
      listener(newState);
    });

    return () => {
      unsubscribe?.();
      store.disposeEffect(key);
    };
  }
}

export function defineStore<StoreState, A extends Record<string, (this: StoreState, ...args: any[]) => any> = {}, C extends Record<string, (this: StoreState, ...args: []) => any> = {}>(
  storeName: string,
  definitions: Definitions<StoreState, A, C>
): () => StoreType<StoreState, A, C> {
  if (typeof storeName !== "string") {
    throw new Error("Store Name Must be a string");
  }

  if (StoreMap.has(storeName)) {
    return () => useStore(storeName) as unknown as StoreType<StoreState, A, C>;
  }

  const store = new Proxy(new Store(storeName, definitions), {
    get(target: Store, key: keyof Store) {
      type Provider = {
        subscribe: typeof target.subscribe;
      } & { [key: string]: any };

      const provider: Provider = {
        onAction: target.onAction,
        subscribe: target.subscribe,
      };

      if (key in provider) {
        return provider[key];
      } else if (key in target.state) {
        return target.state[key];
      } else if (key in target.computed) {
        return target.computed[key];
      } else if (key in target.actions) {
        return target.actions[key];
      } else if (key in target) {
        return target[key];
      } else {
        target.disposeEffects();
        throw new Error(
          `Property '${key}' not found in store '${storeName}', This might be a bug in RC-Extended.`
        );
      }
    },
    // set() {
    //   return false;
    // }
  }) as unknown as StoreType<StoreState, A, C>;
  StoreMap.set(storeName, store as StoreType<StoreState, A, C>);

  return () => useStore(storeName) as unknown as StoreType<StoreState, A, C>;
}

export function derived(
  store: Store,
  fn: <S extends typeof store._state>(parentState: State) => S
) {
  const state: any = () => fn({ ...store.state });
  const derivedStore = new Store(store.name, { state });

  let unsubscribers: (() => void)[] = [];

  function subscribe() {
    unsubscribers = Object.keys(derivedStore._state).map((key) => {
      return store.subscribe(key, (newState) => {
        const newDerivedState = fn({
          ...store.state,
          [key]: newState,
        });
        for (const key in newDerivedState) {
          if (Object.prototype.hasOwnProperty.call(newDerivedState, key)) {
            const element = newDerivedState[key];

            if (
              key in derivedStore.state &&
              element != derivedStore.state[key]
            ) {
              derivedStore.state[key] = element;
            }
          }
        }
      });
    });

    return function unsubscribe() {
      unsubscribers.forEach((fn) => fn());
    };
  }

  return {
    get value() {
      return derivedStore.state;
    },
    subscribe,
  };
}

export function readonly(store: Store) {
  return {
    get value() {
      const cs: CentralizedState = store.state;
      type Cs = typeof cs;
      return new Proxy(cs, {
        get<Key extends keyof Cs>(target: Cs, key: Key): Cs[Key] {
          return target[key];
        },
        set(): false {
          return false;
        },
      });
    },
    subscribe<Key extends keyof typeof store.state>(
      cb: (key: Key, newValue: State[Key]) => void
    ) {
      const fns = Object.entries(store.state).map(
        ([key, signal]: [key: string, signal: Signal]) => {
          return signal.subscribe((newValue) => cb(key as Key, newValue));
        }
      );

      return () => fns.forEach((f) => f());
    },
  };
}

// hooks.ts

var StoreProvider: Context<StoreType<unknown, any, any> | undefined>;

export function useStore<StoreState, A, C extends Record<string, (this: StoreState, ...args: any[]) => any>>(
  storeName: string
): StoreType<StoreState, A, C> {
  const store = StoreMap.get(storeName) as Store<StoreState, A, C>;

  if (store === undefined) {
    throw new Error(
      `Store "${storeName}" not found. Make sure to define it using 'defineStore("${storeName}", definitions)'.`
    );
  }

  useSyncExternalStore(
    (onStoreChange) => {
      store.syncStore = () => {
        onStoreChange()
      };
      return () => {
        store.syncStore = noop;
      };
    },
    () =>  store.state,
    () => store.state
  );

  return store as unknown as StoreType<StoreState, A, C>;
}

export function useStoreActions<StoreState, StoreActions>(
  storeNameOrStore: string | StoreType<StoreState, StoreActions, {}>
): ActionSignals {
  const store = getStore(storeNameOrStore as string);
  return store.actions as unknown as ActionSignals;
}

export function useStoreComputed<StoreState, StoreComputed extends Record<string, (this: StoreState) => any>>(
  storeNameOrStore: string | StoreType<StoreState, {}, StoreComputed>
) {
  const store = getStore(storeNameOrStore as string);
  return store.computed;
}

export function useSignal<T>(
  sig: Signal<T | undefined> = signal<T | undefined>(undefined)
): [T, (newState: ((prev: T) => T) | T) => void] {
  // Check if a Signal instance is provided
  if (!(sig instanceof Signal)) {
    //throw new Error("To use 'useSignal', you must provide a Signal as a value.");
  }

  // Store the signal in a ref;
  const signalRef = useRef(sig);

  // Get a reactive version of the Signal value
  const reactiveSignal = useReactive<T>(signalRef.current.value);

  useEffect(() => {
    return signalRef.current.subscribe((newValue) => {
      reactiveSignal.value = newValue;
    });
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
  return useMemo(() => computed(callback), [callback]);
}

export function $watch<T>(
  sig: Signal<T>,
  callback: (newValue: T, oldValue: undefined | T) => void | (() => void),
  shouldNotUnmount: boolean = false
) {
  const previous = useRef<T | undefined>();
  let unsubscribe = noop;
  useEffect(() => {
    // Subscribe to the Signal and store the unsubscribe function
    unsubscribe = sig?.subscribe((current) => {
      const unsub = callback(current, previous.current);
      previous.current = current;
      return unsub;
    });

    // If shouldNotUnmount is false, return the unsubscribe function to clean up on unmount
    if (!shouldNotUnmount) {
      return unsubscribe;
    }
  }, [sig.value]); // Re-run the effect when the Signal's value changes

  return unsubscribe;
}

export function watch<T>(
  sig: Signal<T>,
  callback: (newValue: T, oldValue: undefined | T) => void | (() => void)
) {
  let previous: T | undefined;
  let unsubscribe = noop;
  // Subscribe to the Signal and store the unsubscribe function
  unsubscribe =
    sig.subscribe &&
    sig.subscribe((current) => {
      const unsub = callback(current, previous);
      previous = current;
      return unsub;
    });

  return unsubscribe;
}

export function pausableWatch<T>(
  target: Signal<T>,
  fn: (newValue: T, oldValue: T) => void | (() => void)
) {
  let unsubscribe = watch(target, fn);

  function pause() {
    unsubscribe();

    return resume;
  }

  function resume() {
    unsubscribe = watch(target, fn);

    return pause;
  }

  return {
    pause,
    resume,
    start: resume, // alias
    stop: pause, // alias
  };
}

export function $effect(cb: () => undefined | (() => void)): void {
  return useEffect(() => {
    let unsubscribe: undefined | (() => void);
    const dispose = effect(() => (unsubscribe = cb()));

    // there's a problem with this implementation unsubscribe might be called twice
    // one from signal.effect and the other by useEffect
    if (unsubscribe && typeof unsubscribe === "function") {
      return () => {
        dispose();
        unsubscribe?.();
      };
    } else {
      return dispose;
    }
  }, []);
}

export function $signal<T>(value: T) {
  const signalRef = useRef(signal<T>(value));
  const rxSignal = useReactive(signalRef.current.value);

  useEffect(() => {
    return signalRef.current.subscribe((newValue) => {
      rxSignal.value = newValue;
    });
  }, []);

  return signalRef.current;
}

export function $derived(...args: Parameters<typeof derived>) {
  const dy = useRef(derived(...args)).current;

  $effect(() => {
    return dy.subscribe();
  });

  return {
    get value() {
      return dy.value;
    },
  };
}

StoreProvider = createContext<StoreType<unknown, unknown, {}> | undefined>(undefined);

interface ProviderProps {
  children: ReactElement<any, any>;
}

export function createProvider<StoreState, StoreActions, StoreComputed extends Record<string, (this: StoreState) => any>>(
  _store: string | StoreType<StoreState, StoreActions, StoreComputed>
) {
  const store = getStore(_store);

  return function ({ children, ...props }: ProviderProps) {
    // we use an useEffect to dispose all effects when the component unmounts
    useEffect(() => {
      return store.disposeEffects;
    }, []);

    return createElement(
      StoreProvider.Provider,
      { ...props, value: store },
      children
    );
  };
}

function getStoreContext(hookName: string) {
  const ctx = useContext(StoreProvider);

  if (!ctx) {
    throw new ReferenceError(
      `You Should only use ${hookName} within a provider. You can create a provider using createProvider(store)`
    );
  }

  return ctx;
}

export function getActions<StoreState = State, StoreActions extends Record<string, any> = {}, StoreComputed extends Record<string, (this: StoreState) => any> = {}>() {
  const _store = getStoreContext("getActions()") as Store<any, any, any>;
  const store = useStore<StoreState, StoreActions, StoreComputed>(_store.name);

  const actions = store.actions;

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

export function getStore<StoreState, StoreActions, StoreComputed extends Record<string, (this: StoreState) => any>>(
  storeNameOrStore: string | StoreType<StoreState, StoreActions, StoreComputed>
): StoreType<StoreState, StoreActions, StoreComputed> {
  let store: StoreType<StoreState, StoreActions, StoreComputed>;
  if (typeof storeNameOrStore === "string") {
    const _store = StoreMap.get(storeNameOrStore);
    if (!_store) {
      throw new Error(
        `Store not found. Make sure to define it using 'defineStore("${storeNameOrStore}", definitions)'.`
      );
    }
    store = _store;
  } else if (storeNameOrStore instanceof Store) {
    store = storeNameOrStore;
  } else {
    throw new Error(
      "Invalid argument. Provide a store name (string) or a store instance."
    );
  }
  if (!store) {
    throw new Error(
      `Store not found. Make sure to define it using 'defineStore("${storeNameOrStore}", definitions)'.`
    );
  }
  return store;
}

export function deepSignal<Type>(object: Record<any, Type>) {
  function toSignal(object: Record<any, Type>) {
    let signalObject = {};
    for (const key in object) {
      const item = object[key];
      if (typeof item === "object" && item !== null && !Array.isArray(item)) {
        signalObject[key] = toSignal(item as Record<any, any>);
        continue;
      }

      const sigObj = signal(object[key]);

      Object.defineProperty(signalObject, key, {
        get() {
          return sigObj.value;
        },
        set(newValue) {
          sigObj.value = newValue;
        },
      });
    }

    return signalObject;
  }

  return toSignal(object);
}

export { Store, Definitions };
