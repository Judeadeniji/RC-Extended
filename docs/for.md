I apologize for missing that important update in the documentation. To reflect the support for using a function as a child of the `For` component, let's update the documentation accordingly:

```markdown
# `For` Component Documentation

## Introduction

The `For` component simplifies the process of iterating over an array and rendering a child component for each item. This documentation provides comprehensive guidance on the `For` component, including its purpose, usage, and customization options.

## Import Statements

To get started, import the `For` component:

```javascript
import { For } from 'rc-extended';
```

## Usage

The `For` component's primary usage is to iterate over an array and render a specified child component for each item. It offers two approaches for rendering:

### Approach 1: Render Using Child Component

Here's how you can use the `For` component to render a child component for each item in an array:

1. **Provide an Array**: Pass an array of items you want to iterate over using the `each` prop.

```javascript
const items = ['Apple', 'Banana', 'Orange', 'Grapes'];

<For each={items}>
  {/* Child component */}
</For>
```

2. **Specify Child Component**: Insert the child component you want to render for each item as the child of the `For` component.

```javascript
const items = ['Apple', 'Banana', 'Orange', 'Grapes'];

<For each={items}>
  <ListItemComponent />
</For>
```

3. **Customize `item` and `index` Props (Optional)**: You can customize the prop names used for `item` and `index` within the child component. By default, they are `item` and `index`, but you can rename them using the `item` and `index` props within the child component.

```javascript
function ListItemComponent({ fruit, position }) {
  return <li>{fruit} (Position: {position})</li>;
}
```

To use custom prop names:

```javascript
<For each={items}>
  <ListItemComponent item="fruit" index="position" />
</For>
```

4. **Add Additional Props (Optional)**: You can also add extra props to the child component as needed.

```javascript
<For each={items}>
  <ListItemComponent item="customItemName" index="customIndexName" {...props} />
</For>
```

### Approach 2: Render Using Function Child

Alternatively, you can use a function as a child of the `For` component to receive the item and index as arguments. This approach is particularly useful when you need more control over rendering. Here's how:

1. **Provide an Array**: Pass an array of items you want to iterate over using the `each` prop.

```javascript
const items = ['Apple', 'Banana', 'Orange', 'Grapes'];

<For each={items}>
  {/* Child function */}
</For>
```

2. **Use Function as Child**: Insert a function as the child of the `For` component. This function will receive the current item and index as arguments.

```javascript
const items = ['Apple', 'Banana', 'Orange', 'Grapes'];

<For each={items}>
  {(item, index) => (
    // Render your elements using item and index
    <div key={index}>{item}</div>
  )}
</For>
```

3. **Result**: The function child will be called for each item in the array, allowing you to customize rendering based on the item and index.

## Example Usage

### Example 1: Customized Prop Names

Consider a scenario where you want to customize the prop names for `item` and `index`. Here's how you can do it:

```javascript
import { For } from 'rc-extended';

const fruits = ['Apple', 'Banana', 'Orange', 'Grapes'];

<For each={fruits}>
  <ListItemComponent item="fruit" index="position" />
</For>
```

In this example, the `ListItemComponent` will receive `fruit` as the item's name prop and `position` as the index prop.

```javascript
function ListItemComponent({ fruit, position }) {
  return <li>{fruit} (Index: {position})</li>;
}
```

### Example 2: Customized Prop Names with Additional Props

You can also customize prop names and add extra props simultaneously:

```javascript
import { For } from 'rc-extended';

const fruits = ['Apple', 'Banana', 'Orange', 'Grapes'];

<For each={fruits}>
  <ListItemComponent item="fruit" index="position" {...props} />
</For>
```

In this case, the `ListItemComponent` will receive `fruit` as the item's name prop, `position` as the index prop, and any other additional prop.

```javascript
function ListItemComponent({ fruit, position, ...props }) {
  return <li>{fruit} (Index: {position}) - isFavorite: {props.isFav(fruit)}</li>;
}
```

### Example 3: Default `item` and `index` Props

If you don't specify custom prop names, the `For` component will use `item` and `index` as the default prop names:

```javascript
import { For } from 'rc-extended';

const fruits = ['Apple', 'Banana', 'Orange', 'Grapes'];

<For each={fruits}>
  <ListItemComponent />
</For>
```

The `ListItemComponent` will receive `item` as the item's name prop and `index` as the index prop by default.

```javascript
function ListItemComponent({ item, index }) {
  return <li>{item} (Index: {index})</li>;
}
```

### Example 4: Using Signals with `For` component

```javascript
import { For } from "rc-extended"
import { signal } from "rc-extended/store"

const fruits = signal(['Apple', 'Banana', 'Orange', 'Grapes']);

// $each is used to signify that the prop value is a signal
<For $each={fruits}>
  {/* Render your fruits */}
</For>
```

## Error Handling

The `For` component includes robust error handling to ensure proper usage. It checks for the following:

1. **Single Child Component or Function**: It verifies that either a single child component or a function is provided within the `For` component.

2. **Array Prop**: It checks that the `each` prop is an array.

Any violations of these checks will result in an error.

## Conclusion

The `For` component streamlines the process of rendering repetitive components by managing the iteration logic for you. This promotes cleaner, more readable code while ensuring correct usage. Customize prop names, add additional props, and tailor your component rendering to your specific needs with ease.