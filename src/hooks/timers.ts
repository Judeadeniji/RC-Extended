import { useEffect, useRef, useState } from "react";

type CallbackFunction = () => void;

/**
 * Promises to return the result of a callback after a specified time.
 * @param {CallbackFunction} cb - The callback function to execute.
 * @param {number} t - The time (in milliseconds) to wait before executing the callback.
 * @returns {Promise<void>} A promise that resolves after the specified time with the callback's result.
 */
export function setReturn(cb: CallbackFunction, t: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(function () {
      resolve(cb());
    }, t);
  });
}

/**
 * Returns a promise that fulfills after a specified time.
 * @param {number} time - The time (in milliseconds) to wait before fulfilling the promise.
 * @returns {Promise<void>} A promise that fulfills after the specified time.
 */
export function sleep(time: number): Promise<void> {
  return new Promise((fulfil) => {
    setTimeout(fulfil, time);
  });
}

/**
 * Creates a timeout that triggers a callback after a specified time.
 * @param {CallbackFunction} cb - The callback function to execute.
 * @param {number} timeout - The time (in milliseconds) to wait before executing the callback.
 * @returns {() => void} A function to cancel the timeout.
 */
function onTimeout(cb: CallbackFunction, timeout: number | undefined): () => void {
  const id = setTimeout(cb, timeout || 10);

  return () => clearTimeout(id);
}

/**
 * Hook to execute a callback after a specified timeout.
 * @param {CallbackFunction} cb - The callback function to execute.
 * @param {number} timeout - The time (in milliseconds) to wait before executing the callback.
 */
export function useTimeout(cb: CallbackFunction, timeout: number): void {
  useEffect(() => {
    return onTimeout(cb, timeout);
  }, [cb, timeout]);
}

/**
 * Hook to repeatedly execute a callback at a specified interval.
 * @param {CallbackFunction} cb - The callback function to execute.
 * @param {number} interval - The time interval (in milliseconds) between callback executions.
 */
export function useInterval(cb: CallbackFunction, interval: number): void {
  useEffect(() => {
    const id = setInterval(cb, interval);
    return () => clearInterval(id);
  }, [cb, interval]);
}

/**
 * Creates a debounced version of a callback.
 * @param {CallbackFunction} callback - The callback function to debounce.
 * @param {number} delay - The debounce delay (in milliseconds).
 * @returns {CallbackFunction} A debounced version of the callback.
 */
export function useDebouncedCallback(callback: CallbackFunction, delay: number): CallbackFunction {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}

/**
 * Creates a throttled version of a callback.
 * @param {CallbackFunction} callback - The callback function to throttle.
 * @param {number} delay - The throttle delay (in milliseconds).
 * @returns {CallbackFunction} A throttled version of the callback.
 */
export function useThrottledCallback(callback: CallbackFunction, delay: number): CallbackFunction {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isThrottled = useRef<boolean>(false);

  return (...args) => {
    if (!isThrottled.current) {
      callback(...args);
      isThrottled.current = true;

      timeoutRef.current = setTimeout(() => {
        isThrottled.current = false;
      }, delay);
    }
  };
}

type EmitterReturn = { number: number; take: (until: number) => Omit<EmitterReturn, "take"> }

/**
 * Custom hook that emits numbers in sequence at a specified interval.
 * @param {number} interval - The interval (in milliseconds) between emitted numbers.
 * @returns {{ number: number, take: (until: number) => void }} The current emitted number and the `take` method to stop emission.
 */
export function useIntervalEmitter(interval: number): EmitterReturn {
  const [number, setNumber] = useState<number>(0);
  const [limit, setLimit] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | number | string | undefined>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNumber(c => c + 1);
    }, interval);

    return () => {
      if (typeof limit === "number" && number >= limit) {
         clearInterval(intervalRef.current);
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval]);

  const take = (until: number) => {
    setLimit(() => until);
    return { number };
  };

  return { number, take };
}
