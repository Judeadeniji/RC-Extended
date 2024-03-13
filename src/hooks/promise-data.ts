import { useContext } from "react"
import AwaitContext, { type AwaitContextType } from "../context.js"

/**
 * Hook to access the state of a promise being awaited.
 * @returns {AwaitContextType} The promise state from the context.
 * @throws {Error} If used outside a component that is a child of <Await>.
 */
export function usePromiseData<T>(): AwaitContextType<T> {
  const promiseState = useContext<AwaitContextType<T> | undefined>(AwaitContext);

  if (!promiseState) {
    throw new Error("usePromiseData() can only be used in components that are children of <Await>");
  }

  return promiseState;
}