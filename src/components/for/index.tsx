/**
 * @typedef {import("react").ReactElement} ReactElement
 * @typedef {import("react").ReactNode} ReactNode
 * @template T
 */
import React, { Component, ReactNode } from "react";

/**
 * @typedef {import("../store").Signal} Signal
 * @template T
 */
import { Signal } from "../../store";

/**
 * Props for the `For` component.
 * @template T
 * @typedef {Object} ForProps
 * @property {T[] | Map<any, T> | Set<T> | FormData | Generator<T, void, unknown> | Iterable<T> | { [key: string]: T }} [each] - The iterable data source.
 * @property {Signal<T[] | Map<any, T> | Set<T> | FormData | Generator<T, void, unknown> | Iterable<T> | { [key: string]: T }>} [$each] - The Signal data source.
 * @property {(ReactElement & { props: T extends T[] ? { item: T[number]; index: number } : T extends Map<any, T> ? { item: T; index: string } : T extends Set<T> ? { item: T; index: number } : { item: T; index: string } }) | ((item: T, index: T extends T[] ? number : string) => ReactNode)} children - The child component or function to render for each item in the data source.
 */

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

type $Each<T> = Signal<Each<T>>
  
type Each<T> =
    | T[]
    | Map<any, T>
    | Set<T>
    | FormData
    | Generator<T, void, unknown>
    | Iterable<T>
    | { [key: string]: T } // Add support for plain objects

/**
 * Props for the `For` component with exclusive `each` or `$each` usage.
 * @template T
 * @typedef {Object} ExclusiveEachProps
 * @property {T[] | Map<any, T> | Set<T> | FormData | Generator<T, void, unknown> | Iterable<T> | { [key: string]: T }} each - The iterable data source (mutually exclusive with `$each`).
 * @property {never} [$each] - The Signal data source (mutually exclusive with `each`).
 */
type ExclusiveEachProps<T> =
  | { each: T[] | Map<any, T> | Set<T> | FormData | Generator<T, void, unknown> | Iterable<T> | { [key: string]: T }; $each?: never }
  | { $each: Signal< T[] | Map<any, T> | Set<T> | FormData | Generator<T, void, unknown> | Iterable<T> | { [key: string]: T }>; each?: never };


/**
 * Props for the `For` component that combine both `ForProps` and `ExclusiveEachProps`.
 * @template T
 * @typedef {ForProps<T> & ExclusiveEachProps<T>} ExclusiveForProps
 */
type ExclusiveForProps<T> = ForProps<T> & ExclusiveEachProps<T>;

/**
 * Props for the child component rendered by `For`.
 * @template T
 * @typedef {Object} ForChildComponentProps
 * @property {{ item: T[number]; index: number } | { item: T; index: string }} item - The item and its index in the iterable.
 */
type ForChildComponentProps<T> = T extends T[]
    ? { item: T[number]; index: number }
    : T extends Map<any, T>
    ? { item: T; index: string }
    : T extends Set<T>
    ? { item: T; index: number }
    : { item: T; index: string };

    
// type PropType = typeof base

// const base = {
//   item: "shoe",
//   index: "ssn",
// } as const

// type ValueOf<T> = T[keyof T]

// type Constructed<T, V> = {
//   [K in ValueOf<PropType>]: K extends PropType["item"] ? T : K extends PropType["index"] ? V : any
// }

// const outprops: Constructed<string, number> = {
//  shoe: "hi",
//  ssn: 4567,
// }

/**
 * The `For` component for rendering items from an iterable.
 *
 * @component
 * @example
 * // Renders a list of names using the <NameItem> component for each name in the array.
 * <For each={names}>
 *   <NameItem />
 * </For>
 *
 * // Renders a list of key-value pairs using the <KeyValuePair> component for each pair in the object.
 * <For each={myObject}>
 *   {(value, key) => <KeyValuePair key={key} value={value} />}
 * </For>
 *
 * @template T
 * @extends {Component<ExclusiveForProps<T>>}
 */
class For<T> extends Component<ExclusiveForProps<T>> {
  private unsubscribe: () => void;
  declare state: {
    [key: string]: any
  }
  /**
   * Constructor for the `For` component.
   * @param {ExclusiveForProps<T>} props - The component props.
   */
  constructor(public readonly props: ExclusiveForProps<T>) {
    super(props);
    this.props = props;
    this.state = {};
    this.unsubscribe = () => {};
    if (this.props.$each && this.props.$each instanceof Signal) {
      this.state = {
        signal: this.props.$each.value,
      };
    }
  }

