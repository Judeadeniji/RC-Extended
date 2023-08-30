**Documentation for `useAsync` and `useFetch` Hooks**

This documentation explains the usage of the `useAsync` and `useFetch` custom React hooks. These hooks are designed to simplify asynchronous operations with state tracking, allowing you to handle promises and fetch operations with ease. The `useAsync` hook is a general-purpose hook for handling any asynchronous operation, while the `useFetch` hook is specifically tailored for making HTTP fetch requests.


## Introduction

The provided hooks, `useAsync` and `useFetch`, are designed to simplify working with asynchronous operations in React applications. They handle the state of promise execution and fetch operations, respectively, and provide a straightforward API for managing asynchronous data.

## Installation

Before using these hooks, make sure you have React installed in your project. You can install the hooks by following these steps:

1. Import the hooks from the appropriate file.
2. Use the hooks in your components.

## Usage

### `useAsync`<a name="useasync"></a>

The `useAsync` hook handles any asynchronous operation using state tracking. It provides a way to manage the execution state of promises.

**Parameters:**

- `promiseFn`: A function that returns a promise to be executed.
- `onReject` (optional): A callback function that is called when the promise is rejected.
- `onFulfill` (optional): A callback function that is called when the promise is fulfilled.
- `onSettle` (optional): A callback function that is called when the promise settles (fulfilled or rejected).
- `signal` (optional): An optional AbortSignal for aborting the promise execution.

**Returns:**

- `PromiseState<T>`: An object representing the state of the asynchronous operation.

### `useFetch`<a name="usefetch"></a>

The `useFetch` hook simplifies making HTTP fetch requests with state tracking. It encapsulates the fetch logic and provides an additional `abort` function to cancel the ongoing fetch request.

**Parameters:**

- `url`: The URL to fetch data from.
- `options` (optional): Fetch options, such as headers, method, etc.

**Returns:**

- `PromiseState<T>`: An object representing the state of the fetch operation.
- `abort`: A function to abort the ongoing fetch request.

## Examples

Here are some examples demonstrating how to use the `useAsync` and `useFetch` hooks in React components.

### Example 1: Using `useAsync` Hook

```jsx
import React from "react";
import { useAsync } from "rc-extended";

function AsyncComponent() {
  const { isPending, isFulfilled, isRejected, result, error } = useAsync({
    promiseFn: async () => {
      const response = await fetch("https://api.example.com/data");
      return response.json();
    },
    onFulfill: (data) => console.log("Fulfilled with data:", data),
    onReject: (err) => console.error("Rejected with error:", err),
  });

  return (
    <div>
      {isPending && <p>Loading...</p>}
      {isFulfilled && <p>Data: {JSON.stringify(result)}</p>}
      {isRejected && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### Example 2: Using `useFetch` Hook

```jsx
import React from "react";
import { useFetch } from "rc-extended";

function FetchComponent() {
  const { isPending, isFulfilled, isRejected, result, error, abort } = useFetch(
    "https://api.example.com/data"
  );

  return (
    <div>
      {isPending && <p>Loading...</p>}
      {isFulfilled && <p>Data: {JSON.stringify(result)}</p>}
      {isRejected && <p>Error: {error.message}</p>}
      <button onClick={abort}>Cancel Fetch</button>
    </div>
  );
}
```

In both examples, the hooks manage the asynchronous operations and provide state information that can be used to display loading states, data, and errors in the UI.

That's it! You're now ready to efficiently manage asynchronous operations and fetch requests using the `useAsync` and `useFetch` hooks in your React components.