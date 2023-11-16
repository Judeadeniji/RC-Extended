import { useEffect } from "react";
import { $computed, $signal } from "../../store";

interface BreakPoint {
    MOBILE?: 'MOBILE';
    TABLET?: 'TABLET';
    DESKTOP?: 'DESKTOP';
}

function useBreakPoint(BreakPoint: BreakPoint = {
    MOBILE: 'MOBILE',
    TABLET: 'TABLET',
    DESKTOP: 'DESKTOP',
}, screenSizes: Record<keyof BreakPoint, number> = {
    MOBILE: 768,
    TABLET: 1024,
    DESKTOP: 1025,
}) {
  const breakPoint = $signal(window.innerWidth < screenSizes.MOBILE ? BreakPoint.MOBILE : window.innerWidth < screenSizes.TABLET ? BreakPoint.TABLET : BreakPoint.DESKTOP);
  const computedBreakpoint = $computed(() => breakPoint.value)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < screenSizes.MOBILE) {
        breakPoint.value = BreakPoint.MOBILE;
      } else if (window.innerWidth < screenSizes.TABLET) {
        breakPoint.value = BreakPoint.TABLET;
      } else {
        breakPoint.value = BreakPoint.DESKTOP;
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return computedBreakpoint;
}

export { useBreakPoint }