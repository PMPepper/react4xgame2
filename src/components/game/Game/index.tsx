import React, { useCallback, useEffect, useState, useMemo, useContext, createContext } from 'react';
import { Trans, t } from '@lingui/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

import styles from './Game.module.scss';

//Components
import {ClientStateContextProvider} from 'components/game/ClientStateContext';
import WindowManager from 'components/WindowManager';
import SystemMap, { SystemMapOnContextMenuHandler } from 'components/SystemMap';
//import FPSStats, {PerformanceStats, ExternalPerformanceStats} from 'components/dev/FPSStats';
import TimeControls from 'components/game/TimeControls';
import SelectSystem from 'components/game/SelectSystem';
import ContextMenu from 'components/ui/ContextMenu';
import Menu from 'components/ui/Menu';
import Memo from 'components/ui/Memo';
import Entity from 'components/game/Entity';
import ColonyWindow from 'components/game/ColonyWindow';

//reducers
import{set as setSystemMapFollowing} from 'redux/reducers/systemMapFollowing';

//Hooks
import useWindowSize from 'hooks/useWindowSize';

//Helpers
import mean from 'helpers/math/mean';
import roundTo from 'helpers/math/round-to';

//Types
import { GameConfiguration } from 'types/game/shared/game';
import useAppSelector from 'hooks/useAppSelector';
import useAppDispatch from 'hooks/useAppDispatch';

//Contexts
const GameConfigContext = createContext<GameConfiguration<false>>(undefined);
GameConfigContext.displayName = 'GameConfigContext';

export function useGameConfig() {
  return useContext(GameConfigContext);
}

//Constants
const windows = [
  <WindowManager.Window key="colony" x={50} y={150} width={800} height={450} minWidth={400} minHeight={250} title={<Trans>Colony</Trans>}>
    <ColonyWindow />
  </WindowManager.Window>,
  <WindowManager.Window key="technology" x={600} y={500} width={350} height={150} minWidth={400} title={<Trans>Technology</Trans>}>
    <p>TODO content for this window</p>
  </WindowManager.Window>
]

//The component
export default function Game({
  client
}) {
  //Redux
  const selectedSystemId = useAppSelector(state => state.selectedSystemId);
  const systemMapFollowing = useAppSelector(state => state.systemMapFollowing);
  const systemMapOptions = useAppSelector(state => state.systemMapOptions);

  const dispatch = useAppDispatch();

  //Calculated values
  const windowSize = useWindowSize();

  //Internal state
  const [clientState, setClientState] = useState(() => client.gameState);
  //const [setClientState, setClientStateValues] = useMeasureSetFrequency(_setClientState);//intercept calls to setClientState to measure their frequency
  const [contextMenuState, setContextMenuState] = useState<undefined | {position: {x: number, y: number}, entityIds: number[]}>(undefined);

  //Callbacks
  const setFollowing = useCallback(
    following => dispatch(setSystemMapFollowing(following)),
    [dispatch]
  );

  const onSystemMapContextMenu = useCallback<SystemMapOnContextMenuHandler>(
    (e, x, y, entityIds) => {
      e.preventDefault();
      setContextMenuState({position: {x, y}, entityIds});
    },
    []
  );

  //Side effect
  useEffect(
    () => {//TODO why is clientState updating even while paused?
      client.setUpdateStateCallback(setClientState);

      return () => client.setUpdateStateCallback(null);
    },
    [client]
  );

  //Render
  const content = useMemo(
    () => {
      return <WindowManager area={windowSize}>
        {windows}
        <TimeControls
          setIsPaused={client.setIsPaused}
          setDesiredSpeed={client.setDesiredSpeed}
        />
        <SelectSystem />
        <SystemMap
          options={systemMapOptions}
          following={systemMapFollowing}
          systemId={selectedSystemId}
          setFollowing={setFollowing}
          onContextMenu={onSystemMapContextMenu}
          aria-haspopup="menu"
          aria-controls="systemMapContextMenu"
        />
      </WindowManager>
    },
    [windowSize, client.setIsPaused, client.setDesiredSpeed, systemMapOptions, systemMapFollowing, selectedSystemId, setFollowing, onSystemMapContextMenu]
  );

  const contextMenu = useMemo(
    () => contextMenuState ?
      getContextMenuFor(contextMenuState, () => setContextMenuState(null))
      :
      null,
    [contextMenuState, setContextMenuState]
  );

  return <div className={styles.game}>
    <GameConfigContext.Provider value={client.initialGameState}>
      {/*<FPSStats />
      <DisplayStats formatAvgValue={values => `${values.length > 1 ? Math.round(mean(...values)) : '-'} Ticks/s`} values={setClientStateValues} style={{right: '80px'}} />
      <PerformanceStats name="updatingGame :: decode data" formatAvgValue={minMaxMean} style={{right: '155px'}} />
      <PerformanceStats name="updatingGame :: merge state" formatAvgValue={minMaxMean} style={{right: '230px'}} />
      <ExternalPerformanceStats name="server :: updatingGame :: toBinary" formatAvgValue={minMaxMean} style={{right: '305px'}} />*/}
      <ClientStateContextProvider value={clientState}>
        <Memo useChildren>{content}</Memo>
        {contextMenu && <Memo useChildren>{contextMenu}</Memo>}
      </ClientStateContextProvider>
    </GameConfigContext.Provider>
  </div>
}

