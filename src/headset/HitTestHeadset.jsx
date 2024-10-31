import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useXRInputSourceEvent, useXRInputSourceState, useXRStore } from '@react-three/xr'

import { Reticle } from '../components/Reticle'
import { HANDEDNESS, validateSurface } from '../common/HitTest'
import { GAME_STATES, useGame } from '../stores/useGame'

const HitTestHeadset = ({ hitTestSuccess, ref_game_board }) => {
  const refs = {
    left_reticle: useRef(),
    right_reticle: useRef()
  }

  const phase = useGame(state => state.phase)
  const xr_store = useXRStore()
  const controller_right = useXRInputSourceState('controller', 'right')

  useXRInputSourceEvent(
    'all',
    'select',

    e => {
      if (phase === GAME_STATES.HIT_TEST) {
        const result = validateSurface(
          e.inputSource.handedness === HANDEDNESS.LEFT
            ? refs.left_reticle
            : refs.right_reticle
        )

        if (hitTestSuccess && result) {
          hitTestSuccess(result.toArray())
        }
      }
    },

    [phase]
  )

  useFrame(() => {
    if (phase !== GAME_STATES.HIT_TEST || !ref_game_board || !ref_game_board.current) return

    const a_button = controller_right?.gamepad?.['a-button']

    if (ref_game_board.current.visible && a_button?.state === 'pressed') {
      xr_store.setController()
      xr_store.setHand()

      useGame.setState({ phase: GAME_STATES.READY })
    }
  })

  return phase === GAME_STATES.HIT_TEST
    ? <>
      <Reticle handedness={HANDEDNESS.RIGHT} ref_reticle={refs.right_reticle} scale={[30, 30, 30]} />
      <Reticle handedness={HANDEDNESS.LEFT} ref_reticle={refs.left_reticle} scale={[30, 30, 30]} />
    </>
    : null
}

export { HitTestHeadset }