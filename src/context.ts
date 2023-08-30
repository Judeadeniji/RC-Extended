import { createContext } from "react";

type TrueFalse = true | false;

export type AwaitContextType = {
    isPending: TrueFalse;
    isFulfilled: TrueFalse;
    isRejected: TrueFalse;
    result: any | null;
    error: Error | null;
}

const AwaitContext = createContext<AwaitContextType | undefined>(undefined);

export default AwaitContext;