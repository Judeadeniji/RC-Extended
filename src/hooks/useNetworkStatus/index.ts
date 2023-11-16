import { useEffect } from "react";
import { $signal, ReadonlySignal } from "../../store";

/**
 * @description A hook that returns the current network status of the user. 
 * @example ```tsx
 * import { useNetworkStatus } from 'rc-extended/use'
 * const App = () => {
 *   const status = useNetworkStatus();
 *   if (status === 'online') {
 *    retry();
 *    return <div>You are online</div> 
 *   } else {
 *   return <div>You are offline</div>
 *  }
 * }
 * ```
 * @returns {ReadonlySignal<"online" | "offline">} A signal that returns the current network status of the user.
 */
function useNetworkStatus() {
    const status = $signal<"online" |"offline">(getNetworkStatus());
    function getNetworkStatus() {
        return navigator.onLine ? 'online' : 'offline';
    }
    useEffect(() => {
        const onOnline = () => status.value = getNetworkStatus();
        const onOffline = () => status.value = getNetworkStatus();


        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        }
    }, [])

    return status as ReadonlySignal<"online" | "offline">;
}

export { useNetworkStatus }