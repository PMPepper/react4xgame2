import React from 'react';
import { Trans } from '@lingui/macro';

//Hooks

//Helpers
import sortOnPropNatsort from 'helpers/sorting/sort-on-prop-natsort';

//Actions
import {set as setSelectedColonyId} from 'redux/reducers/selectedSystemId';

//Other
import styles from './SelectSystem.module.scss';
import { useClientStateContext } from './ClientStateContext';
import useAppSelector from 'hooks/useAppSelector';
import useAppDispatch from 'hooks/useAppDispatch';


//The component
export default function SelectSystem() {
    //Redux
    const selectedSystemId = useAppSelector(state => state.selectedSystemId);
    const dispatch = useAppDispatch();

    //Client state
    const knownSystems = useClientStateContext(state => state.knownSystems) || [];

    //Callbacks
    const onChangeSelectedSystemId = (evt) => dispatch(setSelectedColonyId(+evt.target.value))

    //render
    return <div className={styles.selectSystem}>
        <label>
            <span className={styles.label}><Trans id="system.select">Select system: </Trans></span>
            <select value={selectedSystemId} onChange={onChangeSelectedSystemId}>{
                knownSystems
                    .sort(sortOnPropNatsort('name'))
                    .map(({id, name}) => <option key={id} value={id}>{name}</option>)
            }</select>
        </label>
    </div>
}