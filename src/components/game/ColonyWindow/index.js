import { useState } from 'react';

//Components
import Tabs from 'components/ui/Tabs';

//Other
import classes from './ColonyWindow.module.scss';


//The component
export default function ColonyWindow() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return <div className={classes.root}>
        <div className={classes.treeHolder}>
            TODO
        </div>
        <div className={classes.main}>
            <Tabs selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}>
                <Tabs.Tab label="Hello" className="wysiwyg">
                    <p>The first tab</p>
                    <p>The second line of the first tab</p>
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