//TODO set limits on zoom/scroll
import {useRef, useCallback, useMemo, useEffect, memo} from 'react';
import objectpool from 'objectpool';


import defaultStyles from './systemMap.module.scss';
import SystemMapSVGRenderer from './SystemMapSVGRenderer';
import EntityRenderers from './entityRenderers/index';

//Hooks
import useWindowSize from 'hooks/useWindowSize';
import useKeyboardInput from 'hooks/useKeyboardInput';
import useAnimationFrame from 'hooks/useAnimationFrame';
import useForceUpdate from 'hooks/useForceUpdate';
import {useGetContextState} from 'components/SelectableContext';

//Helpers
import flatten from 'helpers/array/flatten';
import {getColoniesBySystemBody, getRenderableEntities} from 'game/ClientState';

//constants
import {startFadeRadius, startFadeOrbitRadius} from 'components/game/GameConsts';

const normalScrollSpeed = 200;//pixels per second
const fastScrollSpeed = 500;//pixels per second

const baseScrollEaseFactor = 1/3;

const normalZoomSpeed = 2;
const fastZoomSpeed = 4;

const normalWheelZoomSpeed = 1.15;
const fastWheelZoomSpeed = 1.5;

const zoomEaseFactor = 1/3;
const zoomEaseThreshold = 0.0001;

//time (in seconds) over which easing gets ramped from base to 1 when following a position
//this is to catch up with fast objects
const followExtraEaseTime = 0.5;


