import { SignalRefObject } from "../../functions";
import { $effect, $signal, $watch, Signal } from "../../store";

function useMouseInElement<T>(element: SignalRefObject<T>) {
    const mouseInElement = $signal(false);
    function handleMouseEnter() {
        mouseInElement.value = true;
    }
    function handleMouseLeave() {
        mouseInElement.value = false;
    }

    $watch(element, (el: HTMLElement) => {
        if (el) {
            el.addEventListener("mouseenter", handleMouseEnter);
            el.addEventListener("mouseleave", handleMouseLeave);
        }

        return () => {
            if (el) {
                el.removeEventListener("mouseenter", handleMouseEnter);
                el.removeEventListener("mouseleave", handleMouseLeave);
            }
        }
    })
}

export {
    useMouseInElement
}