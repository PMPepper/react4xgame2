import {useRef, useEffect} from 'react';

export default function useAnimationFrame(callback: FrameRequestCallback) {
    // Use useRef for mutable variables that we want to persist
    // without triggering a re-render on their change
    const requestRef = useRef<number | undefined>(undefined);
    const previousTimeRef = useRef<number | undefined>(undefined);
    const callbackRef = useRef<FrameRequestCallback>(callback);
    
    callbackRef.current = callback;
    
    useEffect(() => {
      const animate = (time: number) => {
        if (previousTimeRef.current !== undefined) {
          const deltaTime = time - previousTimeRef.current;
          callbackRef.current(deltaTime/1000)
        }
        previousTimeRef.current = time;
        requestRef.current = requestAnimationFrame(animate);
      }

      requestRef.current = requestAnimationFrame(animate);
      return () => cancelAnimationFrame(requestRef.current);
    }, []); // Make sure the effect runs only once
  }