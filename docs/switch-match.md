# Switch Component Documentation

## Overview
The Switch component is a versatile utility in React that enables conditional rendering of its child components based on specific conditions. It simplifies the process of rendering content when specific conditions are met, making your React code more readable and maintainable.

## Switch Component

### Props

The Switch component accepts the following props:

1. `fallback` (Type: `ReactNode`): The fallback content to render when no condition matches.
2. `children` (Type: `ReactNode | ReactNode[]`): Child components representing conditions and content.

### Usage

The Switch component conditionally renders its children based on the first matching condition. Here's an example of how to use it:

```javascript
<Switch fallback={<div>No condition matched</div>}>
  <Match when={condition1}>
    <div>Content for Condition 1</div>
  </Match>
  <Match when={condition2}>
    <div>Content for Condition 2</div>
  </Match>
  {/* Add more Match components for additional conditions */}
</Switch>
```

In this example, the `Switch` component will render the content of the first `Match` component whose `when` prop evaluates to `true`. If no conditions match, it will render the `fallback` content.

## Match Component

### Props

The Match component accepts the following props:

1. `when` (Type: `boolean`): The condition to match for rendering the children.
2. `children` (Type: `ReactNode | ReactNode[]`): The content to render when the condition is true.

### Usage

The Match component is used within the Switch component to specify conditions and the content to render when those conditions are met. Here's an example:

```javascript
<Match when={condition1}>
  <div>Content for Condition 1</div>
</Match>
```

In this example, the content within the `Match` component will only be rendered if `condition1` evaluates to `true`.

## Complete Example

Here's a complete example demonstrating how to use the Switch and Match components together:

```javascript
import React from 'react';
import { Switch, Match } from 'rc-extended';

function MyComponent({ condition1, condition2 }) {
  return (
    <Switch fallback={<div>No condition matched</div>}>
      <Match when={condition1}>
        <div>Content for Condition 1</div>
      </Match>
      <Match when={condition2}>
        <div>Content for Condition 2</div>
      </Match>
    </Switch>
  );
}

export default MyComponent;
```

This example illustrates how to conditionally render content based on specific conditions using the Switch and Match components.

## Conclusion

The Switch component simplifies conditional rendering in React applications, enhancing code readability and maintainability. By following this documentation, you can effectively utilize the Switch and Match components to handle various conditional rendering scenarios in your React projects.