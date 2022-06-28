import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { t } from '@lingui/macro';

//Components
import Tabs from 'components/ui/Tabs';
import Tree from 'components/ui/Tree';
import Entity from 'components/game/Entity';
import Tooltip from 'components/ui/Tooltip';
import Table from 'components/display/Table'

//Hooks
import { useGetContextState } from 'components/SelectableContext';

//Other
import classes from './ColonyWindow.module.scss';

//TEMP
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';


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
                <Tabs.Tab label="Hello">
                    <div className="wysiwyg">
                        <p>The <Tooltip.Inline content={'foo bar'}>first tab</Tooltip.Inline></p>
                        <p>The second line of the first tab</p>
                    </div>
                    
                    <Table columns="auto auto auto auto">
                        {/*<div style={{
                            border: '2px solid red',
                            gridArea: '3 / 1 / 6 / 3',
                        }}></div>*/}
                        <Table.Head>
                            <Table.Row>
                                <Table.HeaderCell scope="col"><Table.ColumnSort sortDir="asc">Name</Table.ColumnSort></Table.HeaderCell>
                                <Table.HeaderCell scope="col"><Table.ColumnSort>World</Table.ColumnSort></Table.HeaderCell>
                                <Table.HeaderCell scope="col"><Table.ColumnSort>Foo</Table.ColumnSort></Table.HeaderCell>
                                <Table.HeaderCell scope="col"><Table.ColumnSort>Bar</Table.ColumnSort></Table.HeaderCell>
                            </Table.Row>
                        </Table.Head>
                        <Table.Body>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Sooty</Table.HeaderCell>
                                <Table.Cell>243</Table.Cell>
                                <Table.Cell>D</Table.Cell>
                                <Table.Cell>ef sfsefsdfcw fsdvcsdfs efsadczc </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Sweep</Table.HeaderCell>
                                <Table.Cell>723</Table.Cell>
                                <Table.Cell>A</Table.Cell>
                                <Table.Cell>cesfdeef ced ce cessedf fdf </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Sue</Table.HeaderCell>
                                <Table.Cell>92</Table.Cell>
                                <Table.Cell>D</Table.Cell>
                                <Table.Cell>serfv sef fswefrg iokljhkl cwelkc</Table.Cell>
                            </Table.Row>
                        </Table.Body>
                        <Table.Body>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Paul</Table.HeaderCell>
                                <Table.Cell>12</Table.Cell>
                                <Table.Cell>-</Table.Cell>
                                <Table.Cell>ffdcevrred </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.HeaderCell scope="row">Ringo</Table.HeaderCell>
                                <Table.Cell>23234</Table.Cell>
                                <Table.Cell>A</Table.Cell>
                                <Table.Cell>sdcswefr ce f esfcefds fdf </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.HeaderCell scope="row">John</Table.HeaderCell>
                                <Table.Cell>2312</Table.Cell>
                                <Table.Cell>-</Table.Cell>
                                <Table.Cell>sdfcvrfsdc sedfdffesdcwefsd fffer </Table.Cell>
                            </Table.Row>
                            <Table.Row>
                                <Table.HeaderCell scope="row">George</Table.HeaderCell>
                                <Table.Cell>3</Table.Cell>
                                <Table.Cell>F</Table.Cell>
                                <Table.Cell>ewefsd efedf efcsfwef </Table.Cell>
                            </Table.Row>
                        </Table.Body>
                    </Table>
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
        [systemId, getContextState]
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