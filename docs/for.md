
# `For` Component Documentation

## Introduction

The `For` component simplifies iterating over an array and rendering a child component for each item. This documentation provides in-depth insight into the `For` component, including its purpose, usage, and error handling.

## Import Statements

To get started, import the `For` component:

```javascript
import { For } from 'rc-ectended';
```

## Usage

The `For` component's primary usage is to iterate over an array and render a specified child component for each item. Here's how you can use it:

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

3. **Access `item` and `index`**: Inside the child component, you can access the current item and its index using the `item` and `index` props.

```javascript
function ListItemComponent({ item, index }) {
  return <li>{item} (Index: {index})</li>;
}
```

4. **Result**: The `ListItemComponent` will be rendered for each item in the array, displaying the item's name and its index.

## Example Usage

Consider rendering a list of items using a custom `ListItemComponent`. Here's how you would implement it:

```javascript
const items = ['Apple', 'Banana', 'Orange', 'Grapes'];

<For each={items}>
  <ListItemComponent />
</For>
```

The `ListItemComponent` will be rendered for each item in the `items` array. The `item` prop will contain the current item's value, and the `index` prop will provide the item's index.

## Error Handling

The `For` component includes robust error handling to ensure proper usage. It checks for the following:

1. **Single Child Component**: It verifies that only a single child component is provided within the `For` component.

2. **Array Prop**: It checks that the `each` prop is an array.

Any violations of these checks will result in an error.

## Conclusion

The `For` component streamlines the process of rendering repetitive components by managing the iteration logic for you. This promotes cleaner, more readable code while ensuring correct usage.
