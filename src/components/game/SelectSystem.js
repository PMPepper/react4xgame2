
import { useSelector, useDispatch } from 'react-redux';
import { Trans } from '@lingui/macro';

//Hooks
import { useContextSelector } from 'components/SelectableContext';

//Helpers
import mapToSortedArray from 'helpers/object/map-to-sorted-array';
import sortOnPropNatsort from 'helpers/sorting/sort-on-prop-natsort';

//Other
import styles from './SelectSystem.module.scss';


//The component
export default function SelectSystem() {
    const selectedSystemId = useSelector(state => state.selectedSystemId);

    const knownSystems = useContextSelector(state => state.knownSystems) || [];;


    //Callbacks
    const onChangeSelectedSystemId = (...args) => {console.log(args)}

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