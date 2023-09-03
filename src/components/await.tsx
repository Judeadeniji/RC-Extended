import React, { useCallback, useEffect, ReactNode } from "react";
import useReactive from "../hooks/reactive.js";
import AwaitContext from "../context.js";
import type { AwaitContextType } from "../context.js";

/**
 * Props for the Await component.
 * @typedef {Object} AwaitProps
 * @property {() => Promise<any>} promiseFn - A function that returns a promise to be awaited.
 * @property {ReactNode} children - The content to be rendered while awaiting the promise.
 */
 
 interface AwaitProps {
  promiseFn: () => Promise<any>;
  children: ReactNode;
}

/**
 * An async component that awaits a promise and provides its state to child components.
 * @param {AwaitProps} props - The props for the Await component.
 * @returns {JSX.Element} The JSX for the Await component.
 */
export function Await({ promiseFn, children }: AwaitProps): ReactNode {
  /**
   * The state of the promise.
   * @type {AwaitContextType}
   */
  const promiseState = useReactive<AwaitContextType>({
    isPending: true,
    isFulfilled: false,
    isRejected: false,
    isRevalidating: false,
    result: null,
    error: null,
  });

  /**
   * Invalidates the current promise state and triggers re-validation.
   */
  function invalidate() {
    promiseState.value = {
      isPending: true,
      isFulfilled: false,
      isRejected: false,
      isRevalidating: true,
      result: null,
      error: null,
    };
    resolvePromise();
  };

  /**
   * Resolves the provided promise and updates the promise state accordingly.
   */
  const resolvePromise = useCallback(async () => {
    try {
      const result = await promiseFn();

      promiseState.value = {
        isPending: false,
        isFulfilled: true,
        isRejected: false,
        isRevalidating: false,
        result,
        error: null,
      };
    } catch (e: any) {
      promiseState.value = {
        ...promiseState.value,
        isPending: false,
        isRejected: true,
        isRevalidating: false,
        error: e as Error,
      };
    }
  }, [promiseFn]);

  useEffect(() => {
    resolvePromise();
  }, [resolvePromise]);

  return (
    <AwaitContext.Provider value={{ ...promiseState.value, invalidate }}>
      {children}
    </AwaitContext.Provider>
  );
}
