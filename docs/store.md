# rc-extended/store Documentation

Welcome to the official documentation for `rc-extended/store`, a powerful signal based module for managing state in React applications. This guide will walk you through the installation, setup, and best practices for using `rc-extended/store` effectively in your React projects.

## Table of Contents

1. [Installation](#installation)
2. [Getting Started](#getting-started)
   - [Creating a Store](#creating-a-store)
   - [Accessing a Store](#accessing-a-store)
     - [When to Use `useStore`](#when-to-use-usestore)
3. [Store Definitions](#store-definitions)
   - [State](#state)
   - [Actions](#actions)
   - [Computed Properties](#computed-properties)
   - [Effects](#effects)
   - [Getters](#getters)
4. [Hooks and Functions](#hooks-and-functions)
   - [useActions](#useactions)
     - [When to Use `useActions`](#when-to-use-useactions)
   - [useStoreState](#usestorestate)
     - [When to Use `useStoreState`](#when-to-use-usestorestate)
   - [useGetters](#usegetters)
     - [When to Use `useGetters`](#when-to-use-usegetters)
   - [useComputed](#usecomputed)
     - [When to Use `useComputed`](#when-to-use-usecomputed)
   - [useSignal](#usesignal)
     - [When to Use `useSignal`](#when-to-use-usesignal)
   - [useSignalValue](#usesignalvalue)
     - [When to Use `useSignalValue`](#when-to-use-usesignalvalue)
   - [useSignalAction](#usesignalaction)
     - [When to Use `useSignalAction`](#when-to-use-usesignalaction)
   - [useComputedSignal](#usecomputedsignal)
     - [When to Use `useComputedSignal`](#when-to-use-usecomputedsignal)
   - [watch](#watch)
     - [When to Use `watch`](#when-to-use-watch)
5. [Examples](#examples)
   - [Example 1: Creating and Using a Store](#example-1-creating-and-using-a-store)
   - [Example 2: Working with Computed Properties](#example-2-working-with-computed-properties)
   - [Example 3: Watching for State Changes](#example-3-watching-for-state-changes)
## 1. Installation<a name="installation"></a>

To install `rc-extended`, use npm or yarn:

```bash
npm install rc-extended
# or
yarn add rc-extended
```

## 2. Getting Started<a name="getting-started"></a>

### Creating a Store<a name="creating-a-store"></a>

`rc-extended/store` provides a straightforward way to create a store for your application's state management.

```typescript
// stores.js
import { defineStore, Definitions } from "rc-extended/store";

// Create a store named "myStore"
const useMyStore = defineStore("myStore", {
  state: () => ({ /* initial state */ }),
  actions: {
    // Define your actions here
  },
  computed: {
    // Define computed properties here
  },
  effects: {
    // Define effects here
  },
  getters: {
    // Define getters here
  },
}: Definitions);

export { useMyStore }
```

With `defineStore`, you receive a hook, such as `useMyStore`, that provides a convenient way to access your store's data and functions within your components:

```javascript
// import { useStore } from "rc-extended/store"
import { useMyStore } from "./stores"

function MyComponent() {
  const myStore = useMyStore();
  // alternatively
  // const myStore = useStore('myStore');

  // Access store data and methods here

  return (
    // Your component JSX
  );
}
```

**Note:** Stores should be defined outside components, typically in a separate file dedicated to store definitions. This ensures that the store's state is not re-initialized with every component render, maintaining a single source of truth for your application's state.

#### When to Use `useStore` or `useMyStore`

You can choose to use either `useMyStore` (the hook returned by `defineStore`) or `useStore` based on your preference for cleaner component code. Both options provide access to the same centralized state and serve the same purpose.


Certainly, I'll extend the documentation with more extensive examples and include the automatic dependency registration for effects. Here's the updated content:

## When to Use `useStore` or `useMyStore`

You can choose to use either `useMyStore` (the hook returned by `defineStore`) or `useStore` based on your preference for cleaner component code. Both options provide access to the same centralized state and serve the same purpose.

### Accessing a Store

Once you've created a store, you can access it using the `useStore` hook.

```typescript
import { useStore, Store } from "rc-extended/store";

function MyComponent() {
  const store: Store = useStore("myStore");

  // Access store data and methods here

  return (
    // Your component JSX
  );
}
```

**When to Use `useStore`:**

Use `useStore` when you have multiple components that need access to the same store data. This ensures that all components interact with the same centralized state.

## Store Definitions

In `rc-extended/store`, a store is defined using five key parts:

### State

The `state` property defines the initial state of your store. It's a function that returns an object representing the initial state.

```javascript
state: () => ({
  // Your initial state properties
})
```

**Example:**

```javascript
state: () => ({
  firstName: "John",
  lastName: "Doe",
  age: 30,
})
```

### Actions

Actions are functions that perform state mutations. They receive the current state as their first argument and can accept additional parameters.

**Example:**

```javascript
actions: {
  incrementAge: (state) => {
    return {
      ...state,
      age: state.age + 1,
    };
  },
  updateName: (state, newName) => {
    return {
      ...state,
      firstName: newName,
    };
  },
}
```

### Computed Properties

Computed properties are derived values from your state. They are updated automatically whenever dependent state properties change.

**Example:**

```javascript
computed: {
  fullName: (state) => `${state.firstName} ${state.lastName}`,
  isAdult: (state) => state.age >= 18,
}
```

### Effects

Effects are side-effects that can either depend on a signal or not. If the key of an effect matches a key from state or computed, the effect will automatically and silently register that computed property or state object as a dependency internally. The callback function will receive the computed property value or state property as an argument.

**Example:**

```javascript
effects: {
  // automatically depends on computed.isAdult since both key matches
  isAdult: (isAdult) => {
    // this callback will run whenever state changes and computed.isAdult is recomputed
    // isAdult argument is the same as computed.isAdult()
  }
},
```

### Getters

Getters are functions that provide read-only access to your state, actions, or computed properties. They receive a provider object containing state, actions, and computed properties.

```javascript
getters: {
  userFullName: ({ state, computed }) => {
    return computed.fullName(state);
  }
}
```

**Example:**

```javascript
getters: {
  userFullName: ({ state, computed }) => {
    return computed.fullName(state);
  },
  canVote: ({ state }) => state.age >= 18,
}
```

## Hooks and Functions

### useActions

The `useActions` hook allows you to access a store's actions.

```javascript
const actions = useActions("myStore");
```

**Example:**

```javascript
const increment = () => {
  actions.incrementAge();
};
```

### useStoreState

The `useStoreState` hook provides access to a store's state.

```javascript
const state = useStoreState("myStore");
```

**Example:**

```javascript
const age = state.age;
```

### useGetters

The `useGetters` hook allows you to access a store's getters.

```javascript
const getters = useGetters("myStore");
```

**Example:**

```javascript
const canVote = getters.canVote();
```

### useComputed

The `useComputed` hook provides access to a store's computed properties.

```javascript
const computedProperties = useComputed("myStore");
```

**Example:**

```javascript
const fullName = computedProperties.fullName();
```

### useSignal

The `useSignal` hook allows you to work with Signal objects.

```javascript
const [value, setValue] = useSignal(mySignal);
```

**Example:**

```javascript
const [count, setCount] = useSignal(countSignal);
```

### useSignalValue

The `useSignalValue` hook provides direct access to the current value of a Signal.

```javascript
const value = useSignalValue(mySignal);
```

**Example:**

```javascript
const count = useSignalValue(countSignal);
```

### useSignalAction

The `useSignalAction` hook provides a function to modify the value of a Signal.

```javascript
const setSignalValue = useSignalAction(mySignal);
```

**Example:**

```javascript
const updateCount = useSignalAction(countSignal);
```

### useComputedSignal

The `useComputedSignal` hook creates a computed Signal based on a callback function.

```javascript
const computedSignal = useComputedSignal(() => {
  // must reference/use a signal value here
  // eg someSignal.value
  // if you don't no dependency will be registered to this callback
});
```

**Example:**

```javascript
const doubledCountSignal = useComputedSignal(() => {
  return countSignal.value * 2;
});
```

### watch

The `watch` function allows you to observe changes in a Signal and trigger a callback when the Signal's value changes.

```javascript
import { signal, useSignal, watch } from "rc-extended/store";

// Define a global state with a signal
const count = signal(0)

function MyComponent() {
  const [count, setCount] = useSignal(count);
  
  watch(count, (newCount) => {
    // This callback runs whenever countSignal or other components update the value
    console.log(`Count updated: ${newCount}`);
  });
  
  return (
    // Return JSX
  )
}
```

**Example:**

```javascript
import { signal, useSignal, watch } from "rc-extended/store";

const globalSignal = signal(0);

function MyComponent() {
  const [count, setCount] = useSignal(globalSignal);
  
  watch(count, (newCount) => {
    // This callback runs whenever globalSignal or other components update the value
    console.log(`Global Signal updated: ${newCount}`);
  });
  
  return (
    // Return JSX
  )
}
```

**When to Use `watch`:**

Use `watch` when you need to react to changes in a Signal's value (store states are signals too).

The `watch` function allows you to observe changes in a Signal and trigger a callback when the Signal's value changes.

```javascript
import { signal, useSignal, watch } from "rc-extended/store";

// define a global state with a signal
const count = signal(0)

function MyComponent() {
  const [count, setCount] = useSignal(count);
  
  watch(count, (newCount) => {
    // reruns even if count was count was updated in another component
    // never update a the same signal here
  })
  
  return (
    /* return jsx */
  )
}

```

#### When to Use `watch`<a name="when-to-use-watch"></a>

Use `watch` when you need to react to changes in a Signal's value (store states are signals also).


## 5. Examples<a name="examples"></a>

### Example 1: Creating and Using a Store<a name="example-1-creating-and-using-a-store"></a>

In this example, we'll demonstrate how to create a store and access its state and actions.

```javascript
// Create a store
const myStore = defineStore("myStore", {
  state: () => ({ count: 0 }),
  actions: {
    increment: (state) => {
      state.count += 1;
      return state;
    },
  },
});

// Access the store in a component
function MyComponent() {
  const { count } = useStoreState("myStore");
  const { increment } = useActions("myStore");

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

### Example 2: Working with Computed Properties<a name="example-2-working-with-computed-properties"></a>

In this example, we'll define computed properties and access them in a component.

```javascript
// Create a store with computed properties
const myStore = defineStore("myStore", {
  state: () => ({ firstName: "John", lastName: "Doe" }),
  computed: {
    fullName: (state) => `${state.firstName} ${state.lastName}`,
  },
});

// Access the computed property in a component
function MyComponent() {
  const fullName = useComputed("myStore").fullName;

  return (
    <p>Full Name: {fullName}</p>
  );
}
```

### Example 3: Watching for State Changes<a name="example-3-watching-for-state-changes"></a>

In this example, we'll use the `watch` function to observe state changes.

```javascript
// Create a store
const myStore = defineStore("myStore", {
  state: () => ({ count: 0 }),
});

// Watch for changes in a component
function MyComponent() {
  const { count } = useStoreState("myStore");

  // Watch for changes in the state whole state
  watch(myStore.state, (newValue) => {
    console.log(`Count changed to ${newValue.count}`);
  });

  return (
    // JSX content
  );
}
```
