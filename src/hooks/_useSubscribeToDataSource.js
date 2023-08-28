//TODO obsolete, just use useSyncExternalStoreWithSelector directly
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";


export default function useSubscribeToDataSource(subscribe, getState, selector, equalityFn) {
    return useSyncExternalStoreWithSelector(subscribe, getState, getState, selector, equalityFn);
};
