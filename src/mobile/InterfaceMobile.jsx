import { useCallback, useEffect, useRef } from 'react'
import { addEffect } from '@react-three/fiber'

import { useStoreGame, GAME_STATES } from '../stores/useStoreGame.js'
import { useStoreControls } from '../stores/useStoreControls.js'
import { RESOURCE, XR_MODE } from '../common/Constants.js'
import { VirtualJoystick } from './VirtualJoystick/VirtualJoystick.jsx'

const InterfaceMobile = ({ store = null, xr_visibility = null, xr_overlay = false, ar_play_button_visible = false }) => {
  const refs = {
    time: useRef(),
    fullscreen: useRef()
  }

  const
    restartGame = useStoreGame(state => state.restartGame),
    phase = useStoreGame(state => state.phase),
    game_playing_mode = [GAME_STATES.READY, GAME_STATES.PLAYING, GAME_STATES.ENDED].includes(phase)

  const setJump = useStoreControls(state => state.setJump)

  const

    // NOTE: TOGGLING TRUE => FALSE IS REQUIRED TO TRIGGER ZUSTAND "JUMP" SUBSCRIPTION
    jump = useCallback(() => {
      setJump(true)
      setTimeout(() => setJump(false), 200)
    }, []),

    fullscreenToggle = useCallback(() => {
      if (document.fullscreenElement) {
        refs.fullscreen.current.src = RESOURCE.ICON_FULLSCREEN
        document.exitFullscreen()
      }
      else {
        refs.fullscreen.current.src = RESOURCE.ICON_FULLSCREEN_EXIT
        document.documentElement.requestFullscreen()
      }
    }, []),

    enterAR = () => {
      refs.fullscreen.current.src = RESOURCE.ICON_FULLSCREEN
      store.enterAR()
    },

    xrModeToggle = () => xr_visibility
      ? store.getState().session.end()
      : enterAR(),

    hitTestPlay = () => useStoreGame.setState({ phase: GAME_STATES.READY })

  // UPDATE GAME TIMER
  useEffect(() => {

    // 'addEffect' ALLOWS ADDING A CALLBACK EXECUTED EACH FRAME OUTSIDE THE <Canvas> COMPONENT
    const cleanupEffect = addEffect(() => {
      const { phase, start_time, end_time } = useStoreGame.getState()

      let elapsed_time = 0

      switch (phase) {
        case GAME_STATES.READY:
          refs.time.current.textContent = '0.00'
          return

        case GAME_STATES.PLAYING:
          elapsed_time = Date.now() - start_time
          break

        case GAME_STATES.ENDED:
          elapsed_time = end_time - start_time
          break

        case GAME_STATES.HIT_TEST:
          return
      }

      // CONVERT TO SECONDS
      elapsed_time /= 1000
      elapsed_time = elapsed_time.toFixed(2)

      // UPDATE THE TIME DISPLAY
      if (refs.time.current) {
        refs.time.current.textContent = elapsed_time
      }
    })

    return () => {
      cleanupEffect()
    }
  }, [])

  return <div id='interface' >

    {/* QUICK SETTINGS */}
    <div id='quick-settings'>
      {
        navigator?.xr?.isSessionSupported(XR_MODE.AR) &&
        <div id='xr_mode'>
          <img
            src={xr_visibility ? RESOURCE.ICON_XR_EXIT : RESOURCE.ICON_XR_MODE}
            className='animate-scale'
            onClick={xrModeToggle}
          />
        </div>
      }

      {
        !xr_overlay &&
        <div id='fullscreen'>
          <img
            ref={refs.fullscreen}
            src={RESOURCE.ICON_FULLSCREEN}
            className='animate-scale'
            onClick={fullscreenToggle}
          />
        </div>
      }
    </div>

    {/* GAME TIMER */}
    {
      game_playing_mode &&
      <div
        ref={refs.time}
        className='time'
      >
        0.00
      </div>
    }

    {/* RESTART BUTTON */}
    {
      phase === GAME_STATES.ENDED &&
      <div
        className='restart'
        onClick={restartGame}
        onTouchStart={e => e.stopPropagation()}
      >
        Restart
      </div>
    }

    {/* CONTROLS: VIRTUAL JOYSTICK + JUMP */}
    {
      game_playing_mode &&
      <div
        id='touch-controls-container'
        onTouchStart={jump}
      >
        <VirtualJoystick />
      </div>
    }

    {/* HIT-TEST INSTRUCTIONS */}
    {
      phase === GAME_STATES.HIT_TEST &&
      <div id='hit-test-instructions'>
        1 - aim with the targeting reticle<br />
        2 - choose a flat surface (floor, table, etc.)<br />
        3 - place obstacle course (tap screen)<br />
        4 - press "play"
      </div>
    }

    {/* HIT-TEST PLAY BUTTON */}
    {
      phase === GAME_STATES.HIT_TEST && ar_play_button_visible &&
      <button
        id='hit-test-play'
        onClick={hitTestPlay}
      >
        PLAY
      </button>
    }
  </div>
}

export { InterfaceMobile }