import { useEffect } from "react";
import { $signal } from "../../store";

function useElementScroll(element: { scrollLeft: any; scrollTop: any; addEventListener: (arg0: string, arg1: () => any, arg2: any) => void; removeEventListener: (arg0: string, arg1: () => any) => any; }, options: any) {
    const scroll = $signal({
        x: element.scrollLeft,
        y: element.scrollTop
    });

    useEffect(() => {
        const handler = () => scroll.set({
            x: element.scrollLeft,
            y: element.scrollTop
        })
            ;
        element.addEventListener("scroll", handler, options);
        return () => element.removeEventListener("scroll", handler)
            ;
    }, []);
    return scroll;
}

export {
    useElementScroll
}
