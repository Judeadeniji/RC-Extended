# rc-extended If Component (deprecated)

The `If` component from the `rc-extended` package is a powerful utility that facilitates conditional rendering in your React applications. It allows you to render content based on a specified condition, offering flexibility in how you display your UI elements.

## Usage

Import the `If` component from the `rc-extended` package and use it in your React components.

```jsx
import { If } from 'rc-extended';

// ...

<If condition={someCondition} fallback={<p>Fallback</p>}>
  <div>Content</div>
</If>
```

You can also use a function as the child to conditionally render content:

```jsx
<If condition={someCondition} fallback={null}>
  {() => <SomeComponent />}
</If>
```

## Props

The `If` component accepts the following props:

- `condition` (unknown, required): The condition to evaluate for rendering. If it resolves to `true`, the content is rendered; otherwise, the fallback is rendered.
- `fallback` (ReactNode, optional, default: `null`): The fallback content to render when the condition is not met.
- `children` (ReactNode or function, required): The content to render when the condition is met.

## Examples

Render a specific component when a condition is met:

```jsx
<If condition={isLoggedIn} fallback={<LoginButton />}>
  <UserProfile />
</If>
```

Use a function to render dynamic content based on the condition:

```jsx
<If condition={showMessage} fallback={<p>No Messages Yet.</p>}>
  {() => <MessageBanner />}
</If>
```

## Conclusion

The `If` component from the `rc-extended` package simplifies conditional rendering in your React applications and has been deprecated in favor of `Show`. With its flexibility in handling both components and functions as children, you can create dynamic UIs with ease.