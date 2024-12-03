import { useEffect, useRef } from 'react'
import { useXRHitTest, useXRInputSourceEvent, useXRStore } from '@react-three/xr'

import { HANDEDNESS, onResults, validateSurface } from '../common/HitTest'
import { GAME_STATES, useStoreGame } from '../stores/useStoreGame'
import { Reticle } from '../components/Reticle'

const HitTestActive = ({ hitTestSuccess }) => {
  const refs = {
    reticle: useRef()
  }

  const phase = useStoreGame(state => state.phase)
  const xr_store = useXRStore()

  // SETS UP MOBILE DEVICE CONTINUOUS HIT-TESTING
  // - store.setScreen() METHOD REQUIRES TOUCHING THE SCREEN TO TRIGGER HIT-TEST..
  useXRHitTest(onResults.bind(null, HANDEDNESS.SCREEN), 'viewer')

  useXRInputSourceEvent(
    'all',
    'select',

    e => {
      if (phase === GAME_STATES.HIT_TEST) {
        const result = validateSurface(refs.reticle)

        if (hitTestSuccess && result) {
          hitTestSuccess(result.toArray())
        }
      }
    },

    [phase]
  )

  useEffect(() => {
    // DISABLES CONTINUOUS HIT-TEST WHEN THIS COMPONENT UNMOUNTS
    return () => {
      xr_store?.setScreenInput(false)
    }
  }, [])

  return <Reticle
    handedness={HANDEDNESS.SCREEN}
    ref_reticle={refs.reticle}
  />
}

const HitTestMobile = ({ hitTestSuccess }) => {
  const phase = useStoreGame(state => state.phase)

  return phase === GAME_STATES.HIT_TEST
    ? <HitTestActive hitTestSuccess={hitTestSuccess} />
    : null
}

export { HitTestMobile }