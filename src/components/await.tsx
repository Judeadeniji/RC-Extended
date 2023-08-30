import React, { useCallback, useEffect, ReactNode } from "react";
import useReactive from "../hooks/reactive.js";
import AwaitContext from "../context.js";
import type { AwaitContextType } from "../context.js";

interface AwaitProps {
  promiseFn: () => Promise<any>;
  children: ReactNode;
}

export function Await({ promiseFn, children }: AwaitProps) {
  const promiseState = useReactive<AwaitContextType>({
    isPending: true,
    isFulfilled: false,
    isRejected: false,
    result: null,
    error: null,
  });

  const resolvePromise = useCallback(async () => {
    try {
      const result = await promiseFn();

      promiseState.value = {
        ...promiseState.value,
        isPending: false,
        isFulfilled: true,
        result,
      };
    } catch (e: any) {
      promiseState.value = {
        ...promiseState.value,
        isPending: false,
        isRejected: true,
        error: e as Error,
      };
    }
  }, [promiseFn, promiseState]);

  useEffect(() => {
    resolvePromise();
  }, [resolvePromise]);

  return (
    <AwaitContext.Provider value={promiseState.value}>
      {children}
    </AwaitContext.Provider>
  );
}