//The component
export default memo(function SystemMap({
  options, systemId, following, setFollowing, initialX = 0, initialY = 0, initialZoom = 1/1000000000, cx = 0.5, cy = 0.5, 
  onContextMenu = null, 
  renderComponent:RenderComponent = SystemMapSVGRenderer, styles = defaultStyles
}) {
  const getClientState = useGetContextState();
  const clientState = getClientState();

  const ref = useRef({
    x: initialX, y: initialY, zoom: initialZoom, tx: initialX, ty: initialY, tzoom: initialZoom, 
    following: null, followingTime: 0, lastFollowing: null, isMouseDragging: false, lastClientState: null,
    entityScreenPositions: [], renderPrimitives: [], mouseClientX: null, mouseClientY: null,
    mouseDownWorldCoords: {x: 0, y: 0}, dragMouseX: 0, dragMouseY: 0
  });

  //calculated values
  const forceUpdate = useForceUpdate();
  const windowSize = useWindowSize();
  const controls = useMemo(
    () => flatten(Object.values(options.controls)),
    [options.controls]
  )
  const {props: keyboardInputProps, isKeyDown} = useKeyboardInput(controls);

  //update state
  ref.current.following = following;
  ref.current.windowSize = windowSize;

  //Callbacks
  const screenToWorld = useCallback(
    (screenX, screenY, options) => {
      const {windowSize} = ref.current;

      const x = options && ('x' in options) ? options.x : ref.current.x;
      const y = options && ('y' in options) ? options.y : ref.current.y;
      const zoom = options && ('zoom' in options) ? options.zoom : ref.current.zoom;

      screenX -= windowSize.width * cx;
      screenY -= windowSize.height * cy;

      return {
        x: x + (screenX / zoom),
        y: y + (screenY / zoom),
      };
    },
    [cx, cy]
  );

  // const worldToScreen = useCallback(
  //   (worldX, worldY) => {
  //     const {x, y, zoom, windowSize} = ref.current;

  //     return {
  //       x: ((worldX - x) * zoom) + (windowSize.width * cx),
  //       y: ((worldY - y) * zoom) + (windowSize.height * cy)
  //     };
  //   },
  //   [cx, cy]
  // );

  //event handlers
  const onDragMove = useCallback(
    (e) => {
      e.preventDefault();

      ref.current.isMouseDragging = true;

      ref.current.dragMouseX = e.clientX;
      ref.current.dragMouseY = e.clientY;
    },
    []
  );

  const endDragging = useCallback(
    (e) => {
      e?.preventDefault();

      ref.current.isMouseDragging = false;

      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', endDragging);
    },
    [onDragMove]
  );

  const onMouseDown = useCallback(
    (e) => {
      ref.current.dragMouseX = e.clientX;
      ref.current.dragMouseY = e.clientY;

      ref.current.mouseDownWorldCoords = screenToWorld(e.clientX, e.clientY);

      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', endDragging);
    },
    [screenToWorld, onDragMove, endDragging]
  )

  const onMouseMove = useCallback(
    (e) => {
      ref.current.mouseClientX = e.clientX;
      ref.current.mouseClientY = e.clientY;
    },
    []
  );

  const onMouseLeave = useCallback(
    (e) => {
      ref.current.mouseClientX = null;
      ref.current.mouseClientY = null;
    },
    []
  );

  const onClick = useCallback(
    (e) => {
      const clickX = e.clientX;
      const clickY = e.clientY

      const clickedEntity = ref.current.entityScreenPositions.find(position => {
        if(position.r === 0) {
          return false;
        }

        const dx = position.x - clickX;
        const dy = position.y - clickY;

        return (dx * dx) + (dy * dy) <= (position.r * position.r);
      })

      clickedEntity && setFollowing(clickedEntity.id);
    },
    [setFollowing]
  );

  const onWheel = useCallback(
    (e) => {
      const wheelZoomSpeed = isKeyDown(options.controls.fast) ? fastWheelZoomSpeed : normalWheelZoomSpeed;

      if(e.deltaY < 0) {
        ref.current.tzoom *= wheelZoomSpeed;
      } else if(e.deltaY > 0) {
        ref.current.tzoom *= (1 / wheelZoomSpeed);
      }
    },
    [options.controls.fast, isKeyDown]
  );

  const onFrameUpdate = useCallback(
    (elapsedTime) => {
      const clientState = getClientState();

      //const {props, state, mouseClientX, mouseClientY, isMouseDragging} = this;
      const {lastClientState, windowSize, mouseClientX, mouseClientY, isMouseDragging, x, y, zoom, following, mouseDownWorldCoords, dragMouseX, dragMouseY} = ref.current;

      const newState = {x: x, y: y, zoom: zoom};
      let hasScrolled = false;//has moved camera left/right/up/down, doesn't care about zooming < used to determine if we should stop following
      let isFollowing = false;

      //-keyboard zooming
      const zoomSpeed = (isKeyDown(options.controls.fast) ? fastZoomSpeed : normalZoomSpeed);//<TODO take into account elapsed time (frame rate)

      if(isKeyDown(options.controls.zoomIn)) {//zoom in
        ref.current.tzoom *= Math.pow(zoomSpeed, elapsedTime);
      } else if(isKeyDown(options.controls.zoomOut)) {//zoom out
        ref.current *= Math.pow(1 / zoomSpeed, elapsedTime);
      }

      if(isMouseDragging) {
        following && setFollowing(null);

        //set target position to wherever places the mouseDownWorldCoords at the
        //current dragMouse screen position
        ref.current.tx = mouseDownWorldCoords.x -((dragMouseX - (windowSize.width * cx) ) / zoom);
        ref.current.ty = mouseDownWorldCoords.y -((dragMouseY - (windowSize.height * cy) ) / zoom);
      } else {
        //Take keyboard input scrolling
        const scrollSpeed = ((isKeyDown(options.controls.fast) ? fastScrollSpeed : normalScrollSpeed) * elapsedTime) / zoom;

        //-scrolling
        if(isKeyDown(options.controls.scrollRight) || (!following && mouseClientX !== null && (options.mouseEdgeScrolling + mouseClientX >= windowSize.width))) {//right
          ref.current.tx += scrollSpeed;
          hasScrolled = true;
        } else if(isKeyDown(options.controls.scrollLeft) || (!following && mouseClientX !== null && (mouseClientX < options.mouseEdgeScrolling))) {//left
          ref.current.tx -= scrollSpeed;
          hasScrolled = true;
        }

        if(isKeyDown(options.controls.scrollDown) || (!following && mouseClientY !== null && (options.mouseEdgeScrolling + mouseClientY >= windowSize.height))) {//down
          ref.current.ty += scrollSpeed;
          hasScrolled = true;
        } else if(isKeyDown(options.controls.scrollUp) || (!following && mouseClientY !== null && (mouseClientY < options.mouseEdgeScrolling))) {//up
          ref.current.ty -= scrollSpeed;
          hasScrolled = true;
        }

        //follow current target
        if(following) {
          if(hasScrolled) {
            //user has scrolled, stop following current target
            setFollowing(null);
            ref.current.lastFollowing = null;
            ref.current.followingTime = 0;
          } else {
            const followEntity = clientState.entities[following];

            //This is an entity that has a position, so can be followed...
            if(followEntity.position) {
              ref.current.tx = followEntity.position.x;
              ref.current.ty = followEntity.position.y;
              isFollowing = true;
            }
          }
        }

        if(ref.current.lastFollowing) {
          if(isFollowing) {
            if(following === ref.current.lastFollowing) {
              //still following the same thing
              ref.current.followingTime += elapsedTime;
            } else {
              //switched to following something new
              ref.current.lastFollowing = following;
              ref.current.followingTime = 0;
            }
          } else {
            //no longer following a thing
            ref.current.lastFollowing = null;
            ref.current.followingTime = 0;
          }
        } else if(isFollowing) {
          //am now following something
          ref.current.lastFollowing = following;
          ref.current.followingTime = 0;
        }
      }//end not currently mouse dragging

      //Ease zooming
      newState.zoom += ((ref.current.tzoom - newState.zoom) * zoomEaseFactor);

      if(Math.abs(1 - (newState.zoom / ref.current.tzoom)) < zoomEaseThreshold) {
        newState.zoom = ref.current.tzoom;//zoom easing finished
      }

      //keep zooming centered
      if(!isFollowing && newState.zoom !== zoom) {
        if(mouseClientX !== null && mouseClientY !== null) {
          const mouseZoomWorldCurPos = screenToWorld(mouseClientX, mouseClientY);
          const mouseZoomWorldNewPos = screenToWorld(mouseClientX, mouseClientY, {zoom: newState.zoom});

          const zoomDX = -(mouseZoomWorldNewPos.x - mouseZoomWorldCurPos.x);
          const zoomDY = -(mouseZoomWorldNewPos.y - mouseZoomWorldCurPos.y);

          newState.x += zoomDX;
          newState.y += zoomDY;

          ref.current.tx += zoomDX;
          ref.current.ty += zoomDY;
        }
      }

      //convert target x/y to real x/y with easing
      let easeFactor = baseScrollEaseFactor;
      const easeThreshold = 1 / zoom;
      const distanceFromTarget = Math.sqrt(Math.pow(ref.current.tx - newState.x, 2) + Math.pow(ref.current.ty - newState.y, 2));

      //if you're following something slowly reduce the easing to nothing so the
      //camera will catch up with it, even if it's moving quickly
      if(ref.current.followingTime > 0) {
        easeFactor += (ref.current.followingTime / followExtraEaseTime) * (1 - easeFactor);
      }

      //if easing not required
      if(easeFactor >= 1 || distanceFromTarget <= easeThreshold) {
        //just move to target
        newState.x = ref.current.tx;
        newState.y = ref.current.ty;
      } else {
        //apply easing
        newState.x += ((ref.current.tx - newState.x) * easeFactor);
        newState.y += ((ref.current.ty - newState.y) * easeFactor);
      }

      //If anything changes, force a re-render
      if(lastClientState !== clientState || newState.x !== x || newState.y !== y || newState.zoom !== zoom) {
        ref.current.x = newState.x;
        ref.current.y = newState.y;
        ref.current.zoom = newState.zoom;

        ref.current.lastClientState = clientState;
        
        //force re-render
        forceUpdate();
      }
    },
    [options, setFollowing, cx, cy, forceUpdate, isKeyDown, screenToWorld]
  )

  //update on each frame
  useAnimationFrame(onFrameUpdate);

  //Side effects
  useEffect(
    () => {
      //if following a new system body, set appropriate zoom level
      if(following) {
        ref.current.tzoom = Math.max(ref.current.tzoom, getSystemBodyVisibleMaxZoom(clientState.entities[following]));
      }
    },
    //I explicitly do NOT want this to execute every time clientState.entities changes. 
    [following]//eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    return endDragging;//tidy up on unload
  }, [endDragging]);


  const elementProps = useMemo(
    () => ({
      ...keyboardInputProps,
      onMouseDown,
      onMouseMove,
      onMouseLeave,
      onClick,
      onWheel,
      onContextMenu: onContextMenu ? (e) => {
        const {clientX, clientY} = e;

        onContextMenu(e, clientX, clientY, ref.current.entityScreenPositions.filter(({x, y, r}) => {
          const d = (clientX - x) ** 2 + (clientY - y) ** 2;

          return d <= Math.max(5, r) ** 2;
        }).map(({id}) => id));
      } : null
    }),
    // all the other props are 100% memoised, so will never become 'stale'
    [onContextMenu]//eslint-disable-line react-hooks/exhaustive-deps
  );

  //Render
  let {x, y, zoom, entityScreenPositions, renderPrimitives} = ref.current;
  const colonies = getColoniesBySystemBody(clientState, systemId);

  //center in window
  x -= (windowSize.width * cx) / zoom;
  y -= (windowSize.height * cy) / zoom;

  //return previous primitives to the pool
  renderPrimitives.forEach(primitive => {
    switch (primitive.t) {
      case 'circle':
        circlePool.release(primitive);
        break;
      case 'text':
        textPool.release(primitive);
        break;
      default:
        debugger;//shouldn't happen!
    }
  });
  renderPrimitives.length = 0;

  //reset entityScreenPositions to pool
  entityScreenPositions.forEach(position => positionsPool.release(position));
  entityScreenPositions.length = 0;

  //Get new primitives + screen positions
  getRenderableEntities(clientState, systemId)
    .forEach(entity => EntityRenderers[entity.render.type]?.(renderPrimitives, entityScreenPositions, windowSize, x, y, zoom, entity, clientState.entities, clientState.factionEntities, colonies, options.display));

  //Output rendered content
  return <RenderComponent
    x={x}
    y={y}
    zoom={zoom}
    renderPrimitives={renderPrimitives}
    styles={styles}
    options={options.display}
    {...windowSize}
    {...elementProps}
  />
});



