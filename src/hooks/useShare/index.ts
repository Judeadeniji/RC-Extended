import { SignalRefObject } from "../../functions";
import { $signal, Signal } from "../../store";

/**
 * A hook to use the share API
 * @example ```tsx
 * import { useShare } from 'rc-extended/use'
 * const { data, error, loading, share } = useShare()
 * 
 * <p>{data.value}</p>
 * <p>{loading.value ? 'loading' : 'not loading'}</p>
 * <button onClick={() => share({ title: 'title', text: 'text', url: 'url' })}>Share</button>
 * ```
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
 * @description The share API is not supported in all browsers. Check the compatibility table on MDN.
 * @template T
 * @returns {{ error: Signal<Error| unknown | null>; loading: Signal<boolean>; share: (data: T) => Promise<void>; }} - The share API
 */
function useShare<T>(sourceRef?: SignalRefObject<T>): { error: Signal<Error| unknown | null>; loading: Signal<boolean>; share: (data: T) => Promise<void>; } {
    const error = $signal<Error| unknown | null>(null);
    const loading = $signal(false);
    const share = async (data?: T) => {
        try {
            if (!data && sourceRef) {
                data = sourceRef.value;
            }

            loading.set(true);
            await navigator.share(data);
            loading.set(false);
        } catch (err) {
            error.set(err);
            loading.set(false);
        }
    };

    return {
        error,
        loading,
        share
    };
}

export { useShare };