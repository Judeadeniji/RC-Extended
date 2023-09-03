# `Resolve` Component Documentation

The `Resolve` component is a valuable addition to your React toolkit, designed to simplify the integration of asynchronous React components while gracefully managing resolution and fallbacks. This comprehensive documentation will guide you through effectively utilizing the `Resolve` component within your React applications.

## Introduction

The `Resolve` component empowers developers by facilitating the seamless inclusion of asynchronous React components in their applications. With dynamic component resolution and robust error handling, it enhances code maintainability and user experiences.

## Import Statements

To get started, you need to import the `Resolve` component into your codebase. Use the following import statement:

```javascript
import { Resolve } from 'rc-extended';
```

## Usage

The primary purpose of the `Resolve` component is to wrap your asynchronous child components, ensuring that they are dynamically resolved before rendering. This approach prevents UI blocking and ensures a smooth user experience.

## Available Props and Types

The `Resolve` component accepts the following props and types:

### `fallback` (Type: `ReactNode`)

- The `fallback` prop specifies the ReactNode to display if the resolution of the component fails. This can be any valid React element or content that you want to show when an error occurs during component resolution.

### `loading` (Type: `ReactNode`)

- The `loading` prop defines the ReactNode to display while the `Resolve` component is in the process of resolving the wrapped child component. It allows you to show a loading indicator or any content of your choice during this phase.

### `errFallback` (Type: `(error?: Error | null) => ReactNode`)

- The `errFallback` prop is a function that takes an optional `error` parameter of type `Error` or `null` and returns a ReactNode. It is used to specify the content to display if there's an error during the resolution of the component. You can customize the error message or display different content based on the error that occurred.

### `children` (Type: `ReactElement`)

- The `children` prop represents the ReactElement whose type will be resolved by the `Resolve` component. This is the asynchronous child component that you want to wrap and dynamically resolve. It should be a valid React element with its type.

### `invalidate` Prop for Child Components

When using the `Resolve` component, your child component (the one wrapped by `Resolve`) can accept a special prop called `invalidate`. Here's an explanation of the `invalidate` prop:

#### `invalidate` (Type: `Function`)

- The `invalidate` prop is a function that you can include in your child component to provide the ability to trigger a re-fetch or re-resolution of the component when called. It's a valuable tool for handling scenarios where you want to allow users to manually refresh or reattempt an operation that might have failed.

Here's how you can use the `invalidate` prop within your child component:

```jsx
// Child.js
async function Child({ invalidate }) {
  // Warning: Hooks do not work in asynchronous components
  // Do not use useState, useEffect, or other hooks here

  const fetchData = async () => {
    try {
      // Fetch data from a server
      const data = await fetchDataFromServer();
      // ...
    } catch (error) {
      // Handle any errors
      // Display an error message or take appropriate action
    }
  };

  return (
    <>
      {/* Display data */}
      {/* Display UI elements */}
      <button onClick={invalidate}>Refresh Data</button>
    </>
  );
}
```

**Warning**: hooks (such as `useState`, `useEffect`, etc.) should not be used in asynchronous components wrapped by the `Resolve` component. Hooks do not work as expected in asynchronous contexts, and using them here may lead to unexpected behavior. If you need to manage state or perform side effects, it's recommended to handle such logic outside the asynchronous component or in a separate synchronous child component that's not a child of an asynchronous component.

## Example Usage

Let's consider a practical scenario where you want to asynchronously fetch user data and display it using the `Resolve` component:

1. **Child Component Implementation**: Define an asynchronous child component responsible for fetching user data from a server and returning it. Here's an example:

```javascript
// Child.js
async function Child({ invalidate }) {
  const data = await fetchDataFromServer();
  return (
    <>
      {/* Display data */}
      {/* Display UI elements */}
      <button onClick={invalidate}>Refresh Data</button>
    </>
  );
}
```

2. **Using the `Resolve` Component**: Now, wrap the `Child` component with the `Resolve` component to ensure dynamic resolution. Here's how you can do it:

```javascript
import { Resolve } from 'rc-extended';
import Child from './Child.js';

function App() {
  return (
    <Resolve
      errFallback={(error) => (/*optional fallback UI if an error occurred*/)}
      loading={/*optional loading UI*/}
      fallback={/*optional fallback UI*/}
    >
      <Child />
    </Resolve>
  );
}
```

In this example, the `Resolve` component wraps the `Child` component. The `Resolve` component will automatically resolve the `Child` component's asynchronous operations and render the fetched data.

## Conclusion

The `Resolve` component offers a sophisticated yet straightforward solution for rendering asynchronous React components. By wrapping the child component and managing dynamic resolution, it streamlines code organization and enhances user experiences. Incorporate the `Resolve` component into your React projects to effortlessly handle asynchronous rendering and provide user-friendly options for refreshing or retrying operations.