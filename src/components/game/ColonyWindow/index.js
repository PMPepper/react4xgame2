import { useState } from 'react';
//import { useSelector } from 'react-redux';


//Components
import Tabs from 'components/ui/Tabs';
import ColonySelector from './ColonySelector';
import MiningTab from './MiningTab';
import IndustryTab from './IndustryTab';
import ResearchTab from './ResearchTab';
import ShipyardsTab from './ShipyardsTab';

//TEMP
import TestTab from './TestTab';

//Hooks

//Other
import classes from './ColonyWindow.module.scss';


//The component
export default function ColonyWindow() {
    //Internal state
    const [selectedIndex, setSelectedIndex] = useState(0);//tab index
    const [selectedColonyId, setSelectedColonyId] = useState(null);

    //Render
    return <div className={classes.root}>
        <div className={classes.treeHolder}>
            <ColonySelector selectedColonyId={selectedColonyId} setSelectedColonyId={setSelectedColonyId} />
        </div>

        <div className={classes.main}>
            {selectedColonyId && <Tabs selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}>
                <Tabs.Tab label="Mining">
                    <MiningTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Industry">
                    <IndustryTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Research">
                    <ResearchTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Shipyards">
                    <ShipyardsTab selectedColonyId={selectedColonyId} />
                </Tabs.Tab>
                <Tabs.Tab label="Tests">
                    <TestTab />
                </Tabs.Tab>
            </Tabs>}
        </div>
    </div>
}


//internal helpers


