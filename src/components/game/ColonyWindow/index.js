import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { t } from '@lingui/macro';

//Components
import Tabs from 'components/ui/Tabs';
import Tree from 'components/ui/Tree';
import Entity from 'components/game/Entity';

//Other
import classes from './ColonyWindow.module.scss';
//Hooks
import { useGetContextState } from 'components/SelectableContext';

//TEMP
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

//plus square: f0fe

//Consts

const starIcon = <FontAwesomeIcon icon={solid("sun")} />;
const planetIcon = <FontAwesomeIcon icon={solid("globe")} />;
const asteroidIcon = <FontAwesomeIcon icon={solid("cookie")} />;
//const moonIcon = <FontAwesomeIcon icon={solid("minus-square")} />;

//The component
export default function ColonyWindow() {
    const selectedSystemId = useSelector(state => state.selectedSystemId);

    //Internal state
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [selectedTreeItem, setSelectedTreeItem] = useState([]);

    const items = useGetSystemItems(selectedSystemId);

    return <div className={classes.root}>
        <div className={classes.treeHolder}>
            <Tree items={items} selectedItem={selectedTreeItem} setSelectedItem={setSelectedTreeItem} />
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


//internal helpers
function useGetSystemItems(systemId) {
    const firstTimeRef = useRef(true);
    const getContextState = useGetContextState();

    const [items, setItems] = useState(() => getSystemItems(systemId, getContextState()))

    useEffect(
        () => {
            if(firstTimeRef.current) {
                firstTimeRef.current = false;
            } else {
                setItems(getSystemItems(systemId, getContextState()))
            }
        },
        [systemId]
    );

    return items;
}

const systemBodyTypeIcon = {
    star: starIcon,
    planet: planetIcon,
    moon: planetIcon,
    gasGiant: planetIcon,
    dwarfPlanet: planetIcon,
    asteroid: asteroidIcon,
};

//TODO use 'position' array instead of assuming systemBodyIds is in correct order
function getSystemItems(systemId, {entities}) {
    const system = entities[systemId];
    const systemBodies = system.systemBodyIds.map(id => entities[id]);

    const entityItem = new Map();

    const items = [];

    let asteroidBelt = null;

    systemBodies.forEach((systemBody) => {
        const parentList = systemBody.movement ?
            entityItem.get(systemBody.movement.orbitingId).items
            :
            items;
        
        const item = {
            icon: systemBodyTypeIcon[systemBody.systemBody.type],
            label: <Entity.Name id={systemBody.id} />
        };

        entityItem.set(systemBody.id, item);

        if(systemBody.systemBody.type === 'asteroid') {
            if(!asteroidBelt) {
                //create new item for the asteroid belt
                asteroidBelt = {
                    icon: null,//TODO asteroid belt icon?
                    label: t`[Asteroid belt]`,
                    items: []
                };

                parentList.push(asteroidBelt);
            }

            asteroidBelt.items.push(item);//add to asteroid belt
        } else {
            asteroidBelt = null;
            parentList.push(item);
        }

        if(systemBody.systemBody.children?.length > 0) {
            item.items = [];
        }

        //Temp code
        if(items === parentList) {
            item.expanded = true;
        }
    })

    return items;
}