//TEMP
function minMaxMean(values, dp = 2, units = '') {
  if(!values || values.length < 2) {
    return `-${units}`
  }

  return `${roundTo(Math.min(...values), dp)}${units}/${roundTo(Math.max(...values), dp)}${units}/${roundTo(mean(...values), dp)}${units}`;
}

//Internal helpers
function getContextMenuFor({position, entityIds}, onClose) {//
  return <ContextMenu onClose={onClose} position={position}>
    <Menu id="systemMapContextMenu" aria-label={t`System map options`} items={[
      {
        icon: <FontAwesomeIcon icon={solid('globe')} />, 
        label: <Trans>System bodies</Trans>, 
        info: t`planets and stuff`, 
        items: entityIds.map(entityId => 
          ({label: <Entity.Name id={entityId} />, onClick: () => alert('TODO')})
        )
      },
      Menu.DividerName,
      {
        icon: <FontAwesomeIcon icon={solid('city')} />,
        label: <Trans>Colonies</Trans>,
        info: t`view your stuff`,
        items: [],//TODO
      },
      Menu.DividerName,
      {
        label: <Trans>Other</Trans>,
        onClick: () => alert('TODO other')
      },
      {
        label: <Trans>Things</Trans>,
        info: t`and stuff`,
        onClick: () => alert('TODO things')
      },
      {
        label: <Trans>Help?</Trans>,
        //onClick: () => alert('TODO help')
        items: [
          {label: 'A', onClick: () => alert('TODO A')},
          {label: 'B', onClick: () => alert('TODO B')},
          Menu.DividerName,
          {label: 'X', items: [
            {label: 'X2', onClick: () => alert('X2')},
            {label: 'X3', onClick: () => alert('X3')}
          ]},
          {label: 'Y', onClick: () => alert('Y')},
          {label: 'Z', onClick: () => alert('Z')},
        ]
      }
    ]} />
  </ContextMenu>
}


// import React from 'react';
// import {compose} from 'recompose';
// import {connect} from 'react-redux';
// import {Trans} from '@lingui/macro'

// import styles from './styles.scss';
// import SystemMap from '../SystemMap/SystemMap';

// import WindowColonies from '../WindowColonies';

// import Panel from '@/components/panel/Panel';
// import Button from '@/components/button/Button';
// import Window from '@/components/window/ConnectedWindow';
// import SortChildren from '@/components/sortChildren/SortChildren';
// import Time from '@/components/time/Time';
// import Icon from '@/components/icon/Icon';
// import AddContextMenu from '@/components/contextMenu/AddContextMenu';

// import FPSStats from '@/components/dev/FPSStats';
// //import Icon from '@/components/icon/Icon';
// import Test from '../Test';



// //helpers
// import cloneOmittingProps from '@/helpers/react/clone-omitting-props';
// import sortArrayOnPropertyNumeric from '@/helpers/sorting/sort-array-on-property-numeric';

