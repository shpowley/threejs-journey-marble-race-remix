import { useCallback, useEffect, useRef } from 'react'
import { addEffect } from '@react-three/fiber'
import { Joystick } from 'react-joystick-component'

import { useGame, GAME_STATES } from '../stores/useGame.js'
import { useControls } from '../stores/useControls.js'

import SVG_FULLSCREEN from '/fullscreen.svg'
import SVG_FULLSCREEN_EXIT from '/fullscreen_exit.svg'

const InterfaceMobile = () => {
  const
    ref_time = useRef(),
    ref_fullscreen = useRef()

  const
    restartGame = useGame(state => state.restartGame),
    phase = useGame(state => state.phase)

  const
    setPosition = useControls(state => state.setPosition),
    setJump = useControls(state => state.setJump)

  const
    joystickMove = useCallback(data => {
      setPosition(data.x, data.y)
    }, []),

    joystickStop = useCallback(() => {
      setPosition(0, 0)
    }, []),

    // TRIGGERS "JUMP" useEffect()
    // AND QUICKLY TOGGLING ALLOWS SUBSEQUENT JUMPS
    jump = useCallback(() => {
      setJump(true)
      setJump(false)
    }, []),

    fullscreenToggle = useCallback(() => {
      if (document.fullscreenElement) {
        ref_fullscreen.current.src = SVG_FULLSCREEN
        document.exitFullscreen()
      }
      else {
        ref_fullscreen.current.src = SVG_FULLSCREEN_EXIT
        document.documentElement.requestFullscreen()
      }
    }, [])

  // UPDATE GAME TIMER
  useEffect(() => {

    // 'addEffect' ALLOWS ADDING A CALLBACK EXECUTED EACH FRAME OUTSIDE THE <Canvas> COMPONENT
    const cleanupEffect = addEffect(() => {
      const { phase, start_time, end_time } = useGame.getState()

      let elapsed_time = 0

      if (phase === GAME_STATES.PLAYING) {
        elapsed_time = Date.now() - start_time
      }
      else if (phase === GAME_STATES.ENDED) {
        elapsed_time = end_time - start_time
      }

      // CONVERT TO SECONDS
      elapsed_time /= 1000
      elapsed_time = elapsed_time.toFixed(2)

      // UPDATE THE TIME DISPLAY
      if (ref_time.current) {
        ref_time.current.textContent = elapsed_time
      }
    })

    return () => {
      cleanupEffect()
    }
  }, [])

  return <div className='interface'>

    {/* QUICK SETTINGS */}
    <div id='quick-settings'>
      {
        document.fullscreenEnabled &&
        <div id='fullscreen'>
          <img
            ref={ref_fullscreen}
            src={SVG_FULLSCREEN}
            className='animate-scale'
            onClick={fullscreenToggle}
          />
        </div>
      }
    </div>

    {/* GAME TIMER */}
    <div
      ref={ref_time}
      className='time'
    >
      0.00
    </div>

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
    <div
      id='touch-controls-container'
      onTouchStart={jump}
    >
      {/* e.stopPropagation() PREVENTS TOUCHING THE JOYSTICK AND TRIGGERING JUMP */}
      <div
        id='touch-joystick'
        onTouchStart={e => e.stopPropagation()}
      >
        <Joystick
          baseColor={'#00000000'}
          stickColor={'#ececec'}
          size={120}
          stickSize={80}
          throttle={100}

          move={joystickMove}
          stop={joystickStop}
        />
      </div>
    </div>
  </div>
}

export default InterfaceMobile