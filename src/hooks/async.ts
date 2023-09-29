import { useEffect, useRef, useCallback } from "react";
import useReactive from "./reactive.js";

/**
This part of the library needs to be highly improved upon 
**/


/**
 * Represents the state of a promise's execution.
 * @template T - The type of the promise result.
 */
export type PromiseState<T> = {
  isPending: boolean;
  isFulfilled: boolean;
  isRejected: boolean;
 // isRerunning?: boolean;
  invalidate: () => void;
  result: T | null;
  error: Error | null;
};

/**
 * Options for the `useAsync` hook.
 * @template T - The type of the promise result.
 */
interface UseAsyncOptions<T> {
  promiseFn: () => Promise<T>;
  onReject?: (error: Error) => void;
  onFulfill?: (result: T) => void;
  onSettle?: () => void;
  signal?: AbortSignal;
}

/**
 * A hook for handling asynchronous operations with state tracking.
 * @template T - The type of the promise result.
 * @param {UseAsyncOptions<T>} options - The options for the hook.
 * @returns {PromiseState<T>} The state of the asynchronous operation.
 */
export function useAsync<T>({
  promiseFn,
  onReject,
  onFulfill,
  onSettle
}: UseAsyncOptions<T>): PromiseState<T> {
  const shouldRerun = useReactive(false);
  const promiseState = useReactive<PromiseState<T>>({
    isPending: true,
    isFulfilled: false,
    isRejected: false,
    invalidate: () => {
      shouldRerun.value = true;
    },
    result: null,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const result = await promiseFn();

        if (isMounted) {
          if (onFulfill) {
            onFulfill(result);
          }

          promiseState.value = {
            ...promiseState.value,
            result,
            isPending: false,
            isFulfilled: true,
          };

          if (onSettle) {
            onSettle();
          }
        }
      } catch (error) {
        if (isMounted) {
          if (onReject) {
            onReject(error as Error);
          }

          promiseState.value = {
            ...promiseState.value,
            error: error as Error,
            isPending: false,
            isFulfilled: false,
            isRejected: true,
          };

          if (onSettle) {
            onSettle();
          }
        }
      }
    })();

    return () => {
      isMounted = false;
      if (shouldRerun.value) {
        shouldRerun.value = false;
      }
    };
  }, [promiseFn, shouldRerun.value]);

  return promiseState.value;
}

// Define a cache to store responses
const cache = new Map();

/**
 * A hook for fetching data using the Fetch API with state tracking and caching.
 * @template T - The type of the fetched data.
 * @param {string} url - The URL to fetch from.
 * @param {RequestInit} options - Fetch options.
 * @returns {PromiseState<T> & { abort: () => void }} The state of the fetch operation and an `abort` function.
 */
export function useFetch<T>(
  url: string,
  options: RequestInit = {}
): PromiseState<T> & { abort: () => void } {
  const controller = useRef(new AbortController());
  const promiseFn = useCallback(async () => {
    const signal = controller.current.signal;

    const fetchOptions = {
      ...options,
      signal,
    };

    // Check if the response is already in the cache
    const cachedResponse = cache.get(url);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseData = await response.json();

    // Store the response in the cache
    cache.set(url, responseData);

    return responseData;
  }, [url]);
  const state = useAsync<T>({
    promiseFn,
  });

  return {
    ...state,
    abort: () => controller.current.abort(),
  };
}
