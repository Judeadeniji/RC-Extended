## Timer React Hooks Usage Documentation

This comprehensive guide provides in-depth explanations and examples for each of the timer-related functions and React hooks defined in `rc-extended`. These hooks offer functionalities to handle timeouts, intervals, debouncing, throttling, and emitting numbers at specified intervals.

### `setReturn`

This function returns a promise that resolves with the result of a callback after a specified time.

**Usage:**

The `setReturn` function is useful when you need to execute a function after a certain delay and retrieve its result. It's particularly handy when you want to delay the execution of an asynchronous task, like an API call.

```javascript
import { setReturn } from "rc-extended";

async function fetchData() {
  const data = await setReturn(() => fetch("https://api.example.com/data"), 1000);
  const jsonData = await data.json();
  console.log(jsonData);
}
```

### `sleep`

This function returns a promise that fulfills after a specified time.

**Usage:**

The `sleep` function is beneficial when you need to introduce a delay in your code. It's commonly used to simulate waiting or delaying execution before proceeding.

```javascript
import { sleep } from "rc-extended";

async function delayedAction() {
  console.log("Start");
  await sleep(2000);
  console.log("After 2 seconds");
}
```

### `useTimeout`

A hook that executes a callback after a specified timeout.

**Usage:**

The `useTimeout` hook is perfect for scenarios where you want to trigger a function after a certain delay. This could be useful for displaying messages, animations, or UI changes.

```javascript
import { useTimeout } from "rc-extended";

function Component() {
  useTimeout(() => {
    console.log("Timeout completed!");
  }, 3000);

  return <div>Check the console after 3 seconds.</div>;
}
```

### `useInterval`

A hook that repeatedly executes a callback at a specified interval.

**Usage:**

The `useInterval` hook is great for implementing periodic tasks, such as polling an API, updating UI elements, or refreshing data at regular intervals.

```javascript
import { useInterval } from "rc-extended";

function Component() {
  useInterval(() => {
    console.log("Interval callback!");
  }, 1000);

  return <div>Check the console for interval callbacks.</div>;
}
```

### `useDebouncedCallback`

A hook that creates a debounced version of a callback.

**Usage:**

The `useDebouncedCallback` hook is essential when you want to postpone the execution of a function until a certain time has passed since the last invocation. This is particularly useful for handling user input, such as search queries or form submissions.

```javascript
import { useDebouncedCallback } from "rc-extended";

function Component() {
  const debouncedCallback = useDebouncedCallback((value) => {
    console.log("Debounced callback with value:", value);
  }, 500);

  // Usage example: Call debouncedCallback(value) in response to some user input
  return <div>Check the console after debouncing input.</div>;
}
```

### `useThrottledCallback`

A hook that creates a throttled version of a callback.

**Usage:**

The `useThrottledCallback` hook is handy when you need to limit the frequency of function invocations. It's useful for scenarios like handling scroll events, mouse movements, or button clicks to prevent excessive executions.

```javascript
import { useThrottledCallback } from "rc-extended";

function Component() {
  const throttledCallback = useThrottledCallback((value) => {
    console.log("Throttled callback with value:", value);
  }, 500);

  // Usage example: Call throttledCallback(value) in response to some frequent event
  return <div>Check the console after throttling events.</div>;
}
```

### `useIntervalEmitter`

A custom hook that emits numbers in sequence at a specified interval.

**Usage:**

The `useIntervalEmitter` hook is useful when you want to generate a sequence of numbers at a regular interval. This can be used for various purposes, such as creating timers, progress indicators, or animations.

```javascript
import { useIntervalEmitter } from "rc-extended";

function Component() {
  const { number, take } = useIntervalEmitter(1000);

  return (
    <div>
      <p>Current number: {number}</p>
      <button onClick={() => take(5)}>Take 5 numbers</button>
    </div>
  );
}
```

With these comprehensive explanations and examples, you'll be able to effectively utilize each timer-related hook in your React applications. Whether you're delaying actions, repeating tasks, managing input, controlling event frequency, or generating sequences, these hooks offer a powerful toolkit for managing timing-related behaviors.