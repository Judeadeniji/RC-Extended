# Documentation for the rc-extended `Show` Component

The `Show` component, part of the `rc-extended` package, serves as a versatile tool for implementing conditional rendering within your React applications. It grants you the ability to display content based on specific conditions, giving you the freedom to design your UI elements with precision.

## How to Use

To utilize the `Show` component, begin by importing it from the `rc-extended` package and then incorporate it into your React components.

```jsx
import { Show } from 'rc-extended';

// ...

<Show when={someCondition} fallback={<p>Fallback</p>}>
  <div>Content</div>
</Show>
```

Alternatively, you can employ a function as the child to conditionally render content:

```jsx
<Show when={someCondition} fallback={null}>
  {() => <SomeComponent />}
</Show>
```

## Available Props

The `Show` component offers the following props:

- `when` (unknown, required): This prop represents the condition that determines whether the content should be rendered. When `when` evaluates to `true`, the specified content is rendered; otherwise, the fallback content is displayed.
- `fallback` (ReactNode, optional, default: `null`): Use this prop to define fallback content to be rendered when the condition is not met.
- `children` (ReactNode or function, required): Define the content to render when the condition is satisfied.

## Illustrative Examples

Example 1: Rendering a specific component when a condition is met:

```jsx
<Show when={isLoggedIn} fallback={<LoginButton />}>
  <UserProfile />
</Show>
```

Example 2: Utilizing a function to render dynamic content based on the condition:

```jsx
<Show when={showMessage} fallback={<p>No Messages Yet.</p>}>
  {() => <MessageBanner />}
</Show>
```

## In Conclusion

The `Show` component, part of the `rc-extended` package, streamlines the process of implementing conditional rendering within your React applications. Its versatility in handling both components and functions as children empowers you to create dynamic and responsive UIs effortlessly.