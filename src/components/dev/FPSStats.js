import { useMemo, useCallback, useState, useEffect, useRef } from "react";

import Performance from "classes/Performance";

//Hooks
import useAnimationFrame from "hooks/useAnimationFrame";

//Other
import defaultStyles from './FPSStats.module.scss';

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
  const graphItems = useMemo(
    () => {
      const maxValue = Math.max(...values);

      return values.map((value, index) => {
        const height = (graphHeight * value) / maxValue;

        var graphItemStyle = {
          right: (values.length -1 - index) + 'px',
          height: height + 'px',
        };

        return <div key={`item-${index}`} className={styles.graphItem} style={graphItemStyle} />;
      });
    },
    [values, styles]
  );

  const _style = useMemo(
    () => ({...style, "--graphWidth": `${graphWidth}px`, "--graphHeight": `${graphHeight}px`}),
    [graphWidth, graphHeight, style]
  )

  return <div className={styles.root} style={_style} {...rest}>
    {formatAvgValue(values)}
    <div className={styles.graph}>
      {graphItems}
    </div>
  </div>
}

// const graphHeight = 29;
// const graphWidth = 70;


// export default class FPSStats extends Component {
//   constructor(props) {
//     super(props);

//     var currentTime = +new Date();

//     this.state = {
//       frames: 0,
//       startTime: currentTime,
//       prevTime: currentTime,
//       fps: []
//     }
//   }

//   shouldComponentUpdate(nextProps, nextState) {
//     return this.state.fps !== nextState.fps;
//   }

//   componentDidMount() {
//     if (!this.props.isActive) {
//       return;
//     }

//     var onRequestAnimationFrame = () => {
//       this.calcFPS();

//       window.requestAnimationFrame(onRequestAnimationFrame);
//     };

//     window.requestAnimationFrame(onRequestAnimationFrame);
//   }

//   calcFPS() {
//     var currentTime = +new Date();

//     this.setState({
//       frames: this.state.frames + 1
//     });

//     if (currentTime > this.state.prevTime + 1000) {
//       var fps = Math.round(
//         (this.state.frames * 1000) / (currentTime - this.state.prevTime)
//       );

//       fps = this.state.fps.concat(fps);
//       var sliceStart = fps.length - graphWidth;

//       if (sliceStart < 0) {
//         sliceStart = 0;
//       }

//       fps = fps.slice(sliceStart, fps.length);

//       this.setState({
//         fps: fps,
//         frames: 0,
//         prevTime: currentTime
//       });
//     }
//   }

//   render() {
//     if (!this.props.isActive) {
//       return null;
//     }

//     var maxFps = Math.max.apply(Math.max, this.state.fps);

//     var graphItems = this.state.fps.map((fps, i) => {
//       var height = (graphHeight * fps) / maxFps;

//       var graphItemStyle = {
//         right: (this.state.fps.length -1 - i) + 'px',
//         height: height + 'px',
//       };

//       return (
//         <div key={`fps-${i}`} className={styles.graphItem} style={graphItemStyle} />
//       );
//     });

//     return <div className={styles.root} styles={{"--graphWidth": `${graphWidth}px`, "--graphHeight": `${graphHeight}px`}}>
//       {this.state.fps[this.state.fps.length - 1]} FPS
//       <div className={styles.graph}>
//         {graphItems}
//       </div>
//     </div>
//   }
// };

// FPSStats.defaultProps = {
//   isActive: true,
  
// };
