# Store Management Module - RC- Extended

This library provides a comprehensive state management solution for React applications using signals, computed properties, and effects. It allows you to define stores, manage state, and create reactive components with ease.

## Table of Contents

- Installation
- Usage
  - [Defining a Store](#defining-a-store)
  - [Using the Store in Components](#using-the-store-in-components)
  - Actions
  - [Computed Properties](#computed-properties)
  - Effects
  - [Derived Stores](#derived-stores)
  - [Readonly Stores](#readonly-stores)
- [API Reference](#api-reference)
  - defineStore
  - useStore
  - useStoreActions
  - useStoreComputed
  - useSignal
  - useSignalValue
  - useSignalAction
  - $computed
  - $watch
  - watch
  - pausableWatch
  - $effect
  - $signal
  - $derived
  - createProvider
  - getActions
  - getState
  - getSingleState
  - getStore
  - deepSignal

## Installation

To install the library, use npm or yarn:

```bash
npm install rc-extended/store
# or
yarn add rc-extended/store
```

## Usage

### Defining a Store

To define a store, use the defineStore function. You need to provide a store name and definitions for state, actions, computed properties, and effects.

```typescript
import { defineStore } from 'rc-extended/store';

const useCounterStore = defineStore('counter', {
  state: () => ({
    count: 0,
  }),
  actions: {
    increment() {
      this.count += 1;
    },
    decrement() {
      this.count -= 1;
    },
  },
  computed: {
    doubleCount() {
      return this.count * 2;
    },
  },
  effects: {
    logCount() {
      console.log('Count:', this.count);
      return () => console.log('Effect disposed');
    },
  },
});
```

### Using the Store in Components

To use the store in your React components, use the useStore hook.

```typescript
import React from 'react';
import { useStore } from 'rc-extended/store';

function Counter() {
  const { count, doubleCount, increment, decrement } = useStore('counter');

  return (
    <div>
      <p>Count: {count}</p>
      <p>Double Count: {doubleCount}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
    </div>
  );
}
```

### Actions

Actions are methods defined in the store that can modify the state.

```typescript
const { increment, decrement } = useStoreActions('counter');
increment();
decrement();
```

### Computed Properties

Computed properties are derived from the state and automatically update when the state changes.

```typescript
const { doubleCount } = useStoreComputed('counter');
console.log(doubleCount); // Outputs the double of the count
```

### Effects

Effects are side effects that run when the state changes.

```typescript
useEffect(() => {
  const { logCount } = useStore('counter');
  return logCount();
}, []);
```

### Derived Stores

Derived stores are stores that depend on the state of another store.

```typescript
import { derived } from 'rc-extended/store';

const derivedStore = derived(useCounterStore(), (state) => ({
  doubleCount: state.count * 2,
}));

const usubscribe = derivedStore.subscribe(() => {
  console.log('Derived store updated');
});
// Unsubscribe

console.log(derivedStore.value.doubleCount); // Outputs the double of the count
```

### Readonly Stores

Readonly stores provide a read-only view of the state.

```typescript
import { readonly } from 'rc-extended/store';

const readonlyStore = readonly(useCounterStore());
console.log(readonlyStore.value.count); // Outputs the count
```

## API Reference

### defineStore

Defines a new store.

```typescript
function defineStore<StoreState, A, C>(
  storeName: string,
  definitions: Definitions<StoreState, A, C>
): () => StoreType<StoreState, A, C>;
```

### useStore

Returns the store instance.

```typescript
function useStore<StoreState, A, C>(
  storeName: string
): StoreType<StoreState, A, C>;
```

### useStoreActions

Returns the actions of the store.

```typescript
function useStoreActions<StoreState, StoreActions>(
  storeNameOrStore: string | StoreType<StoreState, StoreActions, {}>
): ActionSignals;
```

### useStoreComputed

Returns the computed properties of the store.

```typescript
function useStoreComputed<StoreState, StoreComputed>(
  storeNameOrStore: string | StoreType<StoreState, {}, StoreComputed>
);
```

### useSignal

Creates a signal and returns its value and a function to update it.

```typescript
function useSignal<T>(
  sig: Signal<T | undefined> = signal<T | undefined>(undefined)
): [T, (newState: ((prev: T) => T) | T) => void];
```

### useSignalValue

Returns the value of a signal.

```typescript
function useSignalValue<T>(sig: Signal<T>): T;
```

### useSignalAction

Returns the function to update a signal.

```typescript
function useSignalAction<T>(sig: Signal<T>);
```

### $computed

Creates a computed property.

```typescript
function $computed<T>(callback: () => T);
```

### $watch

Watches a signal and calls a callback when it changes.

```typescript
function $watch<T>(
  sig: Signal<T>,
  callback: (newValue: T, oldValue: undefined | T) => void | (() => void),
  shouldNotUnmount?: boolean
);
```

### watch

Watches a signal and calls a callback when it changes.

```typescript
function watch<T>(
  sig: Signal<T>,
  callback: (newValue: T, oldValue: undefined | T) => void | (() => void)
);
```

### pausableWatch

Creates a pausable watch on a signal.

```typescript
function pausableWatch<T>(
  target: Signal<T>,
  fn: (newValue: T, oldValue: T) => void | (() => void)
);
```

### $effect

Creates an effect.

```typescript
function $effect(cb: () => undefined | (() => void)): void;
```

### $signal

Creates a signal. This is an alias for the signal function but also doubles as a react hook for creating signals.

```typescript
function $signal<T>(value: T);
```

### $derived

Creates a derived store from an existing store.

```typescript
function $derived(store: Store, callback: (state: State) => State);
```

### createProvider

Creates a provider for a store. This is useful for wrapping your app with the store provider, It facilitates the usage of some special hooks like getActions, getState, getSingleState, and getStore as this relies on the current store context.
Also, when using a provider, the store's effects will be automatically disposed when the provider is unmounted. This is useful for cleaning up resources when the store is no longer needed. It might also cause unwanted behavior if the store is used in multiple places outside of the provider.

```typescript
function createProvider<StoreState, StoreActions, StoreComputed>(
  _store: string | StoreType<StoreState, StoreActions, StoreComputed>
);

// Usage
const CounterProvider = createProvider('counter'); // or createProvider(Store)

// Wrap your app with the provider
<CounterProvider>
  <App />
</CounterProvider>
```

### getActions

Returns the actions of the current store context.

```typescript
function getActions();
```

### getState

Returns the state of the current store context.

```typescript
function getState();
```

### getSingleState

Returns a single state property of the current store context.

```typescript
function getSingleState(stateName: string);
```

### getStore

Returns the store instance. This is useful when you need to access the store instance outside of a component.

```typescript
function getStore<StoreState, StoreActions, StoreComputed>(
  storeNameOrStore: string | StoreType<StoreState, StoreActions, StoreComputed>
): StoreType<StoreState, StoreActions, StoreComputed>;
```

### deepSignal

Creates a deep signal from an object.

```typescript
function deepSignal<Type>(object: Record<any, Type>);
```

## Conclusion

This library provides a powerful and flexible way to manage state in React applications. By using signals, computed properties, and effects, you can create highly reactive and maintainable components.
