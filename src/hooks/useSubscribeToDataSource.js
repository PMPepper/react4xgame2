import {useRef, useEffect} from 'react';

//Hooks
import useForceUpdate from './useForceUpdate';

//The hook
export default function useSubscribeToDataSource(subscribe, getState, selector, equalityFn) {
    const forceUpdate = useForceUpdate();
    const ref = useRef();

    if(!ref.current) {
        ref.current = {};
    }

    const state = getState();

    let selectedState;
    const {lastState, lastSelectedState, lastSelector, lastEqualityFn} = ref.current;

    if(selector !== lastSelector || equalityFn !== lastEqualityFn || state != lastState) {
        const newSelectedState = selector(storeState);

        if (lastSelectedState === undefined || !equalityFn(newSelectedState, lastSelectedState)) {
            selectedState = newSelectedState
        } else {
            selectedState = lastSelectedState
        }
    } else {
        selectedState = lastSelectedState
    }

    //update ref
    ref.current.lastState = state;
    ref.current.lastSelectedState = selectedState;
    ref.current.lastSelector = selector;
    ref.current.lastEqualityFn = equalityFn;

    useEffect(
        () => {
            return subscribe((newState) => {//subscription handler
                const {lastState, lastSelectedState, lastSelector, lastEqualityFn} = ref.current;

                if(newState === lastState) {
                    return;
                }
                
                const newSelectedState = lastSelector(newState);

                if (lastEqualityFn(newSelectedState, lastSelectedState)) {
                    return
                }

                //update ref
                ref.current.lastState = newState;
                ref.current.lastSelectedState = newSelectedState;

                forceUpdate();
            })
        },
        []
    );

    return selectedState;
}