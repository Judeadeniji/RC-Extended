import { useEffect } from "react";
import { $signal } from "../../store";

function useElementResize(element: HTMLElement) {
    const size = $signal({
        width: element.offsetWidth,
        height: element.offsetHeight,
    });
    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            size.set({
                width: entry.contentRect.width,
                height: entry.contentRect.height,
            });
        }
    });
    useEffect(() => {
        resizeObserver.observe(element);
        return () => resizeObserver.unobserve(element);
    }, [element]);
    return size;
}

export { useElementResize };