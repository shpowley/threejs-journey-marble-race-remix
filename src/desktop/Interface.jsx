import { useEffect, useRef } from 'react'
import { addEffect } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'

import { useGame, GAME_STATES } from '../stores/useGame.js'

const Interface = () => {
  const ref_time = useRef()

  const controls = useKeyboardControls(state => state)

  const
    restartGame = useGame(state => state.restartGame),
    phase = useGame(state => state.phase)

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

  return <div id='interface'>

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
      >
        Restart
      </div>
    }

    {/* KEYBOARD CONTROLS */}
    <div className='controls'>
      <div className='raw'>
        <div className={`key${controls.forward ? ' active' : ''}`}></div>
      </div>
      <div className='raw'>
        <div className={`key${controls.left ? ' active' : ''}`}></div>
        <div className={`key${controls.backward ? ' active' : ''}`}></div>
        <div className={`key${controls.right ? ' active' : ''}`}></div>
      </div>
      <div className='raw'>
        <div className={`key large${controls.jump ? ' active' : ''}`}></div>
      </div>
    </div>
  </div>
}

export { Interface }