// BASED ON TOUCH INTERACTION EXAMPLE
// https://pmndrs.github.io/xr/docs/tutorials/custom-inputs
// https://immersive-web.github.io/webxr-hand-input/#xrhand-interface (useful diagram of hand skeletal joints)
import { Suspense, useEffect, useRef } from 'react'

import {
  useTouchPointer, useXRInputSourceStateContext,
  PointerCursorModel,
  XRHandModel, XRSpace
} from '@react-three/xr'

import { useStoreRefs } from '../stores/useStoreRefs'

const HandWithPointer = () => {
  const refs = {
    joint_index_finger: useRef()
  }

  const
    state = useXRInputSourceStateContext('hand'),
    pointer_index = useTouchPointer(refs.joint_index_finger, state)

  useEffect(() => {
    // STORE THE LEFT INDEX FINGER <XRSpace> REFERENCE (TRACK FINGER TIP LOCATION FOR VIRTUAL JOYSTICK)
    if (state.inputSource.handedness === 'left' && refs.joint_index_finger.current) {
      useStoreRefs.setState({ xr_space_left_index: refs.joint_index_finger.current })
    }
  }, [])

  return <>
    <XRSpace
      ref={refs.joint_index_finger}
      space={'index-finger-tip'}
    />

    <Suspense>
      <XRHandModel />
    </Suspense>

    <PointerCursorModel
      pointer={pointer_index}
      opacity={0}
    />
  </>
}

export { HandWithPointer }