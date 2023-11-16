import { $effect, $signal } from "../../store";

function useMouse() {
  const mouse = $signal({ x: 0, y: 0 });

  $effect(() => {
    const updateMouse = (e: MouseEvent) => {
      mouse.value = ({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener("mousemove", updateMouse);
    return () => {
      document.removeEventListener("mousemove", updateMouse);
    };
  });

  return mouse;
}

function usePointer() {
  const pointer = $signal({ x: 0, y: 0 });

  $effect(() => {
    const updatePointer = (e: PointerEvent) => {
      pointer.value = ({ x: e.clientX, y: e.clientY });
    };
    document.addEventListener("pointermove", updatePointer);
    return () => {
      document.removeEventListener("pointermove", updatePointer);
    };
  });

  return pointer;
}

 function useTouch() {
  const touch = $signal({ x: 0, y: 0 });

  $effect(() => {
    const updateTouch = (e: TouchEvent) => {
      touch.value = ({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    };
    document.addEventListener("touchmove", updateTouch);
    return () => {
      document.removeEventListener("touchmove", updateTouch);
    };
  });

  return touch;
 }


export {
    useMouse,
    usePointer,
    useTouch
}