//TODO only works with circular orbits (all I have right now)
export function getSystemBodyVisibleMaxZoom(systemBodyEntity) {
  const parent = systemBodyEntity.movement && systemBodyEntity.movement.orbitingId;
  const systemBodyRadius = systemBodyEntity.systemBody.radius;

  const radiusMaxZoom = startFadeRadius / systemBodyRadius;

  //if you're orbiting something, check the max zoom before this starts to fade
  if(parent) {
    const orbitRadius = systemBodyEntity.movement.radius;

    const orbitRadiusMaxZoom = (startFadeOrbitRadius / orbitRadius) * 1.2;

    return Math.max(orbitRadiusMaxZoom, radiusMaxZoom);
  }

  return radiusMaxZoom;
}



//define object pools + generators
const circlePool = objectpool.generate({t: 'circle', id: null, x: 0, y: 0, r: 0, opacity: 0, type: null, subType: null}, {count: 250, regenerate: 1});
const textPool = objectpool.generate({t: 'text', text: null, id: null, x: 0, y: 0, opacity: 0, type: null, subType: null}, {count: 250, regenerate: 1});

export function circle(id, x, y, r, opacity, type, subType) {
  const circle = circlePool.get();

  circle.id = id;
  circle.x = x;
  circle.y = y;
  circle.r = r;
  circle.opacity = opacity;
  circle.type = type;
  circle.subType = subType;

  return circle;
}

export function text(id, textVal, x, y, opacity, type, subType) {
  const text = textPool.get();

  text.id = id;
  text.text = textVal;
  text.x = x;
  text.y = y;
  text.opacity = opacity;
  text.type = type;
  text.subType = subType;

  return text;
}

//entity position pool
const positionsPool = objectpool.generate(
  {id: null, x: 0, y: 0, r: 0},
  {
    count: 250,
    regenerate: 1
  }
);

export function position(id, x, y, r) {
  const position = positionsPool.get();

  position.id = id;
  position.x = x;
  position.y = y;
  position.r = r;

  return position;
}
