//Hooks
import { Trans } from '@lingui/macro';
import { useContextSelector } from 'components/SelectableContext';


//Entity helper components
export default {
    Name: ({id}) => useContextSelector(state => state?.factionEntities?.[id]?.name) || <Trans id="_na">-</Trans>,

}
