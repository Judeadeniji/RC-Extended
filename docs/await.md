# `Await` Component and `usePromiseData` Hook Usage Documentation

The `Await` component, in conjunction with the `usePromiseData` hook, offers a seamless way to handle asynchronous operations and manage promise states in your React application. This documentation provides a comprehensive guide to their proper usage.

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

## Conclusion

By correctly utilizing the `Await` component and the `usePromiseData` hook, you can effectively manage asynchronous operations and handle promise states in your React application. This approach ensures your code remains organized and maintains separation of concerns.