// //reducers
// import {open, close} from '@/redux/HORs/isOpen';
// import {setFollowing as setSystemMapFollowing, setOptions as setSystemMapOptions} from '@/redux/reducers/systemMap';
// import {setSelectedSystemId} from '@/redux/reducers/selectedSystemId';
// import {setSelectedColonyId} from '@/redux/reducers/coloniesWindow';


// function Game({
//   coloniesWindow, fleetsWindow, shipDesignWindow,
//   clientState, client,
//   systemMap, setSystemMapFollowing, setSystemMapOptions,
//   selectedSystemId, setSelectedSystemId,
//   setSelectedColonyId,
//   open, close
// }) {
//   const entities = clientState.entities;
//   const entityIds = clientState.entityIds;

//   return <div className={styles.game}>
//     <AddContextMenu key={selectedSystemId} getItems={(e, entityScreenPositions) => {
//       const items = [];

//       const clickX = e.clientX;
//       const clickY = e.clientY;

//       const factionId = clientState.factionId;

//       //get all system bodies with r OR within mininmum of ...3 px?
//       const minSystemBodyDist = 3;
//       const systemBodies = [];

//       entityScreenPositions.forEach(position => {
//         const entity = entities[position.id];

//         if(entity.type === 'systemBody') {
//           const r = Math.max(minSystemBodyDist, position.r);

//           const dx = position.x - clickX;
//           const dy = position.y - clickY;

//           const d = (dx * dx) + (dy * dy);

//           if(d <= (r * r)) {
//             systemBodies.push({d, entity});
//           }
//         }
//       });

//       sortArrayOnPropertyNumeric(systemBodies, 'd');

//       systemBodies.forEach(item => {
//         const systemBody = item.entity;

//         const factionSystemBody = clientState.getFactionSystemBodyFromSystemBody(systemBody);


//         const systemBodyItem = {
//           label: factionSystemBody.factionSystemBody.name,
//           icon: <Icon icon="globe" />,
//           items: []
//         };

//         //Colonies stuff
//         if(systemBody.systemBody.type !== 'star') {
//           const colonies = clientState.getColoniesForSystemBody(systemBody) || [];

//           let hasOwnColony = false;

//           colonies.forEach(colony => {
//             if(colony.factionId === factionId) {
//               hasOwnColony = true;
//             }

//             systemBodyItem.items.push({
//               label: entities[colony.factionId].faction.name,
//               action: colony.factionId === factionId ? () => {
//                 setSelectedColonyId(colony.id);//and select this colony
//                 setSystemMapFollowing(colony.systemBodyId);
//                 open('coloniesWindow');//open up colonies window
//               } : null
//             });
//           })

//           if(!hasOwnColony) {
//             systemBodyItem.items.unshift({
//               label: <Trans>Create colony</Trans>,
//               action: () => {
//                 client.createColony(systemBody.id);
//               }
//             })
//           }

//           systemBodyItem.items.push('spacer');
//         }

//         systemBodyItem.items.push({
//           label: <Trans>Body info</Trans>,
//           action: () => {alert('TODO')}
//         });

//         items.push(systemBodyItem);
//       })


//       return items;
//     }}>
//       <SystemMap clientState={clientState} {...systemMap} systemId={selectedSystemId} setFollowing={setSystemMapFollowing} systemMapRef={(ref) => {console.log(ref)}} />
//     </AddContextMenu>
//     <div className={styles.toolbar}>
//       <div className="hspaceStart">
//         <Button onClick={() => {open('coloniesWindow')}}><Trans id="toolbar.colonies">Colonies</Trans></Button>
//         <Button onClick={() => {open('fleetsWindow')}}><Trans id="toolbar.fleets">Fleets</Trans></Button>
//         <Button onClick={() => {open('shipDesignWindow')}}><Trans id="toolbar.shipDesign">Ship design</Trans></Button>
//       </div>
//     </div>

