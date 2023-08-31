import React from 'react';
import {scaleLength} from 'components/game/GameConsts';

//Helpers
import formatDistanceSI from 'helpers/string/format-distance-si';
import { SystemMapRendererProps } from './types';
import { RenderCircle, RenderRectangle, RenderText } from './primitives';



//The component
export default function SystemMapSVGRenderer({renderPrimitives, styles, x, y, zoom, width, height, options, ...rest}: SystemMapRendererProps) {
  if(!height) {
    return null;
  }

  return <div
      className={styles.systemMapWrapper}
      {...rest}
    >
      <svg className={styles.systemMap}>
        {renderPrimitives.map(primitive => {
          switch(primitive.t) {
            case 'circle': {
              const circle = primitive as RenderCircle;

              return <circle
                className={`${styles[circle.type]} ${styles[circle.subType]}`}
                cx={circle.x}
                cy={circle.y}
                r={circle.r}
                opacity={circle.opacity}
                key={circle.id}
              />
            }
            case 'text': {
              const text = primitive as RenderText;

              return <text
                className={`${styles[text.type]} ${styles[text.subType]}`}
                x={text.x}
                y={text.y}
                fillOpacity={text.opacity}
                key={text.id}
              >
                {text.text}
              </text>;
            }
            case 'rectangle': {
              const rectangle = primitive as RenderRectangle;

              return <rect
                className={`${styles[rectangle.type]} ${styles[rectangle.subType]}`}
                x1={rectangle.x}
                y1={rectangle.y}
                x2={rectangle.x + rectangle.width}
                y2={rectangle.y + rectangle.height}
                key={rectangle.id}
                opacity={rectangle.opacity}
              />
            }
            default:
              debugger;//shouldn't happen!
              return null;
          }

        })}
        <g transform={`translate(16, ${height - 16})`}>
          <text x="5.5" y="-5.5" fill="#FFF">{formatDistanceSI(scaleLength / zoom, 1, 3)}</text>
          <line x1="0.5" y1="0.5" x2="0.5" y2="-4.5" stroke="#FFF" />
          <line x1="0.5" y1="0.5" x2={scaleLength + 0.5} y2="0.5" stroke="#FFF" />
          <line x1={scaleLength + 0.5} y1="0.5" x2={scaleLength + 0.5} y2="-4.5" stroke="#FFF" />
        </g>
      </svg>
    </div>
}
