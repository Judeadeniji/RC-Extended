import { createContext } from "react";

type TrueFalse = true | false;

export type AwaitContextType = {
    isPending: TrueFalse;
    isFulfilled: TrueFalse;
    isRejected: TrueFalse;
    isRevalidating: TrueFalse;
    result: any | null;
    error: Error | unknown | null;
}

const AwaitContext = createContext<AwaitContextType & { invalidate?: () => void } | undefined>(undefined);

export default AwaitContext;