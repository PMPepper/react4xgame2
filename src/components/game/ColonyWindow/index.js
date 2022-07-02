import { useState } from 'react';
//import { useSelector } from 'react-redux';


//Components
import Tabs from 'components/ui/Tabs';
import ColonySelector from './ColonySelector';

//TEMP
import TestTab from './TestTab';

//Hooks

//Other
import classes from './ColonyWindow.module.scss';


//The component
export default function ColonyWindow() {
    //const selectedSystemId = useSelector(state => state.selectedSystemId);

    //Internal state
    const [selectedIndex, setSelectedIndex] = useState(0);//tab index
    const [selectedColonyId, setSelectedColonyId] = useState(null);

    return <div className={classes.root}>
        <div className={classes.treeHolder}>
            <ColonySelector selectedColonyId={selectedColonyId} setSelectedColonyId={setSelectedColonyId} />
        </div>

        <div className={classes.main}>
            <Tabs selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}>
                <Tabs.Tab label="Hello">
                    <TestTab />
                </Tabs.Tab>
                <Tabs.Tab label="World" className="wysiwyg">
                    <p>TODO content for this tab.</p>
                    <p>Some more text</p>
                </Tabs.Tab>
                <Tabs.Tab label="Foo Bar" className="wysiwyg">
                    <p>A different tab with different content</p>
                    <p>Yet another paragraph</p>
                    <p>And one final line for good measure</p>
                </Tabs.Tab>
            </Tabs>
        </div>
    </div>
}


//internal helpers


