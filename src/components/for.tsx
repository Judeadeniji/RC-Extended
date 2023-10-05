import React, { Component } from "react";
import { Signal } from "../store"

/**
 * Props for the For component.
 */
interface ForProps<T> {
  each?: T[] | { [key: string]: T };
  $each?: Signal<T[] | { [key: string]: T }>;
  children:
    | React.ReactElement<any, any> & {
        props: T extends T[] ? { item: T[number]; index: number } : { [key in keyof T]: T[key] };
      }
    | ((item: T, index: T extends T[] ? number : string) => React.ReactNode);
} 

// Add this type to enforce the exclusive presence of either 'each' or '$each'
type ExclusiveEachProps<T> = 
  ({ each: T[] | { [key: string]: any } } & { $each?: never }) | 
  ({ $each: Signal<T[] | { [key: string]: any }> } & { each?: never });

// Combine the two types to ensure exclusivity
type ExclusiveForProps<T> = ForProps<T> & ExclusiveEachProps<T>;

// Define a generic type for the child component's props
type ForChildComponentProps<T> = {
  item: {
    [key in keyof T]: T[key];
  },
  index: T extends any[] ? number : string
};


/**
 * Component that iterates over an array or object and renders a child component for each item.
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
 * @param {ExclusiveForProps} props - The props for the For component.
 * @param {T[] | { [key: string]: any }} props.each - An array or an object to iterate over.
 * @param {ReactElement} props.children - The child component to render for each item.
 * @returns {ReactNode[]} An array of rendered child components.
 * @throws {Error} If used incorrectly with multiple children or an invalid `each` prop.
 */
class For<T> extends Component<ExclusiveForProps<T>> {
  public props: ExclusiveForProps<T>
  public state: { signal?: T[] | { [key: string]: any } }
  //@ts-ignore
  private unsubscribe: () => void
  constructor(props: ExclusiveForProps<T>) {
    super(props)
    this.props = props;
    this.state = {};
    this.unsubscribe = () => {}
    if(this.props.$each && this.props.$each instanceof Signal) {
      this.state = {
        signal: this.props.$each.value
      }
    }
  }
  
  componentDidMount() {
    const { each, $each } = this.props;
    if (each && !Array.isArray(each) && !this.isObject(each)) {
      throw new Error("each prop must be an array or an object <For each={[...]}> or <For each={{...}}>.");
    }
    if ($each && $each instanceof Signal && !Array.isArray($each.value) && !this.isObject($each.value)) {
      throw new Error("$each must be a signal prop with value which must be an array or an object <For $each={Signal([...])}> or <For each={Signal({...})}>.");
    }
    
    
    if($each) {
      this.unsubscribe = $each.subscribe((newState) => {
        this.setState({
          signal: newState
        })
      })
    }
  }
  
  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  } 

  render() {
    const { each, $each, children } = this.props;
    
    if($each && typeof children === "function") {
      return this.renderWithSignal(children, true)
    }
    
    if($each) {
      return this.renderWithSignal(children, false)
    }

    if (each && typeof children === "function") {
      return this.renderUsingFunction(each, children);
    }

    if (Array.isArray(children) || !React.isValidElement(children)) {
      throw new Error("Only provide one valid child element or function to <For> component");
    }
    
    return this.renderUsingChildComponent(each, children);
  }
  
  private renderWithSignal(children: any, isFn: boolean) {
    if (!this.state.signal) {
      throw new ReferenceError("$each is not Defined")
    }
    
    if(isFn) {
      return this.renderUsingFunction(this .state.signal, children)
    }
    
   return this.renderUsingChildComponent(this.state.signal, children)
  }

  private renderUsingFunction(each: T[] | { [key: string]: any }, renderFunction: Function) {
    if (Array.isArray(each)) {
      return this.renderArrayUsingFunction(each, renderFunction);
    } else {
      return this.renderObjectUsingFunction(each, renderFunction);
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

  private renderObjectUsingFunction(each: { [key: string]: any }, renderFunction: Function) {
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

  private renderUsingChildComponent(each: T[] | { [key: string]: any }, childComponent: React.ReactElement<any, any>) {
    if (Array.isArray(each)) {
      return this.renderArrayUsingChildComponent(each, childComponent);
    } else {
      return this.renderObjectUsingChildComponent(each, childComponent);
    }
  }

  private renderArrayUsingChildComponent(each: T[], childComponent: React.ReactElement<any, any>) {
    const renderedChildren: React.ReactNode[] = [];
    for (let index = 0; index < each.length; index++) {
      const item = each[index];
      const renderedChild = (
        <childComponent.type {...{ ...childComponent.props, [childComponent.props?.item || "item"]: item, [childComponent.props?.index || "index"]: index }} />
      );
      renderedChildren.push(
        React.cloneElement(renderedChild, { key: index })
      );
    }
    return renderedChildren;
  }

  private renderObjectUsingChildComponent(each: { [key: string]: any }, childComponent: React.ReactElement<any, any>) {
    const renderedChildren: React.ReactNode[] = [];
    const keys = Object.keys(each);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const item = each[key];
      const renderedChild = (
        <childComponent.type {...{ ...childComponent.props, [childComponent.props?.item || "item"]: item, [childComponent.props?.index || "index"]: key }} />
      );
      renderedChildren.push(
        React.cloneElement(renderedChild, { key })
      );
    }
    return renderedChildren;
  }

  private isObject(item: any) {
    return item !== null && typeof item === "object" && !Array.isArray(item);
  }
}

 export {
   For,
   ForChildComponentProps
 }