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
