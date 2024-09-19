
# rc-extended

## Cybernetically enhanced Components and Hooks for React

![Version](https://img.shields.io/npm/v/rc-extended)
![License](https://img.shields.io/npm/l/rc-extended)

## Elevate Your React Game

**rc-extended** isn't just your average React library. It's a turbocharged toolkit for React development that takes your coding experience to the next level.

## Unleash the Superpowers

With **rc-extended**, you get more than just syntax sugar. We're talking about a plethora of features designed to supercharge your React projects.

### Awaiting Promises in Markup 🚀

```javascript
<Await promiseFn={buyRing}>
  <DateComponent />
</Await>
```

Where `DateComponent` is a child component using the `usePromiseData` hook:

```javascript
import { usePromiseData } from 'rc-extended';

function DateComponent() {
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


No more promises left hanging! The **Await** component lets you resolve promises directly in your markup. Say goodbye to callback hell.

### Looping with Ease 🔄

```javascript
import { For } from "rc-extended"
import { signal } from "rc-extended/store"

const fruits = signal(['Apple', 'Banana', 'Orange', 'Grapes']);

// $each is used to signify that the prop value is a signal
<For $each={fruits}>
  {(fruit, i) => (
    <div key={i}>{item}</div>
  )}
</For>
```

Meet **For**, your loop master. It effortlessly loops over arrays and objects, sending data to children while handling replication automatically. Say hello to cleaner and more efficient rendering.

### Control Flow with Style 🎮

```javascript
<Switch fallback={<div>No condition matched</div>}>
  <Match when={condition1}>
    <div>Content for Condition 1</div>
  </Match>
  <Match when={condition2}>
    <div>Content for Condition 2</div>
  </Match>
</Switch>
```


We introduce **Switch** and **Match** components, inspired by SolidJS. Control flow in JSX, like you've never seen before. It's like JavaScript switch case, but with a JSX twist.

### Asynchronous Component Resolution 🌐

Behold, the impossible made possible! The **Resolve** component resolves asynchronous client components. Your mind will be blown.

### And So Much More... 💥

**rc-extended** is a treasure trove of features waiting to be discovered. We're talking supercharged hooks like **useAsync**, **useFetch**, and **useTimeout**. Our helpers like **sleep** and **setReturn** do the heavy lifting so you can code smarter, not harder.

## Getting Started

Ready to experience the next level of React development? It's as easy as:

```bash
npm install rc-extended
# or
yarn add rc-extended
```

Dive into the [rc-extended Documentation](https://github.com/Judeadeniji/rc-extended/tree/main/docs) to explore the full potential of this powerhouse library. Be prepared to uncover even more features that will revolutionize your React projects.

## Contribution Friendly

Feel like contributing your own superpowers to **rc-extended**? Check out our [Contribution Guidelines](CONTRIBUTING.md) to get started.

## License

**rc-extended** is open-source and licensed under the [MIT License](LICENSE).

## Elevate Your React Development with rc-extended

Don't wait! Get started today and discover the new heights you can reach with **rc-extended**.
