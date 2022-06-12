import { useState } from 'react';

//Components
import Tabs from 'components/ui/Tabs';
import Tree from 'components/display/Tree';

//Other
import classes from './ColonyWindow.module.scss';

//TEMP
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
//plus square: f0fe

//Consts
const plusIcon = <FontAwesomeIcon icon={solid("plus-square")} />;
const minusIcon = <FontAwesomeIcon icon={solid("minus-square")} />;
const starIcon = <FontAwesomeIcon icon={solid("sun")} />;
const planetIcon = <FontAwesomeIcon icon={solid("globe")} />;
//const moonIcon = <FontAwesomeIcon icon={solid("minus-square")} />;
//const asteroidIcon = <FontAwesomeIcon icon={solid("minus-square")} />;

//The component
export default function ColonyWindow() {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return <div className={classes.root}>
        <div className={classes.treeHolder}>
            <Tree>
                <Tree.Group>
                    <Tree.Item aria-selected="true">{minusIcon} {starIcon} Sol
                        <Tree.Group>
                            <Tree.Item>{planetIcon} Mercury</Tree.Item>
                            <Tree.Item>{planetIcon} Venus</Tree.Item>
                            <Tree.Item aria-selected="true">
                                {minusIcon} {planetIcon}  Earth
                                <Tree.Group>
                                    <Tree.Item>
                                        {planetIcon} Luna
                                    </Tree.Item>
                                </Tree.Group>
                            </Tree.Item>
                            <Tree.Item aria-selected="false">
                                {plusIcon} {planetIcon} Mars
                                <Tree.Group>
                                    <Tree.Item>{planetIcon} Phobos</Tree.Item>
                                    <Tree.Item>{planetIcon} Deimos</Tree.Item>
                                </Tree.Group>
                            </Tree.Item>
                        </Tree.Group>
                    </Tree.Item>
                </Tree.Group>
            </Tree>
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