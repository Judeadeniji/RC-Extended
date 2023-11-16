import { SignalRefObject } from "../../functions";
import { $watch } from "../../store";

type OnClickOutside = (event: MouseEvent | TouchEvent) => void;

function useClickOutside(
  ref: SignalRefObject<HTMLElement | null>,
  callback: OnClickOutside
) {
  const stop = $watch(ref, (el: HTMLElement) => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (el.contains(event.target as Node)) {
        callback(event);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      stop();
    };
  });
}

export { useClickOutside, type OnClickOutside };
