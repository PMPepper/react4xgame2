//TODO test to find out if any of this works
import { createContext, useContext, useRef, useEffect } from "react"

//Hooks
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";

//Contants
const defaultContext = createContext(null);
defaultContext.displayName = 'SelectableContext';


//The component
export default function SelectableContext({children, value, context = defaultContext}) {
    const ref = useRef(null);

    if(ref.current === null) {
        ref.current = new ContextState(value);
    }

    useEffect(
        () => {
            ref.current.setState(value);
        },
        [value]
    );

    return <context.Provider value={ref.current}>
        {children}
    </context.Provider>
}



class ContextState {
    constructor(initialValue) {
        this.state = initialValue;

        this.subscribers = [];
    }

    getState = () => {
        return this.state;
    }


    setState = (newState) => {
        if(newState !== this.state) {
            this.state = newState;

            //execute all subscriber callbacks with the new value of the state
            this.subscribers.forEach(subscriber => subscriber(newState));
        }
    }

    subscribe = (callback) => {
        this.subscribers.push(callback);

        //returns unsubscribe method
        return () => {
            const index = this.subscribers.indexOf(callback);

            if(index !== -1) {
                this.subscribers.splice(index, 1);
            }
        }
    }
}

//Hooks
const refEquality = (a, b) => a === b;

export function useContextSelector(selector, equalityFn = refEquality, context = defaultContext) {
    const state = useContext(context);

    if(!state || !(state instanceof ContextState)) {
        throw new Error('No valid SelectableContext found')
    }

    const selectedState = useSyncExternalStoreWithSelector(
        state.subscribe,
        state.getState,
        state.getState,
        selector,
        equalityFn,
    )

    return selectedState;
}

export function useGetContextState(context = defaultContext) {
    const state = useContext(context);

    return state?.getState;
}



