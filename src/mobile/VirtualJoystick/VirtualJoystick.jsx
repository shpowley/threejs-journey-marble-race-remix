import { useCallback, useEffect, useRef } from 'react'
import { getJoysticks, JoystickArea } from '@manapotion/react'

import { useStoreControls } from '../../stores/useStoreControls'
import { GAME_STATES, useStoreGame } from '../../stores/useStoreGame'
import { RESOURCE } from '../../common/Constants'
import './joystick.css'

const MAX_DISTANCE = 60

const VirtualJoystick = () => {
  const refs = {
    joystick: {
      joystick_area: useRef(),
      origin: useRef(),
      follow: useRef(),
      knob: useRef()
    }
  }

  const data = {
    is_touching: useRef(false)
  }

  const setPosition = useStoreControls(state => state.setPosition)

  const
    // NEEDED FOR MANAPOTION VIRTUAL JOYSTICK WITH "FOLLOW" MODE TO DEAL WITH AREA BELOW THE JoystickArea <div>
    // - INITIAL TOUCH (NO JUMP ALLOWED), BUT SOMETIMES YES..
    touchStartPreventJump = useCallback(e => {
      if (!data.is_touching.current) {
        e.stopPropagation()
      }
    }, []),

    update = useCallback((x, y) => {
      // "SYMMETIC MIN-MAX NORMALIZATION" VALUES FROM [-1 TO 1]
      setPosition(x / MAX_DISTANCE, y / MAX_DISTANCE)
    }, []),

    handlerStart = useCallback(joystick => {
      update(joystick.current.x - joystick.follow.x, joystick.current.y - joystick.follow.y)
      setTimeout(() => data.is_touching.current = true, 100) // SLIGHT DELAY OTHERWISE TOUCH TRIGGERS JUMP

      refs.joystick.follow.current.style.transform = `translate(${joystick.follow.x}px, ${-joystick.follow.y}px)`
      refs.joystick.knob.current.style.transform = `translate(${joystick.current.x}px, ${-joystick.current.y}px)`

      refs.joystick.origin.current.style.opacity = '0'
      refs.joystick.follow.current.style.opacity = '1'
      refs.joystick.knob.current.style.opacity = '1'
    }, []),

    handlerEnd = useCallback(() => {
      setPosition(0, 0)
      data.is_touching.current = false

      refs.joystick.origin.current.style.opacity = '1'
      refs.joystick.follow.current.style.opacity = '0'
      refs.joystick.knob.current.style.opacity = '0'
    }, []),

    handlerMove = useCallback(joystick => {
      update(joystick.current.x - joystick.follow.x, joystick.current.y - joystick.follow.y)

      refs.joystick.follow.current.style.transform = `translate(${joystick.follow.x}px, ${-joystick.follow.y}px)`
      refs.joystick.knob.current.style.transform = `translate(${joystick.current.x}px, ${-joystick.current.y}px)`
    }, [])

  useEffect(() => {
    // WORKAROUND AS MANAPOTION <JoystickArea> DOESN'T EXPOSE UNDERLYING 'onTouchStart'
    refs.joystick.joystick_area.current?.addEventListener('touchstart', touchStartPreventJump)

    const cleanupSubscribeGameState = useStoreGame.subscribe(
      state => state.phase,

      phase => {
        if (phase !== GAME_STATES.PLAYING) {
          data.is_touching.current = false
        }
      }
    )

    return () => {
      refs.joystick.joystick_area.current?.removeEventListener('touchstart', touchStartPreventJump)
      cleanupSubscribeGameState()
    }
  }, [])

  return <JoystickArea
    ref={refs.joystick.joystick_area}
    mode='follow'
    joystick={getJoysticks().movement}
    containerProps={{ id: 'joystick_container' }}
    onStart={handlerStart}
    onEnd={handlerEnd}
    onMove={handlerMove}
    maxFollowDistance={MAX_DISTANCE}
  >
    <img
      ref={refs.joystick.origin}
      id='joystick_origin'
      src={RESOURCE.JOYSTICK.ORIGIN}
    />
    <img
      ref={refs.joystick.follow}
      id='joystick_follow'
      src={RESOURCE.JOYSTICK.FOLLOW}
    />
    <img
      ref={refs.joystick.knob}
      id='joystick_knob'
      src={RESOURCE.JOYSTICK.KNOB}
    />
  </JoystickArea>
}

export { VirtualJoystick }