import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';

//Components
import Button from 'components/ui/Button';
import Time from 'components/format/Time';

//Hooks
import { useClientStateContext } from './ClientStateContext';

//Other
import styles from './TimeControls.module.scss';
import { GameSpeeds } from 'types/game/shared/game';

type TimeControlsProps = {
  setIsPaused: (isPaused: boolean) => void;
  setDesiredSpeed: (desiredSpeed: GameSpeeds) => void;
};


//The component
export default function TimeControls({setIsPaused, setDesiredSpeed}: TimeControlsProps) {
    const isPaused = useClientStateContext(state => state.isPaused);
    const desiredGameSpeed = useClientStateContext(state => state.desiredGameSpeed);
    const gameTime = useClientStateContext(state => state.gameTime);

    const gameTimeDate = useMemo(
      () => {
        return new Date(gameTime*1000)
      },
      [gameTime]
    )

    return <div className={styles.root}>
      <div className={styles.buttons}>
        <Button selected={!!isPaused} onClick={() => setIsPaused(!isPaused)}>
          <span className="offscreen"><Trans id="toolbar.togglePaused">Toggle paused game</Trans></span>
          <FontAwesomeIcon icon={solid('pause')} />
        </Button>

        <Button selected={desiredGameSpeed === 1} onClick={() => setDesiredSpeed(1)}>
          <span className="offscreen"><Trans id="toolbar.realTime">Play at real time</Trans></span>
          <FontAwesomeIcon icon={solid('play')} /> x 1
        </Button>

        <Button selected={desiredGameSpeed === 2} onClick={() => setDesiredSpeed(2)}>
          <span className="offscreen"><Trans id="toolbar.x60">Play at 1 minute per second</Trans></span>
          <FontAwesomeIcon icon={solid('play')} /> x 60
        </Button>

        <Button selected={desiredGameSpeed === 3} onClick={() => setDesiredSpeed(3)}>
          <span className="offscreen"><Trans id="toolbar.x3600">Play at 1 hour per second</Trans></span>
          <FontAwesomeIcon icon={solid('play')} /> x 3600
        </Button>

        <Button selected={desiredGameSpeed === 4} onClick={() => setDesiredSpeed(4)}>
          <span className="offscreen"><Trans id="toolbar.x86400">Play at 1 day per second</Trans></span>
          <FontAwesomeIcon icon={solid('play')} /> x 86400
        </Button>

        <Button selected={desiredGameSpeed === 5} onClick={() => setDesiredSpeed(5)}>
          <span className="offscreen"><Trans id="toolbar.604800">Play at 1 week per second</Trans></span>
          <FontAwesomeIcon icon={solid('play')} /> x 604800 
        </Button>
        
      </div>
      <Time value={gameTimeDate} format="datetime" className={styles.time} />
    </div>
}