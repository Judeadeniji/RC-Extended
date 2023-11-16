import { useState, useEffect } from "react";

function useElementSize(element: Element) {
    const [size, setSize] = useState({ width: 0, height: 0 });
    useEffect(() => {
        if (!element)
            return;
        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            setSize({ width, height });
        });
        resizeObserver.observe(element);
        return () => {
            resizeObserver.disconnect();
        };
    }, [element]);
    return size;
}

export { useElementSize };