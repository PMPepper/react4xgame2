import { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { t } from '@lingui/macro';

//Components
import Tabs from 'components/ui/Tabs';
import Tree from 'components/ui/Tree';
import Entity from 'components/game/Entity';
import Tooltip from 'components/ui/Tooltip';
import Table from 'components/display/Table';
import Table2 from 'components/ui/Table';
import Pagination from 'components/ui/Pagination';

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

const tableColumns = [
    {
        name: 'name',
        label: 'Name',
        rowHeader: true,
        sortType: 'alphabetical'
    },
    {
        name: 'age',
        label: 'Age',
        sortType: 'numeric'
    },
    {
        name: 'salary',
        label: 'Salary',
        sortType: 'numeric',
        format: 'numeric',
    },
    {
        name: 'role',
        label: 'Role',
        sortType: 'alphabetical'
    },
    {
        name: 'notes',
        label: 'Notes',
    }
];

const tableData = [[
    {
        name: 'Peter',
        age: 44,
        salary: 25000,
        role: 'Janitor',
        notes: 'ecjefi sdcvkljerijsdcmkllcdsj cvijsefv iojsdcvmkl je jlsdcxmk j er'
    },
    {
        name: 'James',
        age: 29,
        salary: 23450,
        role: 'Cook',
        notes: 'k dscjk sdefkl; kldxcsefokl;n sdfkl;d f kdf '
    },
    {
        name: 'Laura',
        age: 40,
        salary: 23450,
        role: 'Cook',
        notes: 'opjkedkm sd kmwsefokdsxck nmlkldsfc kmsdckmlsef xcdf'
    },
    {
        name: 'Sarah',
        age: 53,
        salary: 17500,
        role: 'Receptionist',
        notes: 'kmlj;cdklm  m kldxcfl;m sdefopjsdxcm,l lcds m'
    },
    {
        name: 'Kim',
        age: 35,
        salary: 55000,
        role: 'Accountant',
        notes: 'mkl cde cmk efcijo sdmcv sdc efd dfscec dcf'
    },
    {
        name: 'Arthur',
        age: 65,
        salary: 14500,
        role: 'Cleaner',
        notes: 'lkjsdefjk  c jlk; ewfc sxcl;kjsdefoj mdc jed'
    },
    {
        name: 'Anna',
        age: 19,
        salary: 15000,
        role: 'Cleaner',
        notes: 'ljkscdio ;lkcd klwepojm,kdv knlcelk;kl cdjecded '
    },
    {
        name: 'Ian',
        age: 31,
        salary: 37000,
        role: 'Gardener',
        notes: 'klndscknjlrv jklsdclkij sdciojioj vknm l;lkdecjcf'
    },

]];

//The component
export default function ColonyWindow() {
    const selectedSystemId = useSelector(state => state.selectedSystemId);

    //Internal state
    const [selectedIndex, setSelectedIndex] = useState(0);

    const [selectedTreeItem, setSelectedTreeItem] = useState([]);

    const items = useGetSystemItems(selectedSystemId);

    //TEMP
    const [sortCol, setSortCol] = useState(null);
    const [sortDir, setSortDir] = useState(null);

    const onSort = (sortCol, sortDir) => {
        setSortCol(sortCol);
        setSortDir(sortDir);
    }
    //END TEMP

    return <div className={classes.root}>
        <div className={classes.treeHolder}>
            <Tree caption="Some stuff about made up people" items={items} selectedItem={selectedTreeItem} setSelectedItem={setSelectedTreeItem} />
        </div>

        <div className={classes.main}>
            <Tabs selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex}>
                <Tabs.Tab label="Hello">
                    <div className="wysiwyg">
                        <p>The <Tooltip.Inline content={'foo bar'}>first tab</Tooltip.Inline></p>
                        <p>The second line of the first tab</p>
                    </div>
                    <div>
                        <Table2 caption="A table of some made up people" columns={tableColumns} data={tableData} onSort={onSort} sortDir={sortDir} sortCol={sortCol} />
                        <br />
                        <Pagination page={3} totalPages={12} />
                        <br />
                        <Table columns="auto auto auto auto">
                            <Table.Caption>Example table caption</Table.Caption>
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
                                    <Table.Cell>ef sfsefsdfcw fsdvcsdfs efsadczc edsdfcd sfc edfsdcsfe csed fsexce fasdfcfc edds</Table.Cell>
                                </Table.Row>
                                <Table.Row even>
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
                                <Table.Row even>
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
                                <Table.Row even>
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
                            <Table.Body>
                                <Table.Row even>
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
                                <Table.Row even>
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
                            <Table.Body>
                                <Table.Row even>
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
                                <Table.Row even>
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
                            <Table.Body>
                                <Table.Row even>
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
                                <Table.Row even>
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
                    </div>
                    
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