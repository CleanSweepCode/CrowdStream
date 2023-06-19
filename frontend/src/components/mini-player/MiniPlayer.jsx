import React, { forwardRef, useImperativeHandle, useCallback, useEffect, useRef, useState } from 'react';

import Placeholder from './placeholder';
import PlayerControls from './PlayerControls';

import { CONTROLS, POSITION } from './config';
import { isElementInViewport } from './utils';

import './MiniPlayer.css';

const CORNER_SPACE = 32;
const DEFAULT_POSITION = 'auto';
const TRANSITION = '200ms ease-in-out';

const MiniPlayer = forwardRef((props, ref) => {
  const { IVSPlayer } = window;
  const { isPlayerSupported } = IVSPlayer;

  const {
    controls = [CONTROLS.mute, CONTROLS.close, CONTROLS.resize],
    position = POSITION.bottomRight,
    height = 154,
    width = 274,
    transition,
  } = props;
  var streamURL = ""

  const [loading, setLoading] = useState(true);
  const [isMiniPlayer, setIsMiniPlayer] = useState(true);
  const [muted, setMuted] = useState(false);

  const [playerPosition, setPlayerPosition] = useState({});
  const [playerSize, setPlayerSize] = useState({});

  const player = useRef(null);
  const playerBaseEl = useRef(null);
  const videoEl = useRef(null);
  const visibleRef = useRef(null);

  useImperativeHandle(ref, () => ({
    setURL(streamUrlFromChild) {
      console.log("Setting new player URL: " + streamUrlFromChild);
      streamURL = streamUrlFromChild;
      player.current.load(streamUrlFromChild);
    },
    log() {
      console.log("Reloaded");
      reload();
    }
  }));



  // handle case when autoplay with sound is blocked by browser
  useEffect(() => {
    if (!player.current) return;

    //setMuted(player.current.isMuted());
  }, [loading]);

  // start onPlayerReady function
  useEffect(() => {
    if (player.current !== null) {
      props.onPlayerReady();
    }
  }, [player.current, props.onPlayerReady]);

  const updatePlayer = useCallback(
    (isMini) => {
      let top = DEFAULT_POSITION;
      let right = DEFAULT_POSITION;
      let bottom = DEFAULT_POSITION;
      let left = DEFAULT_POSITION;

      let targetPosition = 0;
      let targetHeight = '100%';
      let targetWidth = '100%';

      if (isMini) {
        targetPosition = `${CORNER_SPACE}px`;
        targetHeight = `${height}px`;
        targetWidth = `${width}px`;
      }

      switch (position) {
        case POSITION.topLeft:
          top = targetPosition;
          left = targetPosition;

          break;
        case POSITION.topRight:
          top = targetPosition;
          right = targetPosition;

          break;
        case POSITION.bottomLeft:
          bottom = targetPosition;
          left = targetPosition;

          break;
        default:
          bottom = targetPosition;
          right = targetPosition;
      }

      setPlayerSize({
        height: targetHeight,
        width: targetWidth,
      });
      setPlayerPosition({
        top,
        right,
        bottom,
        left,
      });
    },
    [height, width, position],
  );

  useEffect(() => {
    const { ENDED, PLAYING, READY } = IVSPlayer.PlayerState;
    const { ERROR } = IVSPlayer.PlayerEventType;

    if (!isPlayerSupported) {
      console.warn(
        'The current browser does not support the Amazon IVS player.',
      );

      return;
    }

    const onStateChange = () => {
      const playerState = player.current.getState();

      console.log(`Player State - ${playerState}`);
      setLoading(playerState !== PLAYING);
    };

    const onError = (err) => {
      console.warn('Player Event - ERROR:', err);
    };

    player.current = IVSPlayer.create();
    player.current.attachHTMLVideoElement(videoEl.current);
    player.current.load(streamURL);
    player.current.play();

    player.current.addEventListener(READY, onStateChange);
    player.current.addEventListener(PLAYING, onStateChange);
    player.current.addEventListener(ENDED, onStateChange);
    player.current.addEventListener(ERROR, onError);

    return () => {
      player.current.removeEventListener(READY, onStateChange);
      player.current.removeEventListener(PLAYING, onStateChange);
      player.current.removeEventListener(ENDED, onStateChange);
      player.current.removeEventListener(ERROR, onError);
    };
  }, [IVSPlayer, isPlayerSupported, streamURL]);

  useEffect(() => {
    const onVisibilityChange = () => {
      const visible = true

      if (visible === visibleRef.current) return;

      visibleRef.current = visible;

      if (visible && player.current.isPaused()) {
        player.current.play();
      }

      if (!visible) {
        const playerRect = playerBaseEl.current.getBoundingClientRect();
        setPlayerSize({
          height: `${playerRect.height}px`,
          width: `${playerRect.width - CORNER_SPACE}px`,
        });
      }

      setTimeout(() => {
        setIsMiniPlayer(!visible);
      }, 100);
    };

    if (!isPlayerSupported) {
      return;
    }

    onVisibilityChange();
    updatePlayer(visibleRef.current);

    //window.addEventListener('scroll', onVisibilityChange);
    window.addEventListener('resize', onVisibilityChange);

    return () => {
      //window.removeEventListener('scroll', onVisibilityChange);
      window.removeEventListener('resize', onVisibilityChange);
    };
  }, [isPlayerSupported, updatePlayer]);

  useEffect(() => {
    updatePlayer(isMiniPlayer);
  }, [isMiniPlayer, updatePlayer]);

  const close = () => {
    player.current.pause();
    setIsMiniPlayer(false);
  };

  const resize = () => {
    const { offsetLeft, offsetTop } = playerBaseEl.current;

    window.scrollTo({
      top: offsetTop - 20,
      left: offsetLeft,
      behavior: 'smooth',
    });
  };

  // function to reload miniplayer
  const reload = async () => {
    var delaySeconds = 1;
    var maxAttempts = 20;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (player.current.getState() == "Playing") {
        console.log("NEVER CALL AGAIN");
        return;
      } else {
        console.log("attempt: " + attempt);
        console.log("player.current.getState: " + player.current.getState());
        console.log(streamURL)
        player.current.load(streamURL);
        player.current.play();
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
      }
    }
  };


  const toggleMute = () => {
    const shouldMute = !player.current.isMuted();

    player.current.setMuted(shouldMute);
    setMuted(shouldMute);
  };

  if (!isPlayerSupported) {
    return null;
  }

  const { top, right, bottom, left } = playerPosition;

  return (
    <div className="MiniPlayer" ref={playerBaseEl}>
      <div className="MiniPlayer-videoBox">
        <Placeholder loading={loading} />

        <div
          className={`MinPlayer-video`}
          style={{
            top,
            right,
            bottom,
            left,
            width: `${playerSize.width}`,
            height: `${playerSize.height}`,
            transition:
              transition && isMiniPlayer
                ? `height ${TRANSITION}, width ${TRANSITION}`
                : 'none',
          }}
        >
          <video ref={videoEl} playsInline></video>

        </div>
      </div>
    </div>
  );
});

export default MiniPlayer;
