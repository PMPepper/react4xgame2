import { useMemo } from "react";
import { Context, useContextSelector } from "use-context-selector";

export default function useEqualityContextSelector<T, R>(
    ctx: Context<T>,
    selector: (val: T) => R,
    isEql: (a: any, b: any) => boolean//this shoul be typed as: '(a: R | null, b: R) => boolean' but this breaks they type inference from the selector method, unless it too is typed (e.g. shallowEqual is typed to any, so this will be used as the inferred type)
  ): R {
    const patchedSelector = useMemo(() => {
      let prevValue: R | null = null;
  
      return (state: T) => {
        const nextValue: R = selector(state);
  
        if (prevValue !== null && isEql(prevValue, nextValue)) {
          return prevValue;
        }
  
        prevValue = nextValue;
  
        return nextValue;
      };
    }, [isEql, selector]);
  
    return useContextSelector<T, R>(ctx, patchedSelector);
  };