  componentDidMount() {
    const { each, $each } = this.props;
    if (
      each &&
      !Array.isArray(each) &&
      !(each instanceof Map) &&
      !(each instanceof Set) &&
      !(each instanceof FormData) &&
      !(isGenerator(each)) &&
      !isIterable(each) && // Custom iterable detection
      !isObject(each) // Check if it's a plain object
    ) {
      throw new Error(
        "each prop must be an array, Map, Set, FormData, Generator, iterable, or plain object <For each={[...]}> or <For each={{...}}>."
      );
    }
    let peek: Each<T>;
    if (
      $each &&
      $each instanceof Signal && (peek = $each.peek()) &&
      !(
        Array.isArray(peek) ||
        peek instanceof Map ||
        peek instanceof Set ||
        peek instanceof FormData ||
        isGenerator(peek) ||
        isIterable(peek) || // Custom iterable detection
        isObject(peek) // Check if it's a plain object
      )
    ) {
      throw new Error(
        "$each must be a signal prop with value which must be an array, Map, Set, FormData, Generator, iterable, or plain object <For $each={Signal([...])}> or <For each={Signal({...})}>."
      );
    }

    if ($each) {
      this.unsubscribe = $each.subscribe((newState) => {
        this.setState({
          signal: newState,
        });
      });
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  render(): React.JSX.Element {
    const { each, $each, children } = this.props;
    
    if ($each && typeof children === "function") {
      return <>{this.renderWithSignal(children, true)}</>;
    }

    if ($each) {
      return <>{this.renderWithSignal(children, false)}</>;
    }

    if (each && typeof children === "function") {
      return <>{this.renderUsingFunction(each, children)}</>;
    }

    if (Array.isArray(children) || !React.isValidElement(children)) {
      throw new Error("Only provide one valid child element or function to <For> component");
    }

    return <>{this.renderUsingChildComponent(each, children)}</>;
  }

  private renderWithSignal(children: any, isFn: boolean) {
    if (!this.state.signal) {
      throw new ReferenceError("$each is not Defined");
    }

    if (isFn) {
      return this.renderUsingFunction(this.state.signal, children);
    }

    return this.renderUsingChildComponent(this.state.signal, children);
  }

  private renderUsingFunction(
    each: T[] | Map<any, T> | Set<T> | FormData | Generator<T, void, unknown> | Iterable<T> | { [key: string]: T },
    renderFunction: Function
  ) {
    if (Array.isArray(each)) {
      return this.renderArrayUsingFunction(each, renderFunction);
    } else if (each instanceof Map) {
      return this.renderMapUsingFunction(each, renderFunction);
    } else if (each instanceof Set) {
      return this.renderSetUsingFunction(each, renderFunction);
    } else if (each instanceof FormData) {
      return this.renderFormDataUsingFunction(each, renderFunction);
    } else if (isGenerator(each)) {
      return this.renderGeneratorUsingFunction(each as Generator<T, void, unknown>, renderFunction);
    } else if (isIterable(each)) {
      return this.renderIterableUsingFunction(each as Iterable<T>, renderFunction);
    } else if (isObject(each)) {
      return this.renderObjectUsingFunction(each as { [key: string]: T }, renderFunction); // Render plain objects
    } else {
      throw new Error("Unsupported iterable type");
    }
  }

  private renderArrayUsingFunction(each: T[], renderFunction: Function) {
    const renderedChildren: React.ReactNode[] = [];
    for (let index = 0; index < each.length; index++) {
      const item = each[index];
      const renderedChild = renderFunction(item, index);
      renderedChildren.push(
        React.isValidElement(renderedChild)
          ? React.cloneElement(renderedChild, { key: index })
          : renderedChild
      );
    }
    return renderedChildren;
  }

  private renderMapUsingFunction(each: Map<any, T>, renderFunction: Function) {
    const renderedChildren: React.ReactNode[] = [];
    each.forEach((item, key) => {
      const renderedChild = renderFunction(item, key);
      renderedChildren.push(
        React.isValidElement(renderedChild)
          ? React.cloneElement(renderedChild, { key })
          : renderedChild
      );
    });
    return renderedChildren;
  }

  private renderSetUsingFunction(each: Set<T>, renderFunction: Function) {
    const renderedChildren: React.ReactNode[] = [];
    let index = 0;
    each.forEach((item) => {
      const renderedChild = renderFunction(item, index++);
      renderedChildren.push(
        React.isValidElement(renderedChild)
          ? React.cloneElement(renderedChild, { key: index })
          : renderedChild
      );
    });
    return renderedChildren;
  }

  private renderFormDataUsingFunction(each: FormData, renderFunction: Function) {
    const renderedChildren: React.ReactNode[] = [];
    let index = 0;
    each.forEach((value, key) => {
      const renderedChild = renderFunction(value, key);
      renderedChildren.push(
        React.isValidElement(renderedChild)
          ? React.cloneElement(renderedChild, { key })
          : renderedChild
      );
    });
    return renderedChildren;
  }

  private renderGeneratorUsingFunction(each: Generator<T, void, unknown>, renderFunction: Function) {
    const renderedChildren: React.ReactNode[] = [];
    let index = 0;
    for (const item of each) {
      const renderedChild = renderFunction(item, index++);
      renderedChildren.push(
        React.isValidElement(renderedChild)
          ? React.cloneElement(renderedChild, { key: index })
          : renderedChild
      );
    }
    return renderedChildren;
  }

  private renderIterableUsingFunction(each: Iterable<T>, renderFunction: Function) {
    const renderedChildren: React.ReactNode[] = [];
    let index = 0;
    for (const item of each) {
      const renderedChild = renderFunction(item, index++);
      renderedChildren.push(
        React.isValidElement(renderedChild)
          ? React.cloneElement(renderedChild, { key: index })
          : renderedChild
      );
    }
    return renderedChildren;
  }

  private renderObjectUsingFunction(each: { [key: string]: T }, renderFunction: Function) {
    const renderedChildren: React.ReactNode[] = [];
    const keys = Object.keys(each);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = each[key];
      const renderedChild = renderFunction(item, key);
      renderedChildren.push(
        React.isValidElement(renderedChild)
          ? React.cloneElement(renderedChild, { key })
          : renderedChild
      );
    }
    return renderedChildren;
  }
  
  private renderUsingChildComponent(
    each:
      | T[]
      | Map<any, T>
      | Set<T>
      | FormData
      | Generator<T, void, unknown>
      | Iterable<T>
      | { [key: string]: T },
    childComponent: React.ReactElement<any, any>
  ) {
    if (Array.isArray(each)) {
      return this.renderArrayUsingChildComponent(each, childComponent);
    } else if (each instanceof Map) {
      return this.renderMapUsingChildComponent(each, childComponent);
    } else if (each instanceof Set) {
      return this.renderSetUsingChildComponent(each, childComponent);
    } else if (each instanceof FormData) {
      return this.renderFormDataUsingChildComponent(each, childComponent);
    } else if (isGenerator(each)) {
      return this.renderGeneratorUsingChildComponent(each as Generator<T, void, unknown>, childComponent);
    } else if (isIterable(each)) {
      return this.renderIterableUsingChildComponent(each as Iterable<T>, childComponent);
    } else if (isObject(each)) {
      return this.renderObjectUsingChildComponent(each as { [key: string]: T }, childComponent); // Render plain objects
    } else {
      throw new Error("Unsupported iterable type");
    }
  }

  private renderArrayUsingChildComponent(each: T[], childComponent: React.ReactElement<any, any>) {
    const renderedChildren: React.ReactNode[] = [];
    for (let index = 0; index < each.length; index++) {
      const item = each[index];
      const renderedChild = (
        <childComponent.type
          {...{
            ...childComponent.props,
            [childComponent.props?.item || "item"]: item,
            [childComponent.props?.index || "index"]: index,
          }}
        />
      );
      renderedChildren.push(
        React.cloneElement(renderedChild, { key: index })
      );
    }
    return renderedChildren;
  }

  private renderMapUsingChildComponent(each: Map<any, T>, childComponent: React.ReactElement<any, any>) {
    const renderedChildren: React.ReactNode[] = [];
    each.forEach((item, key) => {
      const renderedChild = (
        <childComponent.type
          {...{
            ...childComponent.props,
            [childComponent.props?.item || "item"]: item,
            [childComponent.props?.index || "index"]: key,
          }}
        />
      );
      renderedChildren.push(
        React.cloneElement(renderedChild, { key })
      );
    });
    return renderedChildren;
  }

  private renderSetUsingChildComponent(each: Set<T>, childComponent: React.ReactElement<any, any>) {
    const renderedChildren: React.ReactNode[] = [];
    let index = 0;
    each.forEach((item) => {
      const renderedChild = (
        <childComponent.type
          {...{
            ...childComponent.props,
            [childComponent.props?.item || "item"]: item,
            [childComponent.props?.index || "index"]: index++,
          }}
        />
      );
      renderedChildren.push(
        React.cloneElement(renderedChild, { key: index })
      );
    });
    return renderedChildren;
  }

  private renderFormDataUsingChildComponent(each: FormData, childComponent: React.ReactElement<any, any>) {
    const renderedChildren: React.ReactNode[] = [];
    let index = 0;
    each.forEach((value, key) => {
      const renderedChild = (
        <childComponent.type
          {...{
            ...childComponent.props,
            [childComponent.props?.item || "item"]: value,
            [childComponent.props?.index || "index"]: key,
          }}
        />
      );
      renderedChildren.push(
        React.cloneElement(renderedChild, { key })
      );
    });
    return renderedChildren;
  }

  private renderGeneratorUsingChildComponent(each: Generator<T, void, unknown>, childComponent: React.ReactElement<any, any>) {
    const renderedChildren: React.ReactNode[] = [];
    let index = 0;
    for (const item of each) {
      const renderedChild = (
        <childComponent.type
          {...{
            ...childComponent.props,
            [childComponent.props?.item || "item"]: item,
            [childComponent.props?.index || "index"]: index,
          }}
        />
      );
      renderedChildren.push(
        React.cloneElement(renderedChild, { key: index })
      );
      index++;
    }
    return renderedChildren;
  }

  private renderIterableUsingChildComponent(each: Iterable<T>, childComponent: React.ReactElement<any, any>) {
    const renderedChildren: React.ReactNode[] = [];
    let index = 0;
    for (const item of each) {
      const renderedChild = (
        <childComponent.type
          {...{
            ...childComponent.props,
            [childComponent.props?.item || "item"]: item,
            [childComponent.props?.index || "index"]: index,
          }}
        />
      );
      renderedChildren.push(
        React.cloneElement(renderedChild, { key: index })
      );
      index++;
    }
    return <>{renderedChildren}</>;
  }

  private renderObjectUsingChildComponent(each: { [key: string]: T }, childComponent: React.ReactElement<any, any>) {
    const renderedChildren: React.ReactNode[] = [];
    const keys = Object.keys(each);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = each[key];
      const renderedChild = (
        <childComponent.type
          {...{
            ...childComponent.props,
            [childComponent.props?.item || "item"]: item,
            [childComponent.props?.index || "index"]: key,
          }}
        />
      );
      renderedChildren.push(
        React.cloneElement(renderedChild, { key })
      );
    }
    return renderedChildren;
  }

}

const ForComponent = For as unknown as <T>(props: ExclusiveForProps<T>) => React.JSX.Element

// Export the For component and ForChildComponentProps type
export { ForComponent as For, ForChildComponentProps };

/**
 * Helper function to detect custom iterable objects.
 * @param {any} obj - The object to check for iterability.
 * @returns {boolean} - True if the object is iterable, false otherwise.
 */
function isIterable(obj: any): boolean {
  return Symbol.iterator in Object(obj);
}

/**
 * Helper function to detect plain objects.
 * @param {any} obj - The object to check for being a plain object.
 * @returns {boolean} - True if the object is a plain object, false otherwise.
 */
function isObject(obj: any): boolean {
  return Object.prototype.toString.call(obj) === "[object Object]";
}

/**
 * Helper function to detect Generator functions.
 * @template T
 * @param {any} value - The value to check for being a Generator function.
 * @returns {value is Generator<T, void, unknown>} - True if the value is a Generator function, false otherwise.
 */
function isGenerator<T>(value: any): value is Generator<T, void, unknown> {
  return typeof value === 'function' && value.constructor?.name === 'GeneratorFunction';
}


