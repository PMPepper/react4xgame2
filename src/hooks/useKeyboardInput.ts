//Allows the user to access the state of the keyboard without triggering updates

import {useRef, useMemo, KeyboardEvent} from 'react';


//The hook
//activeKeys = {[keyCode]: isActive boolean}, defaults to null (all keys are considered active, and will be tracked). If supplied, only keycode with isActive = true will be tracked
//preventActiveKeyDefaults = boolean, defaults to true
//returns {props: {add these props to the element you wish to be monitoring for keyboard input}, isKeyDown(key): bool}
export default function useKeyboardInput<T extends Element = HTMLElement>(activeKeys: number[] | Record<number, boolean> | null = null, preventActiveKeyDefaults: boolean = true) {
    //All state is stored in the ref object
    const ref = useRef<{keysDown: Record<number, boolean>, activeKeys: number[] | Record<number, boolean> | null, preventActiveKeyDefaults: boolean}>({keysDown: {}, activeKeys, preventActiveKeyDefaults});
    
    //Keep these values current
    ref.current.activeKeys = useMemo(
        () => {
            return activeKeys instanceof Array ?
                activeKeys.reduce((output, val) => {
                    output[val] = true;

                    return output;
                }, {})
                :
                activeKeys
        },
        [activeKeys]
    );
    ref.current.preventActiveKeyDefaults = preventActiveKeyDefaults;

    return useMemo(
        () => {
            return {
                props: {
                    onKeyDown: (e: KeyboardEvent<T>) => {
                        const {activeKeys, preventActiveKeyDefaults, keysDown} = ref.current;
                        
                        if(activeKeys && !activeKeys[e.which]) {
                            return;
                        }
            
                        keysDown[e.which] = true;
                        
                        //Keys which do something have their default actions cancelled
                        preventActiveKeyDefaults && e.preventDefault();
                    },
                    onKeyUp: (e: KeyboardEvent<T>) => {
                        const {activeKeys, keysDown} = ref.current;
            
                        if(activeKeys && !activeKeys[e.which]) {
                            return;
                        }
            
                        keysDown[e.which] = false;
                    },
                    onBlur: () => {
                        ref.current.keysDown = {};
                    },
                    tabIndex: 0,
                },
                isKeyDown: (key: number | number[]) => {//if keys = array, treat as an OR list (e.g. if any of the listed keys are down, return true)
                    if(!key) {
                        throw new Error('please supply a key to check if it is down');
                    }
        
                    const keysDown = ref.current.keysDown;
            
                    if(key instanceof Array) {
                       return key.some((keyCode) => (!!keysDown[keyCode]))
                    } else {
                        return !!keysDown[key];
                    }
                }
            }
        },
        []
    )
}
