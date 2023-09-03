# Dynamic Component Documentation

The `Dynamic` component is a React component designed to render other components or native HTML elements dynamically based on the provided props.

## Props

### `component` (required)

- Type: `React.ComponentType<any> | string`
- Description: This prop specifies the component or native element type that the `Dynamic` component will render dynamically. It can be either a React component type (e.g., `SomeComponent`) or an HTML element type (e.g., `"div"`).

### `props`

- Type: `Record<string, any>`
- Default: `{}` (an empty object)
- Description: This prop allows you to provide additional props that will be passed to the dynamically rendered component or element. It should be an object where each key represents a prop name, and the corresponding value is the prop's value.

## Usage

To use the `Dynamic` component, you need to import it and include it in your React application. You can specify the component or element type you want to render dynamically using the `component` prop and provide any additional props using the `props` prop.

Here's an example of how to use the `Dynamic` component:

```jsx
import React from "react";
import { Dynamic } from "rc-extended";

function App() {
  return (
    <div>
      <h1>Dynamic Component Example</h1>
      <Dynamic component="div" props={{ className: "dynamic-element", children: "Hello, World!" }} />
      <Dynamic component={SomeComponent} props={{ prop1: "value1", prop2: "value2" }} />
    </div>
  );
}

export default App;
```

### A similar docs from [`SolidJs`](https://www.solidjs.com/tutorial/flow_dynamic)

The `<Dynamic>`` tag is useful when you render from data. It lets you pass either a string for a native element or a component function and it will render that with the rest of the provided props.

This is often more compact than writing a number of `<Show>` or `<Switch>` components.

In the example, we can replace the `<Switch>` statement:

```javascript
<Switch fallback={<BlueThing />}>
  <Match when={selected() === 'red'}><RedThing /></Match>
  <Match when={selected() === 'green'}><GreenThing /></Match>
</Switch>
```

with:

```javascript
<Dynamic component={options[selected()]} />
```

## Notes

- The `Dynamic` component is particularly useful when you need to conditionally render different components or elements based on certain conditions in your application.
- Make sure that the `component` prop is provided with a valid component type or HTML element string.
- The `Dynamic` component simply renders the specified component or element with the provided props. It doesn't handle any internal logic or state management for the rendered component.