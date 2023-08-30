# rc-extended If Component

The `If` component from the `rc-extended` package is a powerful utility that facilitates conditional rendering in your React applications. It allows you to render content based on a specified condition, offering flexibility in how you display your UI elements.

## Installation

You can install the `rc-extended` package using npm or yarn:

```bash
npm install rc-extended
```
or
```bash
yarn add rc-extended
```

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
// Using a function as child allows you to reuse your fallback.
<If condition={someCondition} fallback={null}>
  {(fallback) => <SomeComponent />}
</If>
```

## Props

The `If` component accepts the following props:

- `condition` (boolean, required): The condition to evaluate for rendering. If `true`, the content is rendered; otherwise, the fallback is rendered.
- `fallback` (ReactNode, optional, default: `null`): The fallback content to render when the condition is not met.
- `children` (ReactNode or function, required): The content to render when the condition is met. If provided as a function, it receives the fallback content as an argument.

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
  {(fallback) => <MessageBanner message={fallback} />}
</If>
```

## Conclusion

The `If` component from the `rc-extended` package simplifies conditional rendering in your React applications. With its flexibility in handling both components and functions as children, you can create dynamic UIs with ease.

For more information, refer to the [rc-extended documentation](https://github.com/Judeadeniji/rc-extended).
