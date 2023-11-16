import { SignalRefObject } from "../../functions";
import { $signal, Signal } from "../../store";
import { defaultDocument, defaultWindow } from "../../utils";

/**
 * A hook to use the fullscreen API
 * @example ```tsx
 * import { useFullScreen } from 'rc-extended/use'
 * const el = signalRef(null)
 * const { isFullScreen, toggle, enter, exit } = useFullScreen(el)
 * 
 * <video ref={el} />
 * <button onClick={toggle}>Toggle fullscreen</button>
 * ```
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fullscreen_API
 * @description The fullscreen API is not supported in all browsers. Check the compatibility table on MDN.
 * @template T
 * @param {SignalRefObject<T>} element - The element to make fullscreen
 * @returns {{ isFullScreen: Signal<boolean>; toggle: () => void; enter: (element: SignalRefObject<T>) => void; exit: () => void; }} - The fullscreen API
 */
function useFullScreen<T extends HTMLElement>(element: SignalRefObject<T>): { isFullScreen: Signal<boolean>; toggle: () => void; enter: (element: SignalRefObject<T>) => void; exit: () => void; } {
  const isFullScreen = $signal(false);
  function requestFullscreen(element: SignalRefObject<T>) {
    if (element.value.requestFullscreen) {
      element.value.requestFullscreen();
      //@ts-ignore
    } else if (element.value.webkitRequestFullscreen) {
        //@ts-ignore
        element.value.webkitRequestFullscreen();
        //@ts-ignore
    } else if (element.value.msRequestFullscreen) {
        //@ts-ignore
      element.value.msRequestFullscreen();
    }
  }

  function exitFullscreen() {
    if (defaultDocument.exitFullscreen) {
      defaultDocument.exitFullscreen();
    } else if (document.exitFullscreen) {
      
        defaultDocument.exitFullscreen();
    } else if (document.exitFullscreen) {
      
        defaultDocument.exitFullscreen();
    }
  }

  
  const toggleFullScreen = () => {
    if (!element.value) {
      return;
    }
    if (isFullScreen.value) {
      exitFullscreen();
    } else {
      requestFullscreen(element);
    }
    isFullScreen.set(!isFullScreen);
  };
  return {
    isFullScreen,
    toggle: toggleFullScreen,
    enter: requestFullscreen,
    exit: exitFullscreen,
  };
}

export { useFullScreen }