//     <div className={styles.controls}>
//       <div className="vspaceStart">
//         <div className="hspaceStart">
//           <Button selected={!!clientState.isPaused} onClick={() => {client.setIsPaused(!clientState.isPaused)}}>
//             <span className="offscreen"><Trans id="toolbar.togglePaused">Toggle paused game</Trans></span>
//             <Icon icon="pause" />
//           </Button>

//           <Button selected={clientState.desiredGameSpeed === 1} onClick={() => {client.setDesiredSpeed(1)}}>
//             <span className="offscreen"><Trans id="toolbar.realTime">Play at real time</Trans></span>
//             <Icon icon="play" />
//           </Button>

//           <Button selected={clientState.desiredGameSpeed === 2} onClick={() => {client.setDesiredSpeed(2)}}>
//             <span className="offscreen"><Trans id="toolbar.x60">Play at 1 minute per second</Trans></span>
//             <Icon icon="play" />
//             <Icon icon="play" />
//           </Button>

//           <Button selected={clientState.desiredGameSpeed === 3} onClick={() => {client.setDesiredSpeed(3)}}>
//             <span className="offscreen"><Trans id="toolbar.x3600">Play at 1 hour per second</Trans></span>
//             <Icon icon="play" />
//             <Icon icon="play" />
//             <Icon icon="play" />
//           </Button>

//           <Button selected={clientState.desiredGameSpeed === 4} onClick={() => {client.setDesiredSpeed(4)}}>
//             <span className="offscreen"><Trans id="toolbar.x86400">Play at 1 day per second</Trans></span>
//             <Icon icon="play" />
//             <Icon icon="play" />
//             <Icon icon="play" />
//             <Icon icon="play" />
//           </Button>

//           <Button selected={clientState.desiredGameSpeed === 5} onClick={() => {client.setDesiredSpeed(5)}}>
//             <span className="offscreen"><Trans id="toolbar.x86400">Play at 1 day per second</Trans></span>
//             <Icon icon="play" />
//             <Icon icon="play" />
//             <Icon icon="play" />
//             <Icon icon="play" />
//             <Icon icon="play" />
//           </Button>
//         </div>
//         <Time value={clientState.gameTimeDate} format="datetime" />
//       </div>
//     </div>

//     <div className={styles.selectSystem}>
//       <select value={selectedSystemId} onChange={(e) => {setSelectedSystemId(+e.target.value)}}>
//         {clientState.knownSystems.map(knownSystem => (<option value={knownSystem.systemId} key={knownSystem.systemId}>{knownSystem.factionSystem.name}</option>))}
//       </select>
//     </div>

//     <Panel title={<Trans id="optionsPanel.title">Options</Trans>} className={styles.options}>[TODO options panel]</Panel>

//     <SortChildren sort={(a, b) => (a.props.lastInteracted - b.props.lastInteracted)} mapChild={(child) => (cloneOmittingProps(child, ['lastInteracted']))}>
//       <Window style={{width: '90%', maxWidth: '120rem'}} lastInteracted={coloniesWindow.lastInteracted} reduxPath="coloniesWindow" title={<Trans id="coloniesWindow.title">Colonies</Trans>}>
//         <WindowColonies />
//       </Window>
//       <Window lastInteracted={fleetsWindow.lastInteracted} reduxPath="fleetsWindow" title={<Trans id="fleetsWindow.title">Fleets</Trans>}>TODO fleets window!</Window>
//       <Window lastInteracted={shipDesignWindow.lastInteracted} reduxPath="shipDesignWindow" title={<Trans id="shipDesignWindow.title">Ship design</Trans>}>TODO ship design window!</Window>
//     </SortChildren>
//     <FPSStats isActive={true} />
//     {/*<Test />*/}
//   </div>
// }

// export default compose(
//   connect(state => {
//     return {
//       coloniesWindow: state.coloniesWindow,
//       fleetsWindow: state.fleetsWindow,
//       shipDesignWindow: state.shipDesignWindow,
//       clientState: state.game,

//       systemMap: state.systemMap,
//       selectedSystemId: state.selectedSystemId,
//     }
//   }, {
//     open,
//     close,
//     setSystemMapFollowing,
//     setSystemMapOptions,
//     setSelectedSystemId,
//     setSelectedColonyId,
//   })
// )(Game);
