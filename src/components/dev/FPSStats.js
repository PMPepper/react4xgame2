import { useMemo, useCallback, useState, useEffect, useRef, createFactory } from "react";

//Components
import Canvas from "components/canvas/Canvas";

//Hooks
import useAnimationFrame from "hooks/useAnimationFrame";

//Other
import defaultStyles from './FPSStats.module.scss';
import Performance from "classes/Performance";

//Constants
const defaultGraphWidth = 70;
const defaultGraphHeight = 30;


//The component
export default function FPSStats({graphWidth = defaultGraphWidth, ...rest}) {
  const [values, setValues] = useState([]);

  const onAnimationFrame = useCallback(
    (deltaTime) => {
      //setValues
      setValues(values => addValue(values, Math.round(1/deltaTime), graphWidth))
    },
    [setValues, graphWidth]
  );

  useAnimationFrame(onAnimationFrame);

  return <DisplayStats formatAvgValue={formatFPSData} values={values} graphWidth={graphWidth} {...rest} />
}

function formatFPSData(values) {
  const curFPS = values.length === 0 ? `-` : values[values.length - 1];
  
  return `${curFPS} FPS`;
}

function addValue(values, newValue, maxValues) {
  const keepValues = values.length > maxValues - 1 ?
    values.slice(-(maxValues-1))
    :
    values.slice()
    
  keepValues.push(newValue);

  return keepValues;
}

function addValues(values, newValues, maxValues) {
  const output = [...values, ...newValues];
  
  return output.length > maxValues ?
    output.slice(-maxValues)
    :
    output;
}


export function useMeasureSetFrequency(setFunc, maxValues = defaultGraphWidth) {
  const [values, setValues] = useState([]);
  const lastTimeRef = useRef();

  if(!lastTimeRef.current) {
    lastTimeRef.current = performance.now();
  }

  const measuredSetFunc = useCallback(
    (value) => {
      const now = performance.now();
      setValues(values => addValue(values, 1000 / (now - lastTimeRef.current), maxValues));
      lastTimeRef.current = now;

      return setFunc(value);
    },
    [setFunc, setValues, maxValues]
  )

  return [measuredSetFunc, values]
}

export function PerformanceStats({name, graphWidth = defaultGraphWidth, ...rest}) {
  const valuesRef = useRef([]);


  const entries = Performance.getEntriesByName(name, 'measure').map(entry => entry.duration);

  if(entries.length) {
    valuesRef.current = addValues(valuesRef.current, entries, graphWidth)
  }

  return <DisplayStats {...rest} values={valuesRef.current} />
}

export function ExternalPerformanceStats({name, graphWidth = defaultGraphWidth, ...rest}) {
  const [values, setValues] = useState([]);

  const callback = useCallback(
    (newValues) => {
      setValues(values => addValues(values, newValues, graphWidth))
    },
    [graphWidth]
  );

  useEffect(
    () => {
      Performance.registerCallback(name, callback)

      return () => {
        Performance.unregisterCallback(name, callback)
      }
    },
    [name, callback]
  );

  return <DisplayStats {...rest} values={values} />
}

export function DisplayStats({formatAvgValue, values, styles = defaultStyles, graphWidth = defaultGraphWidth, graphHeight = defaultGraphHeight, style, ...rest}) {

  const draw = useCallback(
    (ctx, element) => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
      
      ctx.fillStyle = '#00FFFF';

      const maxValue = Math.max(...values);
      
      values.map((value, index) => {
        const height = (graphHeight * value) / maxValue;

        const x = index;
        const y = ctx.canvas.height;
        const width = 1;
        
        ctx.fillRect(x, y, width, -height);
      });
    },
    [values]
  );

  const _style = useMemo(
    () => ({...style, "--graphWidth": `${graphWidth}px`, "--graphHeight": `${graphHeight}px`}),
    [graphWidth, graphHeight, style]
  )

  return <div className={styles.root} style={_style} {...rest}>
    {formatAvgValue(values)}
    <Canvas draw={draw} width={graphWidth} className={styles.graph} height={graphHeight} />
  </div>
}
