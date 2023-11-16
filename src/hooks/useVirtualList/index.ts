import { useState, useRef, useEffect, useMemo, CSSProperties } from 'react';

type MaybeRef<T> = T | (() => T);
type UseVirtualListItemSize = number | ((index: number) => number);

interface UseVirtualListItem<T> {
  data: T;
  index: number;
}

interface UseVirtualListReturn<T> {
  list: React.MutableRefObject<UseVirtualListItem<T>[]>;
  scrollTo: (index: number) => void;
  containerProps: {
    ref: React.MutableRefObject<HTMLElement | null>;
    onScroll: () => void;
    style: React.CSSProperties;
  };
  wrapperProps: React.MutableRefObject<{
    style: React.CSSProperties;
  }>;
}

interface UseVirtualListOptionsBase {
  overscan?: number;
}

interface UseHorizontalVirtualListOptions extends UseVirtualListOptionsBase {
  itemWidth: UseVirtualListItemSize;
}

interface UseVerticalVirtualListOptions extends UseVirtualListOptionsBase {
  itemHeight: UseVirtualListItemSize;
}

type UseVirtualListOptions = UseHorizontalVirtualListOptions | UseVerticalVirtualListOptions;

function useVirtualList<T = any>(list: MaybeRef<T[]>, options: UseVirtualListOptions): UseVirtualListReturn<T> {
  const containerRef = useRef<HTMLElement | null>(null);
  const listRef = useRef<UseVirtualListItem<T>[]>([]);
  const [state, setState] = useState<{ start: number; end: number }>({ start: 0, end: 10 });
  const { itemHeight }: any = options; // Assuming vertical virtualization


  const calculateRange = useMemo(() => {
    return () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const { scrollTop, clientHeight } = container;

      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + Math.ceil(clientHeight / itemHeight), list.length);

      setState({ start: startIndex, end: endIndex });
    };
  }, [list.length]);

  const scrollTo = (index: number) => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const offset = index * itemHeight;
    container.scrollTo({ top: offset, behavior: 'smooth' });
  };

  const containerProps = {
    ref: containerRef,
    onScroll: calculateRange,
    style: { overflowY: 'auto', height: '400px' } as CSSProperties, // Modify styles as needed
  };

  const wrapperProps = useRef<{
    style: React.CSSProperties;
  }>({
    style: { height: `${list.length * itemHeight}px` }, // Adjust the height of the virtualized list
  });

  useEffect(() => {
    calculateRange();
  }, [calculateRange]);


  return {
    list: listRef,
    scrollTo,
    containerProps,
    wrapperProps,
  };
}

export default useVirtualList;
