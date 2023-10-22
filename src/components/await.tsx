import React, { useCallback, useEffect, ReactNode } from "react";
import useReactive from "../hooks/reactive.js";
import AwaitContext from "../context.js";
import type { AwaitContextType } from "../context.js";

/**
 * Props for the Await component.
 * @typedef {Object} AwaitProps
 * @property {() => Promise<any>} promise - A promise to be awaited.
 * @property {ReactNode} children - The content to be rendered while awaiting the promise.
 */

interface AwaitProps<T> {
  promiseFn: (contoller: AbortController) => Promise<T>;
  children: ReactNode;
}

/**
 * An async component that awaits a promise and provides its state to child components.
 * @param {AwaitProps} props - The props for the Await component.
 * @returns {JSX.Element} The JSX for the Await component.
 */
export function Await<T>({ promiseFn, children }: AwaitProps<T>): JSX.Element {
  /**
   * The state of the promise.
   * @type {{ value: AwaitContextType }}
   */
  const promiseState: { value: AwaitContextType } =
    useReactive<AwaitContextType>({
      isPending: true,
      isFulfilled: false,
      isRejected: false,
      result: null,
      error: null,
    });

  /**
   * Resolves the provided promise and updates the promise state accordingly.
   */
  const resolvePromise = useCallback(
    async (controller: AbortController) => {
      try {
        const result = await promiseFn(controller);

        promiseState.value = {
          isPending: false,
          isFulfilled: true,
          isRejected: false,
          result,
          error: null,
        };
      } catch (e: any) {
        promiseState.value = {
          ...promiseState.value,
          isPending: false,
          isRejected: true,
          error: e as Error,
        };
      }
    },
    [promiseFn]
  );

  useEffect(() => {
    try {
      const controller = new AbortController();
      resolvePromise(controller);

      return () => {
        controller.abort();
      };
    } catch (error: unknown) {}
  }, [resolvePromise]);

  return (
    <AwaitContext.Provider value={promiseState.value}>
      {children}
    </AwaitContext.Provider>
  );
}
