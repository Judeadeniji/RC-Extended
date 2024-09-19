# Await Component Documentation

## Overview

The `Await` hook, offers a seamless way to handle asynchronous operations and manage promise states in your React application. This documentation provides a comprehensive guide to their proper usage.

## Table of Contents

1. Installation
2. Import Statements
3. Using the `Await` Component
    - Basic Usage

4. Using the `usePromiseData` Hook
    - Accessing Promise State

5. API Reference
    - `Await` Component
    - `usePromiseData` Hook

6. Conclusion

## Installation

To use the `Await` component and `usePromiseData` hook, ensure you have the necessary dependencies installed:

```bash
npm install react rc-extended
```

## Import Statements

Begin by importing the necessary components and hooks:

```javascript
import { Await, usePromiseData } from 'rc-extended';
```

## Using the `Await` Component

The `Await` component serves as a container for managing the promise state and rendering content based on its status. You should include a component that utilizes the `usePromiseData` hook to access the awaited data.

### Basic Usage

Wrap the `Await` component around a child component that uses the `usePromiseData` hook:

```javascript
<Await promiseFn={fetchData}>
  <AwaitContent />
</Await>
```

Where `AwaitContent` is a child component using the `usePromiseData` hook:

```javascript
import { usePromiseData } from 'rc-extended';

function AwaitContent() {
  const { isPending, isFulfilled, isRejected, result, error } = usePromiseData();

  return (
   <div>
    {isPending && <p>Loading...</p>}
    {isFulfilled && <p>Data: {result}</p>}
    {isRejected && <p>Error: {error.message}</p>}
   </div>
  );
}
```

## Using the `usePromiseData` Hook

The `usePromiseData` hook is designed to be used within components that are children of the `Await` component. It grants access to the promise state values.

### Accessing Promise State

Use the `usePromiseData` hook within a child component of `Await` to access promise state values:

```javascript
import { usePromiseData } from 'rc-extended';

function AwaitContent() {
  const { isPending, isFulfilled, isRejected, result, error } = usePromiseData();

  return (
   <div>
    {isPending && <p>Loading...</p>}
    {isFulfilled && <p>Data: {result}</p>}
    {isRejected && <p>Error: {error.message}</p>}
   </div>
  );
}
```

## API Reference

### `Await` Component

#### Props

- `promiseFn: (controller: AbortController) => Promise<T>`
  - A function that returns a promise to be awaited. It receives an `AbortController` as an argument.
- `children: ReactNode`
  - The content to be rendered while awaiting the promise.

#### Returns

- `JSX.Element`
  - The JSX for the `Await` component.

### `usePromiseData` Hook

The `usePromiseData` hook provides access to the state of the promise being awaited by the `Await` component.

#### `usePromiseData` Returns

- `isPending: boolean`
  - Indicates if the promise is still pending.
- `isFulfilled: boolean`
  - Indicates if the promise has been fulfilled.
- `isRejected: boolean`
  - Indicates if the promise has been rejected.
- `result: T | null`
  - The result of the fulfilled promise.
- `error: Error | null`
  - The error object if the promise was rejected.

## Conclusion

By correctly utilizing the `Await` component and the `usePromiseData` hook, you can effectively manage asynchronous operations and handle promise states in your React application. This approach ensures your code remains organized and maintains separation of concerns.
