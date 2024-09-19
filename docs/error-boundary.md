# ErrorBoundary Component Documentation

## Overview

The `ErrorBoundary` component is a React component that acts as an error boundary, catching errors in its child components. It provides a way to handle errors gracefully and display fallback UI when an error occurs.

## Table of Contents

1. Installation
2. [Import Statements](#import-statements)
3. Usage
    - [Basic Usage](#basic-usage)
4. [API Reference](#api-reference)
    - [ErrorBoundary Props](#errorboundary-props)
    - [ErrorBoundary State](#errorboundary-state)
    - ErrorContext
5. Conclusion

## Installation

To use the `ErrorBoundary` component, ensure you have the necessary dependencies installed:

```bash
npm install react
```

## Import Statements

Begin by importing the necessary components and hooks:

```javascript
import React, { createContext, useContext } from "react";
import { Switch, Match } from "rc-extended/components";
import { Show } from "rc-extended/components";
```

## Usage

### Basic Usage

Wrap the `ErrorBoundary` component around any child components that you want to monitor for errors:

```javascript
<ErrorBoundary fallback={(error) => <div>Error: {error.message}</div>}>
  <YourComponent />
</ErrorBoundary>
```

## API Reference

### ErrorBoundary Props

The `ErrorBoundary` component accepts the following props:

- `children: React.ReactNode`
  - The child components to be monitored for errors.
- `fallback?: (error: Error | null) => React.ReactNode | React.ReactElement`
  - A function that returns the fallback UI to be displayed when an error occurs.
- `onError?: (error: Error, componentStack: string) => void`
  - A callback function that is called when an error is caught. It receives the error and the component stack as arguments.

### ErrorBoundary State

The `ErrorBoundary` component maintains the following state:

- `hasError: boolean`
  - Indicates whether an error has been caught.
- `error: Error | null`
  - The error object if an error has been caught.

### ErrorContext

The `ErrorContext` provides error information to child components. It can be accessed using the `useContext` hook:

```javascript
const errorState = useContext(ErrorContext);
```

## Conclusion

The `ErrorBoundary` component is a powerful tool for handling errors in React applications. By using this component, you can catch errors in your child components and display fallback UI, ensuring a better user experience.
