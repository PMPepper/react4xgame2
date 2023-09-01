import React, { MutableRefObject, useCallback, useMemo, useRef } from 'react';
import useEqualityContextSelector from 'hooks/useEqualityContextSelector';
import { PropsWithChildren } from 'react';
import { shallowEqual } from 'react-redux';
import { ClientGameState } from 'types/game/shared/game';
import { createContext, useContextSelector } from 'use-context-selector';

type ValueWithRef<T> = {
    value: T,
    ref: MutableRefObject<T>
}

const ClientStateContext = createContext<ValueWithRef<ClientGameState>>(undefined);
ClientStateContext.displayName = 'ClientStateContext';


export function ClientStateContextProvider({value, children}: PropsWithChildren<{value: ClientGameState}>) {
    const valueRef = useRef(value);
    valueRef.current = value
    
    const valueWithRef = useMemo(() => ({
        value,
        ref: valueRef
    }), [value]);

    return <ClientStateContext.Provider value={valueWithRef}>{children}</ClientStateContext.Provider>;
}

export function useClientStateContext<T>(selector: (state: ClientGameState) => T) {
    return useContextSelector(ClientStateContext, (state) => selector(state.value))
}

export function useEqualityClientStateContext<T>(selector: (state: ClientGameState) => T, equalityFn: (a: any, b: any) => boolean) {
    return useEqualityContextSelector(ClientStateContext, (state) => selector(state.value), equalityFn);
}

export function useGetClientState() {
    const ref = useContextSelector(ClientStateContext, (state) => state.ref);

    return useCallback(() => {
        return ref.current
    }, [])
}