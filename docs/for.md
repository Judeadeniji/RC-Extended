# For Component Documentation

## Overview

The `For` component is a versatile React component designed to iterate over various types of data sources and render a child component or function for each item in the data source. It supports arrays, maps, sets, form data, generators, and other iterable objects.

## Table of Contents

1. Installation
2. [Import Statements](#import-statements)
3. Usage
    - [Basic Usage](#basic-usage)

4. [API Reference](#api-reference)
    - [ForProps Interface](#forprops-interface)
    - [Each Type](#each-type)
    - $Each Type

5. Conclusion

## Installation

To use the `For` component, ensure you have the necessary dependencies installed:

```bash
npm install react rc-extended
```

## Import Statements

Begin by importing the necessary components and types:

```javascript
import React, { Component, ReactNode } from "react";
import { Signal } from "rc-extended/store";
```

## Usage

### Basic Usage

Wrap the `For` component around any child component or function that you want to render for each item in the data source:

```javascript
<For each={data}>
  {(item, index) => <YourComponent key={index} item={item} index={index} />}
</For>
```

## API Reference

### ForProps Interface

The `ForProps` interface defines the properties that can be passed to the `For` component.

```typescript
interface ForProps<T> {
  each?: Each<T>;
  $each?: $Each<T>;
  children:
   | React.ReactElement<any, any> & {
      props: T extends T[]
       ? { item: T[number]; index: number }
       : T extends Map<any, T>
       ? { item: T; index: string }
       : T extends Set<T>
       ? { item: T; index: number }
       : { item: T; index: string };
    }
   | ((item: T, index: T extends T[] ? number : string) => ReactNode);
}
```

#### Properties

- `each?: Each<T>`: The iterable data source. It can be an array, map, set, form data, generator, or any other iterable object.
- `$each?: $Each<T>`: The Signal data source.
- `children`: The child component or function to render for each item in the data source. It can be a React element with specific props or a function that receives the item and index as arguments and returns a React node.

### Each Type

The `Each` type defines the possible data sources that can be iterated over by the `For` component.

```typescript
type Each<T> =
  | T[]
  | Map<any, T>
  | Set<T>
  | FormData
  | Generator<T, void, unknown>
  | Iterable<T>
  | { [key: string]: T };
```

### $Each Type

The `$Each` type defines the Signal data source that can be used by the `For` component.

```typescript
type $Each<T> = Signal<Each<T>>;
```

## Conclusion

The `For` component is a powerful tool for iterating over various types of data sources in React applications. By using this component, you can easily render child components or functions for each item in the data source, ensuring a flexible and efficient way to handle dynamic data rendering.
