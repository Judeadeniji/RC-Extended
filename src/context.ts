import { createContext } from "react";

type TrueFalse = true | false;

export type AwaitContextType<T = any> = {
    isPending: TrueFalse;
    isFulfilled: TrueFalse;
    isRejected: TrueFalse;
    result: T | null;
    error: Error | unknown | null;
}

const AwaitContext = createContext<AwaitContextType | undefined>(undefined);

export default AwaitContext;